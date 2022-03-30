import { WithdrawalRequest } from 'redux/portfolio/v3Portfolio.types';
import { memo, useCallback, useMemo, useState } from 'react';
import { wait } from 'utils/pureFunctions';
import { Modal } from 'components/modal/Modal';
import { Button } from 'components/button/Button';
import { ProgressBar } from 'components/progressBar/ProgressBar';
import useAsyncEffect from 'use-async-effect';
import { fetchWithdrawalRequestOutputBreakdown } from 'services/web3/v3/portfolio/withdraw';
import { bntToken, getNetworkVariables } from 'services/web3/config';
import { useAppSelector } from 'redux/index';
import { Token } from 'services/observables/tokens';
import { getTokenById } from 'redux/bancor/bancor';
import BigNumber from 'bignumber.js';
import { prettifyNumber } from 'utils/helperFunctions';
import { Image } from 'components/image/Image';
import { ReactComponent as IconCheck } from 'assets/icons/circlecheck.svg';
import { useApproveModal } from 'hooks/useApproveModal';
import { ContractsApi } from 'services/web3/v3/contractsApi';

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  withdrawRequest: WithdrawalRequest;
  withdraw: () => Promise<void>;
  openCancelModal: (req: WithdrawalRequest) => void;
}

export const V3WithdrawConfirmModal = memo(
  ({
    isModalOpen,
    setIsModalOpen,
    withdrawRequest,
    withdraw,
    openCancelModal,
  }: Props) => {
    const [outputBreakdown, setOutputBreakdown] = useState({
      tkn: 0,
      bnt: 0,
    });
    const [txBusy, setTxBusy] = useState(false);
    const { token, reserveTokenAmount, poolTokenAmount } = withdrawRequest;
    const govToken = useAppSelector<Token | undefined>((state: any) =>
      getTokenById(state, getNetworkVariables().govToken)
    );
    const isBntToken = useMemo(() => token.address === bntToken, [token]);

    const missingGovTokenBalance = useMemo(() => {
      if (!isBntToken) {
        return 0;
      }
      return new BigNumber(poolTokenAmount)
        .minus(govToken?.balance || 0)
        .toNumber();
    }, [govToken?.balance, isBntToken, poolTokenAmount]);

    useAsyncEffect(async () => {
      if (!isModalOpen) {
        return;
      }

      const res = await fetchWithdrawalRequestOutputBreakdown(withdrawRequest);
      setOutputBreakdown(res);
    }, [withdrawRequest, isModalOpen]);

    const onModalClose = useCallback(() => {
      setIsModalOpen(false);
      setOutputBreakdown({ tkn: 0, bnt: 0 });
    }, [setIsModalOpen]);

    const handleCTAClick = useCallback(async () => {
      setTxBusy(true);
      try {
        await withdraw();
      } catch (e) {
        console.error(e);
      } finally {
        onModalClose();
        setTxBusy(false);
      }
    }, [onModalClose, withdraw]);

    const handleCancelClick = useCallback(async () => {
      onModalClose();
      await wait(400);
      openCancelModal(withdrawRequest);
    }, [onModalClose, openCancelModal, withdrawRequest]);

    const approveTokens = useMemo(() => {
      const tokensToApprove = [];
      if (token.address === bntToken) {
        tokensToApprove.push({
          amount: poolTokenAmount,
          token: {
            ...token,
            address: govToken?.address ?? '',
            symbol: govToken?.symbol ?? 'vBNT',
          },
        });
      }

      return tokensToApprove;
    }, [govToken?.address, govToken?.symbol, reserveTokenAmount, token]);

    const [onStart, ModalApprove] = useApproveModal(
      approveTokens,
      handleCTAClick,
      ContractsApi.BancorNetwork.contractAddress
    );

    return (
      <Modal
        title="Withdraw"
        isOpen={isModalOpen}
        setIsOpen={onModalClose}
        large
      >
        <div className="p-20 md:p-30 space-y-20">
          {ModalApprove}
          <div className="pb-10">
            <div className="text-12 font-semibold mb-10">Amount</div>
            <div className="flex items-center">
              <Image
                alt={'Token Logo'}
                className="w-40 h-40 rounded-full mr-10"
                src={token.logoURI}
              />
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center">
                  <div className="text-[36px]">
                    {prettifyNumber(withdrawRequest.reserveTokenAmount)}
                  </div>
                  <span className="ml-10">{token.symbol}</span>
                </div>

                <div className="text-secondary">
                  {prettifyNumber(
                    new BigNumber(withdrawRequest.reserveTokenAmount)
                      .times(token.usdPrice)
                      .toString(),
                    true
                  )}
                </div>
              </div>
            </div>
          </div>

          {outputBreakdown.bnt > 0 && !isBntToken && (
            <div>
              <div className="text-12 font-semibold">Output Breakdown</div>
              <ProgressBar
                percentage={outputBreakdown.tkn}
                className="text-primary"
              />
              <div className="flex justify-between">
                <div className="text-primary">
                  {outputBreakdown.tkn.toFixed(2)}% {token.symbol}
                </div>
                <div className="text-secondary">
                  {outputBreakdown.bnt.toFixed(2)}% BNT
                </div>
              </div>
            </div>
          )}

          <div className="bg-fog p-20 rounded space-y-20">
            <h3 className="text-20">Cancel withdrawal and earn more!</h3>

            <div className="flex space-x-10">
              <div>
                <IconCheck className="text-green-500 w-18 h-18" />
              </div>
              <div>
                <h4 className="text-14 font-semibold">
                  Claim cooldown rewards
                </h4>
                <p>
                  Your tokens kept growing at a ??% rate after cooldown, if you
                  don’t withdraw you will keep those earnings.
                </p>
              </div>
            </div>
            <div className="flex space-x-10">
              <div>
                <IconCheck className="text-green-500 w-18 h-18" />
              </div>
              <div>
                <h4 className="text-14 font-semibold">Earn 24%</h4>
                <p>
                  Keep your eth earning from trading fees and rewards. Thats
                  over $1000 earnings Auto-compounding for 5 years*
                </p>
              </div>
            </div>
            <div className="flex space-x-10">
              <div>
                <IconCheck className="text-green-500 w-18 h-18" />
              </div>
              <div>
                <h4 className="text-14 font-semibold">Stay 100% protected</h4>
                <p>
                  From the first seconed you will earn with full protection and
                  no risk from Impermanent loss
                </p>
              </div>
            </div>

            <button
              onClick={handleCancelClick}
              className="text-primary text-16 font-semibold"
            >
              Cancel withdrawal and earn {'->'}
            </button>
          </div>

          {missingGovTokenBalance > 0 ? (
            <div className="text-error text-center bg-error bg-opacity-30 rounded p-20">
              <span className="font-semibold">vBNT Balance insufficient.</span>{' '}
              <br />
              To proceed, add {missingGovTokenBalance} {govToken?.symbol} to
              your wallet.
            </div>
          ) : (
            <Button
              onClick={() => onStart()}
              className="w-full"
              disabled={txBusy || missingGovTokenBalance > 0}
            >
              Confirm Withdrawal
            </Button>
          )}
        </div>
      </Modal>
    );
  }
);
