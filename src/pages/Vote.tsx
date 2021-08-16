import { JSXElementConstructor } from 'react';

interface VoteCardProps {
  title: string;
  step: number;
  content: string;
  button: string;
  onClick: Function;
  footer: JSX.Element;
}
const VoteCard = ({
  title,
  step,
  content,
  button,
  onClick,
  footer,
}: VoteCardProps) => {
  return (
    <div className="flex flex-col bg-white dark:bg-blue-4 max-w-[515px] min-h-[325px] p-30 shadow hover:shadow-lg dark:shadow-none rounded-20">
      <div className="flex text-20 font-semibold mb-18">
        <div className="text-primary-dark dark:text-primary-light mr-12">{`Step ${step}`}</div>
        {title}
      </div>
      <div className="text-14 text-grey-4 dark:text-grey-0 mb-auto">
        {content}
      </div>
      <button
        className="btn-primary rounded w-[220px] h-[37px]"
        onClick={() => onClick()}
      >
        {button}
      </button>
      <hr className="widget-separator my-15" />
      {footer}
    </div>
  );
};

export const Vote = () => {
  return (
    <div className="flex flex-col text-14 max-w-[1140px] mx-auto">
      <div className="font-bold text-3xl text-blue-4 dark:text-grey-0 mb-18">
        Vote
      </div>
      <div className="text-blue-4 dark:text-grey-0 mb-44">
        Bancor is a DAO managed by vBNT stakers who determine the future of the
        protocol with their proposals.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-50">
        <VoteCard
          step={1}
          title="Stake your vBNT"
          content="In order to participate in Bancor governance activities, you should first stake your vBNT tokens."
          button="Stake Tokens"
          onClick={() => {}}
          footer={<div></div>}
        />
        <VoteCard
          step={2}
          title="Make a Difference"
          content="Voting on Bancor DAO is free as it is using the Snapshot off-chain infrastructure. Every user can vote on every available proposal and help shape the future of the Bancor Protocol."
          button="Vote on Snapshot"
          onClick={() => {}}
          footer={<div></div>}
        />

        <div className="col-span-2 flex justify-between items-center bg-white dark:bg-blue-4 shadow hover:shadow-lg dark:shadow-none rounded-20">
          <div className="flex flex-col max-w-[515px]">
            <div>Unstake from Governance</div>

            <div>
              In order to remove vBNT from governance you would need to unstake
              them first.
            </div>

            <button />
          </div>
          <hr className="widget-separator w-[1px] transform rotate-90 mx-15" />
          <div className="flex flex-col max-w-[515px]">
            <div>Legacy onchain contract</div>

            <div>View previous votes and decisions made onchain.</div>

            <button>View Legacy Gov</button>
          </div>
        </div>
      </div>
    </div>
  );
};
