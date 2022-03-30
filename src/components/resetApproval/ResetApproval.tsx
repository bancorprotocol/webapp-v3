import { resetApproval } from 'services/web3/approval';
import { useAppSelector } from 'redux/index';
import { useMemo, useState } from 'react';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { Token__factory } from 'services/web3/abis/types';
import { web3 } from 'services/web3';
import useAsyncEffect from 'use-async-effect';

interface Props {
  spenderContract: string;
  tokenContract: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
}

export const ResetApproval = ({
  spenderContract,
  tokenContract,
  tokenSymbol = 'TKN',
}: Props) => {
  const account = useAppSelector<string | null>((state) => state.user.account);
  const [txBusy, setTxBusy] = useState(false);
  const [currentApproval, setCurrentApproval] = useState('');

  const handleClick = async () => {
    if (!account) {
      return;
    }

    try {
      setTxBusy(true);
      await resetApproval(spenderContract, account, tokenContract);
      await fetchCurrentApproval();
    } catch (error) {
      console.error('failed to reset approval: ', error);
    } finally {
      setTxBusy(false);
    }
  };

  const fetchCurrentApproval = async () => {
    if (!account) {
      return;
    }

    const contract = Token__factory.connect(tokenContract, web3.provider);
    const allowanceWei = await contract.allowance(account, spenderContract);
    setCurrentApproval(allowanceWei.toString());
  };

  useAsyncEffect(async () => {
    await fetchCurrentApproval();
  }, [account]);

  const btn = useMemo(() => {
    if (currentApproval === '0') {
      return { text: `${tokenSymbol} allowance: 0`, disabled: true };
    }
    if (txBusy) {
      return { text: `Reset ${tokenSymbol} allowance`, disabled: true };
    }

    return { text: `Reset ${tokenSymbol} allowance`, disabled: false };
  }, [currentApproval, tokenSymbol, txBusy]);

  return (
    <Button
      onClick={handleClick}
      size={ButtonSize.EXTRASMALL}
      variant={ButtonVariant.DARK}
      disabled={btn.disabled}
    >
      {btn.text}
    </Button>
  );
};
