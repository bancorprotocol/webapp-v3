import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { useWalletConnect } from 'elements/walletConnect/useWalletConnect';
import { Token } from 'services/observables/tokens';
import { VoteBalances } from 'pages/vote/VoteBalances';

export interface StakeCardProps {
  stakeAmount: string | undefined;
  symbol: string;
  account: string | null | undefined;
  govToken: Token | undefined;
  setIsStake: (isStake: boolean) => void;
  setStakeModal: (isOpen: boolean) => void;
  className?: string;
}

export const StakeCard: React.FC<StakeCardProps> = ({
  stakeAmount,
  symbol,
  account,
  govToken,
  setIsStake,
  setStakeModal,
  className,
}) => {
  const { handleWalletButtonClick } = useWalletConnect();
  return (
    <div className={`flex flex-row ${className}`}>
      <div className="flex flex-col max-w-[500px]">
        <div className="text-16 text-charcoal dark:text-white mb-18 font-medium">
          Stake {symbol}
        </div>

        <div className="text-secondary text-12 mb-auto">
          In order to participate in Bancor governance activities, you should
          stake {symbol} tokens.
        </div>
        <div className="flex w-full">
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Meduim}
            className="mt-20"
            onClick={() => {
              if (!account) {
                handleWalletButtonClick();
                return;
              }

              setIsStake(true);
              setStakeModal(true);
            }}
          >
            Stake {symbol}
          </Button>
        </div>
      </div>
      <VoteBalances
        account={account}
        govToken={govToken}
        stakeAmount={stakeAmount}
      ></VoteBalances>
    </div>
  );
};
