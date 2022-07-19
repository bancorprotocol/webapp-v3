import { usePoolPick } from 'queries/chain/usePoolPick';
import { useState } from 'react';
import { vBntToken } from 'services/web3/config';
import { useAppSelector } from 'store';
import { prettifyNumber } from 'utils/helperFunctions';
import { useVoteStakedBalance } from './useVoteStakedBalance';
import { VoteCard } from './VoteCard';
import { VoteStakeModal } from './VoteStakeModal';

const loadingElement = <div className="loading-skeleton w-[130px] h-14 mb-6" />;

const VoteCardStep1Children = () => {
  const account = useAppSelector((state) => state.user.account);

  const stakedBalanceQuery = useVoteStakedBalance();
  const stakedBalance = stakedBalanceQuery.data
    ? prettifyNumber(stakedBalanceQuery.data) + ' vBNT'
    : '--';

  const { getOne } = usePoolPick(['balance']);
  const vBntQuery = getOne(vBntToken);

  const unstakedBalance = vBntQuery.data?.balance
    ? prettifyNumber(vBntQuery.data.balance.tkn) + ' vBNT'
    : '--';

  return (
    <div className="grid grid-cols-2">
      <div>
        <div className="text-18">
          {vBntQuery.isLoading && account ? loadingElement : unstakedBalance}
        </div>
        <div className="text-secondary">Unstaked Balance</div>
      </div>
      <div>
        <div className="text-18">
          {stakedBalanceQuery.isLoading && account
            ? loadingElement
            : stakedBalance}
        </div>
        <div className="text-secondary">Staked Balance</div>
      </div>
    </div>
  );
};

const step = 1;
const title = 'Stake your vBNT';
const buttonText = 'Stake Tokens';
const description =
  'In order to participate in Bancor governance activities, you should first stake your vBNT tokens. Staked vBNT will be locked for the initial 3 days.';

export const VoteCardStep1 = () => {
  const [isOpen, setIsOpen] = useState(false);
  const onButtonClick = () => setIsOpen(true);

  return (
    <>
      <VoteCard
        step={step}
        title={title}
        buttonText={buttonText}
        onButtonClick={onButtonClick}
        description={description}
      >
        <VoteCardStep1Children />
      </VoteCard>
      <VoteStakeModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};
