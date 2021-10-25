import { prettifyNumber } from 'utils/helperFunctions';
import { useAppSelector } from 'redux/index';
import BigNumber from 'bignumber.js';

interface Props {
  amount: string | null;
}

export const RewardsClaimAmount = ({ amount }: Props) => {
  const bntPrice = useAppSelector<string | null>(
    (state) => state.bancor.bntPrice
  );
  const usdPrice = () => new BigNumber(amount ?? 0).times(bntPrice ?? 0);

  return (
    <div className="flex justify-between px-20">
      <h3>Claimable Rewards</h3>
      {amount && bntPrice ? (
        <div>
          <span className="text-primary text-12 mr-10">
            (~{prettifyNumber(usdPrice(), true)})
          </span>
          <span className="font-semibold">{prettifyNumber(amount)} BNT</span>
        </div>
      ) : (
        <div>--</div>
      )}
    </div>
  );
};
