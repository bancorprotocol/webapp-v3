import { Modal } from 'components/modal/Modal';
import { SwapSwitch } from 'elements/swapSwitch/SwapSwitch';
import { Token } from 'services/observables/tokens';
import { TokenInputField } from 'components/tokenInputField/TokenInputField';
import { useState } from 'react';
import { InputField } from 'components/inputField/InputField';
import { classNameGenerator } from 'utils/pureFunctions';
import { stakeAmount } from 'services/web3/governance/governance';

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
  const percentages = [25, 50, 75, 100];
  const [selPercentage, setSelPercentage] = useState<number | undefined>();

  return (
    <Modal
      title={`${stake ? 'Stake' : 'Unstake'} vBNT`}
      titleElement={<SwapSwitch />}
      setIsOpen={setIsOpen}
      isOpen={isOpen}
      separator
      large
    >
      <div className="p-10">
        <div className="flex flex-col items-center text-12 mx-20">
          <div className="text-20 font-semibold mb-10"></div>
          {false && (
            <div className="text-blue-4 text-12 mx-10 text-center">
              Chose the amount you want to stake. you can decide if you want the
              amount in Dollars or Token input
            </div>
          )}
          {token && (
            <TokenInputField
              border
              token={token}
              input={amount}
              label={`${stake ? 'Stake' : 'Unstake'} amount`}
              setInput={setAmount}
              selectable={false}
              amountUsd={amountUSD}
              setAmountUsd={setAmountUSD}
            />
          )}
          <div className="flex justify-between space-x-8 mt-15">
            <div className="w-[125px]" />
            {percentages.map((slip, index) => (
              <button
                key={'slippage' + slip}
                className={`btn-sm rounded-10 h-[34px] w-[66px] text-14 ${classNameGenerator(
                  {
                    'btn-outline-secondary': selPercentage !== index,
                    'btn-primary': selPercentage === index,
                  }
                )} bg-opacity-0`}
                onClick={() => {
                  setSelPercentage(index);
                }}
              >
                +{slip}%
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              if (!amount || Number(amount) === 0) return;

              stakeAmount(amount);
              setIsOpen(false);
            }}
            className={`btn-primary rounded w-full mt-30 mb-10`}
          >
            {`${stake ? 'Stake' : 'Unstake'} vBNT`}
          </button>
        </div>
      </div>
    </Modal>
  );
};
