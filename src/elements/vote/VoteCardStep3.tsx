import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { useState } from 'react';
import { VoteStakeModal } from './VoteStakeModal';

const title = 'Unstake from Governance';
const buttonText = 'Stake Tokens';
const description =
  'In order to remove vBNT from governance you would need to unstake them first.';

export const VoteCardStep3 = () => {
  const [isOpen, setIsOpen] = useState(false);
  const onButtonClick = () => setIsOpen(true);

  return (
    <>
      <div className={'content-block p-20'}>
        <h3>{title}</h3>
        <p className={'text-secondary mt-10 mb-20'}>{description}</p>
        <Button variant={ButtonVariant.Tertiary} size={ButtonSize.Small}>
          Unstake
        </Button>
      </div>
      <VoteStakeModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};
