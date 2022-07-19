import { Page } from 'components/Page';
import { VoteCardStep1 } from 'elements/vote/VoteCardStep1';
import { VoteCardStep2 } from 'elements/vote/VoteCardStep2';

export const Vote2 = () => {
  const title = 'Vote';
  const subtitle =
    'Bancor is a DAO managed by vBNT stakers who determine the future of the protocol with their proposals.';

  return (
    <Page title={title} subtitle={subtitle}>
      <div className="grid grid-cols-2 gap-40">
        <VoteCardStep1 />
        <VoteCardStep2 />
      </div>
    </Page>
  );
};
