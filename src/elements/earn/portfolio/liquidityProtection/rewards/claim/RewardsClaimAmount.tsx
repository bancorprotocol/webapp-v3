import { prettifyNumber } from 'utils/helperFunctions';
import { useAppSelector } from 'store';
import BigNumber from 'bignumber.js';
import { getTokenById } from 'store/bancor/bancor';
import { bntToken } from 'services/web3/config';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { ReactComponent as IconInfo } from 'assets/icons/info-solid.svg';

interface Props {
  amount?: string;
}

export const RewardsClaimAmount = ({ amount }: Props) => {
  const bnt = useAppSelector((state) => getTokenById(state, bntToken));
  const usdPrice = () => new BigNumber(amount ?? 0).times(bnt?.usdPrice ?? 0);

  return (
    <div className="flex justify-between mt-20">
      <div className="flex mr-20 pt-10 items-start">
        <div className="flex items-center">
          <h3 className="text-14 whitespace-nowrap font-semibold mr-5">
            Claimable Rewards
          </h3>
          <PopoverV3
            buttonElement={() => (
              <IconInfo className="w-[10px] h-[10px] text-black-low dark:text-white-low" />
            )}
          >
            Claimable value does not include earned liquidity mining rewards.
            You can withdraw or re-stake rewards from the Protection screen, by
            clicking “Withdraw” in the rewards widget.
          </PopoverV3>
        </div>
      </div>

      <div className="text-right text-graphite w-full border-2 border-primary dark:border-black-low rounded px-20 py-10">
        {amount && bnt?.usdPrice ? (
          <div>
            <div className="text-20">{prettifyNumber(amount)} BNT</div>
            <div className="text-12">{prettifyNumber(usdPrice(), true)}</div>
          </div>
        ) : (
          <div>--</div>
        )}
      </div>
    </div>
  );
};
