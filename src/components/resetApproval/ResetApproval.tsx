import { resetApproval } from 'services/web3/approval';
import { useAppSelector } from 'store';
import { useMemo, useState } from 'react';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import useAsyncEffect from 'use-async-effect';
import { ContractsApi } from 'services/web3/v3/contractsApi';

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
  const account = useAppSelector((state) => state.user.account);
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

    const allowanceWei = await ContractsApi.Token(tokenContract).read.allowance(
      account,
      spenderContract
    );
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
