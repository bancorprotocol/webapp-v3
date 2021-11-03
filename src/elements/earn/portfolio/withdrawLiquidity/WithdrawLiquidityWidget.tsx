import { useState } from 'react';
import { useHistory } from 'react-router';
import { useAppSelector } from 'redux/index';
import { getTokenById } from 'redux/bancor/bancor';
import { getProtectedPools } from 'redux/bancor/pool';
import { SelectPool } from 'components/selectPool/SelectPool';
import { Pool, Token } from 'services/observables/tokens';
import { Widget } from 'components/widgets/Widget';
import { TokenInputPercentage } from 'components/tokenInputPercentage/TokenInputPercentage';
import { WithdrawLiquidityInfo } from './WithdrawLiquidityInfo';
import { LinePercentage } from 'components/linePercentage/LinePercentage';

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

  const withdrawingBNT = true;
  const protectionNotReached = true;
  const multiplierWillReset = true;

  const outputBreakdown = [
    { color: 'blue-4', decPercent: 0.75, label: 'ETH' },
    { color: 'primary', decPercent: 0.25, label: 'BNT' },
  ];

  return (
    <Widget title="Withdraw" goBackRoute="/portfolio">
      <div className="px-10 pb-10">
        <SelectPool
          pool={pool}
          pools={pools}
          onSelect={onSelect}
          label="Pool"
        />
        <WithdrawLiquidityInfo
          protectionNotReached={protectionNotReached}
          multiplierWillReset={multiplierWillReset}
        />
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
          <div className="relative w-[180px]">
            <LinePercentage percentages={outputBreakdown} />
          </div>
        </div>
        {withdrawingBNT && (
          <div className="mt-20">
            BNT withdrawals are subject to a 24h lock period before they can be
            claimed.
          </div>
        )}
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
