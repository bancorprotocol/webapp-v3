import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { CountdownTimer } from 'components/countdownTimer/CountdownTimer';

export interface UnstakeCardProps {
  stakeAmount: string | undefined;
  symbol: string;
  unstakeTime: number | undefined;
  isUnlocked: boolean;
  setIsStake: (isStake: boolean) => void;
  setStakeModal: (isOpen: boolean) => void;
  setIsUnlocked: (isUnlocked: boolean) => void;
  className?: string;
}

export const UnstakeCard: React.FC<UnstakeCardProps> = ({
  stakeAmount,
  symbol,
  unstakeTime,
  isUnlocked,
  setIsStake,
  setStakeModal,
  setIsUnlocked,
  className,
}) => {
  return (
    <div className={`flex flex-col justify-between ${className}`}>
      <div className="text-16 text-charcoal dark:text-white mb-18 font-medium">
        Unstake {symbol}
      </div>

      <div className="text-secondary text-12 mb-auto">
        In order to remove {symbol} from governance you would need to unstake
        them first.
      </div>
      <div className="flex items-center w-full">
        <Button
          variant={
            (!!unstakeTime || !stakeAmount || Number(stakeAmount) === 0) &&
            !isUnlocked
              ? ButtonVariant.Secondary
              : ButtonVariant.Primary
          }
          size={ButtonSize.Meduim}
          className="mt-20 md:mt-0"
          disabled={
            (!!unstakeTime || !stakeAmount || Number(stakeAmount) === 0) &&
            !isUnlocked
          }
          onClick={() => {
            setIsStake(false);
            setStakeModal(true);
          }}
        >
          <div className="flex flex-row justify-center">
            {unstakeTime && !isUnlocked && (
              <div className="mr-10">
                <CountdownTimer
                  date={unstakeTime}
                  onEnded={() => setIsUnlocked(true)}
                />
              </div>
            )}
            Unstake {symbol}
          </div>
        </Button>
      </div>
    </div>
  );
};
