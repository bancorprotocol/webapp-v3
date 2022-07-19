import { VoteCard } from './VoteCard';

export const VoteCardStep2 = () => {
  const step = 2;
  const title = 'Make a Difference';
  const buttonText = 'Vote on Snapshot';
  const onButtonClick = () => {};
  const description =
    'Voting on Bancor DAO is free as it is using the Snapshot off-chain infrastructure. Every user can vote on every available proposal and help shape the future of the Bancor Protocol.';

  return (
    <VoteCard
      step={step}
      title={title}
      buttonText={buttonText}
      onButtonClick={onButtonClick}
      description={description}
    />
  );
};
