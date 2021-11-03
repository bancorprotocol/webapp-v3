import { useState } from 'react';
import { useHistory } from 'react-router';
import { useAppSelector } from 'redux/index';
import { getTokenById } from 'redux/bancor/bancor';
import { getProtectedPools } from 'redux/bancor/pool';
import { SelectPool } from 'components/selectPool/SelectPool';
import { Pool, Token } from 'services/observables/tokens';
import { Widget } from 'components/widgets/Widget';
import { ReactComponent as IconInfo } from 'assets/icons/info.svg';
import { TokenInputPercentage } from 'components/tokenInputPercentage/TokenInputPercentage';

export const WithdrawLiquidityWidget = ({ pool }: { pool: Pool }) => {
  const [amount, setAmount] = useState('');
  const pools = useAppSelector<Pool[]>(getProtectedPools);
  const token = useAppSelector<Token | undefined>(
    getTokenById(pool ? pool.reserves[0].address : '')
  );
  const history = useHistory();

  const onSelect = (pool: Pool) => {
    history.push(`/portfolio/withdraw/${pool.pool_dlt_id}`);
  };

  return (
    <Widget title="Withdraw" goBackRoute="/portfolio">
      <div className="px-10 pb-10">
        <SelectPool
          pool={pool}
          pools={pools}
          onSelect={onSelect}
          label="Pool"
        />
        <div className="border border-warning rounded bg-warning bg-opacity-[5%] dark:bg-blue-2 dark:bg-opacity-100 p-20 text-12 mt-20">
          <div className="text-warning flex items-center">
            <IconInfo className="w-10 mr-10" />
            <span className="font-semibold">Important!</span>
          </div>
          <p className="text-grey-4 dark:text-grey-3 ml-20 mt-5">
            You still haven’t reached full protection. There is a risk for
            impermanent loss and you might receive less than your original stake
            amount as a result. Withdrawing will reset your rewards multiplier
            for all active positions back to x1
          </p>
        </div>
        <div className="my-20">
          <TokenInputPercentage
            label="Amount"
            token={token}
            amount={amount}
            setAmount={setAmount}
          />
        </div>
        <div className="flex justify-between items-center">
          <div>Output amount</div>
          <div>123 ETH</div>
        </div>
        <div className="flex justify-between items-center mt-20">
          <div>Output breakdown</div>
          <div>%</div>
        </div>
        <div className="mt-20">
          BNT withdrawals are subject to a 24h lock period before they can be
          claimed.
        </div>
        <button
          onClick={() => {}}
          className={`btn-primary rounded w-full mt-20`}
        >
          Withdraw
        </button>
      </div>
    </Widget>
  );
};
