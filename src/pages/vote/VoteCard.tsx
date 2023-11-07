import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { Navigate } from 'components/navigate/Navigate';
import { openNewTab } from 'utils/pureFunctions';
import { ReactComponent as IconLink } from 'assets/icons/link.svg';

export interface VoteCardProps {
  className?: string;
}

export const VoteCard: React.FC<VoteCardProps> = ({ className }) => {
  return (
    <div className={`flex flex-col justify-between ${className}`}>
      <div className="text-16 text-charcoal dark:text-white mb-18 font-medium">
        Voting on Bancor DAO
      </div>

      <div className="text-secondary text-12 mb-auto">
        Voting on Bancor DAO is free as it is using the Snapshot off-chain
        infrastructure. Every user can vote on every available proposal and help
        shape the future of the Bancor Protocol.
      </div>
      <div className="flex flex-col lg:flex-row lg:items-baseline items-center w-full">
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Medium}
          className="mt-20 lt-lg:w-full"
          onClick={() => openNewTab('https://vote.bancor.network/')}
        >
          {'Vote on Snapshot'}
        </Button>
        <Navigate
          to="https://support.bancor.network/hc/en-us/articles/5476957904914"
          className="flex items-center text-primary dark:text-primary-light font-medium lg:ml-40 lt-lg:mt-20"
        >
          How to Vote <IconLink className="w-14 ml-6" />
        </Navigate>
      </div>
    </div>
  );
};
