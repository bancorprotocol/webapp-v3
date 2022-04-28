import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { PoolV3 } from 'services/observables/pools';
import { useState } from 'react';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { utils } from 'ethers';
import { useNavigation } from 'services/router';
import { useDispatch } from 'react-redux';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';
import { useAppSelector } from 'store';
import { useApproveModal } from 'hooks/useApproveModal';
import { Modal } from 'components/modal/Modal';
import { SwapSwitch } from 'elements/swapSwitch/SwapSwitch';
import { TokenInputPercentage } from 'components/tokenInputPercentage/TokenInputPercentage';
import { ethToken } from 'services/web3/config';

interface Props {
  pool: PoolV3;
}

export const DepositV3Modal = ({ pool }: Props) => {
  const account = useAppSelector((state) => state.user.account);
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');

  const { pushPortfolio } = useNavigation();
  const dispatch = useDispatch();

  const depositDisabled = !account || !amount || Number(amount) === 0;

  const fieldBalance = pool.reserveToken.balance;

  const deposit = async () => {
    if (!pool.reserveToken.balance || !account || !fieldBalance) {
      return;
    }

    const amountWei = utils.parseUnits(amount, pool.reserveToken.decimals);
    const isETH = pool.reserveToken.address === ethToken;

    try {
      const res = await ContractsApi.BancorNetwork.write.deposit(
        pool.pool_dlt_id,
        amountWei,
        { value: isETH ? amountWei : undefined }
      );
      console.log(res);
      setIsOpen(false);
      pushPortfolio();
      await updatePortfolioData(dispatch, account);
    } catch (e) {
      console.error(e);
    }
  };

  const [onStart, ApproveModal] = useApproveModal(
    [{ amount: fieldBalance || '0', token: pool.reserveToken }],
    deposit,
    ContractsApi.BancorNetwork.contractAddress
  );

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant={ButtonVariant.SECONDARY}
        size={ButtonSize.EXTRASMALL}
      >
        Deposit
      </Button>
      <Modal
        title={'Deposit & Earn'}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
        titleElement={<SwapSwitch />}
        separator
        large
      >
        <div className="p-10">
          <div className="flex flex-col items-center text-12 mx-20">
            <TokenInputPercentage
              label="amount"
              token={pool.reserveToken}
              balance={fieldBalance}
              amount={amount}
              setAmount={setAmount}
            />
            <Button
              onClick={() => onStart()}
              disabled={depositDisabled}
              className={`btn-primary rounded w-full mt-30 mb-10`}
            >
              {`Deposit ${pool.name}`}
            </Button>
            {ApproveModal}
          </div>
        </div>
      </Modal>
    </>
  );
};
