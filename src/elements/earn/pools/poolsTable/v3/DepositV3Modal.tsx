import { Button } from 'components/button/Button';
import { PoolV3 } from 'services/observables/pools';
import { useEffect, useMemo, useState } from 'react';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { utils } from 'ethers';
import { useNavigation } from 'services/router';
import { useDispatch } from 'react-redux';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';
import { useAppSelector } from 'redux/index';
import { useApproveModal } from 'hooks/useApproveModal';
import { Modal } from 'components/modal/Modal';
import { SwapSwitch } from 'elements/swapSwitch/SwapSwitch';
import { TokenInputPercentage } from 'components/tokenInputPercentage/TokenInputPercentage';

interface Props {
  pool: PoolV3;
}

export const DepositV3Modal = ({ pool }: Props) => {
  const account = useAppSelector((state) => state.user.account);
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const percentages = useMemo(() => [25, 50, 75, 100], []);
  const [, setSelPercentage] = useState<number>(-1);

  const { pushPortfolio } = useNavigation();
  const dispatch = useDispatch();

  const depositDisabled = !account || !amount || Number(amount) === 0;

  const fieldBalance = pool.reserveToken.balance
    ? pool.reserveToken.balance
    : undefined;

  useEffect(() => {
    if (amount && fieldBalance) {
      const percentage = (Number(amount) / Number(fieldBalance)) * 100;
      setSelPercentage(
        percentages.findIndex((x) => percentage.toFixed(10) === x.toFixed(10))
      );
    }
  }, [amount, pool.reserveToken, percentages, fieldBalance]);

  const deposit = async () => {
    if (!pool.reserveToken.balance || !account || !fieldBalance) {
      return;
    }
    console.log(utils.parseUnits(fieldBalance, pool.reserveToken.decimals));
    try {
      const res = await ContractsApi.BancorNetwork.write.deposit(
        pool.pool_dlt_id,
        utils.parseUnits(fieldBalance, pool.reserveToken.decimals)
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
      <Button onClick={() => setIsOpen(true)}>Deposit</Button>
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
            <div className="text-20 font-semibold mb-10"></div>
            <TokenInputPercentage
              label="amount"
              token={pool.reserveToken}
              balance={fieldBalance}
              amount={amount}
              setAmount={setAmount}
            />
            <button
              onClick={() => {
                setAmount('');
                setIsOpen(false);
                onStart();
              }}
              disabled={depositDisabled}
              className={`btn-primary rounded w-full mt-30 mb-10`}
            >
              {`Deposit ${pool.name}`}
            </button>
            {ApproveModal}
          </div>
        </div>
      </Modal>
    </>
  );
};
