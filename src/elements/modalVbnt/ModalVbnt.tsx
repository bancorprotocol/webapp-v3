import { Modal } from 'components/modal/Modal';
import { SwapSwitch } from 'elements/swapSwitch/SwapSwitch';
import { Token } from 'services/observables/tokens';
import { ReactComponent as IconGovernance } from 'assets/icons/governance.svg';
import { TokenInputField } from 'components/tokenInputField/TokenInputField';
import { useState } from 'react';

interface ModalVbntProps {
  setIsOpen: Function;
  isOpen: boolean;
  token?: Token;
  stake: boolean;
}

export const ModalVbnt = ({
  setIsOpen,
  isOpen,
  token,
  stake,
}: ModalVbntProps) => {
  const [amount, setAmount] = useState('');
  const [amountUSD, setAmountUSD] = useState('');

  return (
    <Modal titleElement={<SwapSwitch />} setIsOpen={setIsOpen} isOpen={isOpen}>
      <div className="p-10">
        <div className="flex flex-col items-center text-12 mb-20">
          <IconGovernance className="w-[38px] text-primary mb-10" />
          <div className="text-20 font-semibold mb-10">
            {`${stake ? 'Stake' : 'Unstake'} vBNT`}
          </div>
          {stake && (
            <div className="text-blue-4 text-12 mx-10 text-center">
              Chose the amount you want to stake. you can decide if you want the
              amount in Dollars or Token input
            </div>
          )}
          {token && (
            <TokenInputField
              token={token}
              input={amount}
              setInput={setAmount}
              selectable={false}
              amountUsd={amountUSD}
              setAmountUsd={setAmountUSD}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};
