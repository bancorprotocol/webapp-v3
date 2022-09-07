import { useAppSelector } from 'store';
import { Button, ButtonSize } from 'components/button/Button';
import { expandToken } from 'utils/formulas';
import { providers } from 'ethers';
import { getTenderlyRpcLS } from 'utils/localStorage';
import { Token__factory } from 'services/web3/abis/types';
import { updateUserBalances } from 'services/observables/tokens';
import { useState } from 'react';
import { ethToken } from 'services/web3/config';

export const AdminTransfer = () => {
  const account = useAppSelector((state) => state.user.account);
  const [status, setStatus] = useState<
    'loading' | 'success' | 'error' | 'idle'
  >('idle');
  const [tokenAddress, setTokenAddress] = useState('');
  const [fromUser, setFromUser] = useState(account ?? '');
  const [toUser, setToUser] = useState('');
  const [amount, setAmount] = useState('');
  const [decimals, setDecimals] = useState(18);

  const handleClick = async () => {
    setStatus('loading');

    if (!(tokenAddress && fromUser && toUser && amount && decimals)) {
      setStatus('error');
      return;
    }

    const signer = new providers.StaticJsonRpcProvider(
      getTenderlyRpcLS()
    ).getUncheckedSigner(fromUser);

    const tokenContract = Token__factory.connect(tokenAddress, signer);

    try {
      if (tokenAddress === ethToken) {
        await signer.sendTransaction({
          to: toUser,
          value: expandToken(amount, decimals),
        });
      } else {
        await tokenContract.transfer(toUser, expandToken(amount, decimals));
      }
      await updateUserBalances();
      setStatus('success');
      setTokenAddress('');
      setAmount('');
      setDecimals(18);
      setFromUser(account ?? '');
      setToUser('');
    } catch (e) {
      console.error('debug transfer failed: ', e);
      setStatus('error');
    }
  };

  return (
    <div className={'max-w-[500px] mx-auto'}>
      <h2 className="pb-20 text-primary">Transfer ERC20 Tokens</h2>

      <div className="flex flex-col justify-between space-y-10 text-left">
        <div className="font-semibold">Token Contract</div>
        <input
          type="text"
          className="w-full max-w-[500px] px-10 py-5 rounded-full mt-5 dark:bg-charcoal"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value.trim())}
        />

        <div className={'flex space-x-30 w-full'}>
          <div className={'w-full'}>
            <div className="font-semibold">Amount</div>
            <input
              type="text"
              className="w-full max-w-[500px] px-10 py-5 rounded-full mt-5 dark:bg-charcoal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.trim())}
            />
          </div>
          <div>
            <div className="font-semibold">Decimals</div>
            <input
              type="number"
              className="w-full max-w-[100px] px-10 py-5 rounded-full mt-5 dark:bg-charcoal"
              value={decimals}
              onChange={(e) => setDecimals(Number(e.target.value.trim()))}
            />
          </div>
        </div>

        <div className="font-semibold">Transfer From</div>
        <input
          type="text"
          className="w-full max-w-[500px] px-10 py-5 rounded-full mt-5 dark:bg-charcoal"
          value={fromUser}
          onChange={(e) => setFromUser(e.target.value.trim())}
        />
        <div className="font-semibold">Transfer To</div>
        <input
          type="text"
          className="w-full max-w-[500px] px-10 py-5 rounded-full mt-5 dark:bg-charcoal"
          value={toUser}
          onChange={(e) => setToUser(e.target.value.trim())}
        />
      </div>

      <Button
        onClick={handleClick}
        size={ButtonSize.Small}
        className="mx-auto mt-20"
        disabled={status === 'loading'}
      >
        Full Send
      </Button>
      {status === 'error' && <div>Error: Check console for details</div>}
    </div>
  );
};
