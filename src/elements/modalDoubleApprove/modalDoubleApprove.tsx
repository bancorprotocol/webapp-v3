import { Token } from 'services/observables/tokens';
import { ModalApprove } from '../modalApprove/modalApprove';
import { useState } from 'react';

interface ModalApproveProps {
  setIsOpen: Function;
  isOpen: boolean;
  amounts: string[];
  fromTokens?: Token[];
  handleApproved: Function;
  waitForApproval?: boolean;
}

export const ModalDoubleApprove = ({
  setIsOpen,
  isOpen,
  amounts,
  fromTokens,
  handleApproved,
  waitForApproval,
}: ModalApproveProps) => {
  const [amount1, amount2] = amounts;
  const [token1, token2] = fromTokens as [Token, Token];

  const [token1IsOpen, setToken1IsOpen] = useState(true);
  const [token2IsOpen, setToken2IsOpen] = useState(false);

  const token1PromptCompleted = () => {
    setToken1IsOpen(false);
    setToken2IsOpen(true);
  };

  const token2PromptCompleted = () => {
    setToken2IsOpen(false);
    setIsOpen(false);
  };

  const [token1Approved, setToken1IsApproved] = useState(false);
  const [token2Approved, setToken2IsApproved] = useState(false);

  const token1IsApproved = () => {
    setToken1IsApproved(true);
    if (token2Approved) {
      handleApproved();
    }
  };
  const token2IsApproved = () => {
    setToken2IsApproved(true);
    if (token1Approved) {
      handleApproved();
    }
  };

  return (
    <>
      <ModalApprove
        promptSelected={token1PromptCompleted}
        isOpen={isOpen && token1IsOpen}
        waitForApproval={waitForApproval}
        handleApproved={token1IsApproved}
        fromToken={token1}
        amount={amount1}
      />
      <ModalApprove
        promptSelected={token2PromptCompleted}
        isOpen={isOpen && token2IsOpen}
        waitForApproval={waitForApproval}
        handleApproved={token2IsApproved}
        fromToken={token2}
        amount={amount2}
      />
    </>
  );
};
