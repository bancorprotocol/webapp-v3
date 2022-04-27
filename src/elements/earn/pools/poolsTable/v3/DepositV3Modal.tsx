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
import { ModalV3 } from 'components/modal/ModalV3';
import { SwapSwitch } from 'elements/swapSwitch/SwapSwitch';
import { TokenInputPercentageV3 } from 'components/tokenInputPercentage/TokenInputPercentageV3';
import { ethToken } from 'services/web3/config';
import { AccessFullEarningsToggle } from 'elements/earn/pools/poolsTable/v3/AccessFullEarningsToggle';

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
        pool.poolDltId,
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
        variant={ButtonVariant.PRIMARY}
        size={ButtonSize.EXTRASMALL}
      >
        Deposit
      </Button>
      <ModalV3
        title={'Deposit & Earn'}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
        titleElement={<SwapSwitch />}
        separator
        large
      >
        <div className="p-10">
          <div className="flex flex-col items-center text-12 mx-20">
            <TokenInputPercentageV3
              label="Amount"
              token={pool.reserveToken}
              balance={fieldBalance}
              amount={amount}
              setAmount={setAmount}
              balanceLabel="Claimable"
            />
            <div className="flex flex-col w-full p-20 rounded bg-fog dark:bg-black-disabled dark:text-primary-light">
              <AccessFullEarningsToggle />
            </div>
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
      </ModalV3>
    </>
  );
};
