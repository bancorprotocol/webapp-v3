import { ReactComponent as IconLink } from 'assets/icons/link.svg';

export interface LegacyVoteCardProps {
  className?: string;
}

export const LegacyVoteCard: React.FC<LegacyVoteCardProps> = ({
  className,
}) => {
  return (
    <div
      className={`flex flex-col justify-between lt-md:min-h-[180px] ${className}`}
    >
      <div className="text-16 text-charcoal dark:text-white mb-18 font-medium">
        Legacy onchain contract
      </div>

      <div className="text-secondary text-12 mb-auto">
        View previous votes and decisions made onchain.
      </div>

      <a
        href="https://etherscan.io/address/0x892f481bd6e9d7d26ae365211d9b45175d5d00e4"
        target="_blank"
        className="flex items-center lt-md:justify-center text-primary dark:text-primary-light font-medium h-[47px]"
        rel="noreferrer"
      >
        View Legacy Gov <IconLink className="w-14 ml-6" />
      </a>
    </div>
  );
};
