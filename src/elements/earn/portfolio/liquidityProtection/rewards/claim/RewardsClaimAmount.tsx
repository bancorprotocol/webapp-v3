import { prettifyNumber } from 'utils/helperFunctions';
import { useAppSelector } from 'redux/index';
import BigNumber from 'bignumber.js';
import { Tooltip } from 'components/tooltip/Tooltip';

interface Props {
  amount: string | null;
}

export const RewardsClaimAmount = ({ amount }: Props) => {
  const bntPrice = useAppSelector<string | null>(
    (state) => state.bancor.bntPrice
  );
  const usdPrice = () => new BigNumber(amount ?? 0).times(bntPrice ?? 0);

  return (
    <div className="flex justify-between mt-20">
      <div className="flex mr-20 pt-10 items-start">
        <div className="flex items-center">
          <h3 className="text-14 whitespace-nowrap font-semibold mr-5">
            Claimable Rewards
          </h3>
          <Tooltip content="Claimable value does not include earned liquidity mining rewards. You can withdraw or re-stake rewards from the Protection screen, by clicking “Withdraw” in the rewards widget." />
        </div>
      </div>

      <div className="text-right text-grey-3 w-full border-2 border-blue-0 dark:border-blue-1 rounded px-20 py-10">
        {amount && bntPrice ? (
          <div>
            <div className="text-20">{prettifyNumber(amount)} BNT</div>
            <div className="text-12">~{prettifyNumber(usdPrice(), true)}</div>
          </div>
        ) : (
          <div>--</div>
        )}
      </div>
    </div>
  );
};
