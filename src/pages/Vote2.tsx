import { Page } from 'components/Page';
import { VoteCardStep1 } from 'elements/vote/VoteCardStep1';
import { VoteCardStep2 } from 'elements/vote/VoteCardStep2';
import { VoteCardStep3 } from 'elements/vote/VoteCardStep3';

const title = 'Vote';
const subtitle =
  'Bancor is a DAO managed by vBNT stakers who determine the future of the protocol with their proposals.';

export const Vote2 = () => {
  return (
    <Page title={title} subtitle={subtitle}>
      <div className="grid md:grid-cols-2 gap-x-40 gap-y-20 mb-40">
        <VoteCardStep1 />
        <VoteCardStep2 />
        <VoteCardStep3 />
        <VoteCardStep3 />
      </div>
    </Page>
  );
};
