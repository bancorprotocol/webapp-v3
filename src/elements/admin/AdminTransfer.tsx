import { useAppSelector } from 'store';
import { Button, ButtonSize } from 'components/button/Button';
import { expandToken } from 'utils/formulas';
import { providers, utils } from 'ethers';
import { getTenderlyRpcLS } from 'utils/localStorage';
import { Token__factory } from 'services/web3/abis/types';
import { updateUserBalances } from 'services/observables/tokens';
import { useState } from 'react';
import { getTokensV3Map } from 'store/bancor/token';
import { ethToken } from 'services/web3/config';

const WHALES = [
  {
    symbol: 'USDC',
    decimals: 6,
    tokenContract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    whaleAccount: '0x0a59649758aa4d66e25f08dd01271e891fe52199',
  },
  {
    symbol: 'DAI',
    decimals: 18,
    tokenContract: '0x6b175474e89094c44da98b954eedeac495271d0f',
    whaleAccount: '0x5777d92f208679db4b9778590fa3cab3ac9e2168',
  },
  {
    symbol: 'BNT',
    decimals: 18,
    tokenContract: '0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c',
    whaleAccount: '0xa744a64dfd51e4fee3360f1ec1509d329047d7db',
  },
];

export const AdminTransfer = () => {
  const [faucetStatus, setFaucetStatus] = useState<
    'loading' | 'success' | 'error' | 'idle'
  >('idle');
  const [tokenContract, setTokenContract] = useState('');
  const account = useAppSelector((state) => state.user.account);
  const tokensMap = useAppSelector(getTokensV3Map);

  const tokens = WHALES.map((x) =>
    tokensMap.get(utils.getAddress(x.tokenContract))
  );
  tokens.push(tokensMap.get(ethToken));

  const handleSave = async () => {
    setFaucetStatus('loading');
    if (!account) {
      setFaucetStatus('error');
      return;
    }

    const ethSigner = new providers.StaticJsonRpcProvider(
      getTenderlyRpcLS()
    ).getUncheckedSigner('0x00000000219ab540356cbb839cbe05303d7705fa');

    await ethSigner.sendTransaction({
      to: account,
      value: expandToken(100000, 18),
    });

    for await (const x of WHALES) {
      const signer = new providers.StaticJsonRpcProvider(
        getTenderlyRpcLS()
      ).getUncheckedSigner(x.whaleAccount);

      const tokenContract = Token__factory.connect(x.tokenContract, signer);

      try {
        await tokenContract.transfer(account, expandToken(100000, x.decimals));
        await updateUserBalances();
        setFaucetStatus('success');
      } catch (e) {
        console.error('faucet failed for ', x.symbol, e);
        setFaucetStatus('error');
      }
    }
  };

  return (
    <div>
      <h2 className="pb-20 text-primary">Transfer ERC20 Tokens</h2>

      <div className="flex flex-col items-center justify-between">
        <div className="font-semibold">Step 1: Token Contract</div>
        <input
          type="text"
          className="w-full max-w-[500px] px-10 py-5 rounded-full mt-5 dark:bg-charcoal"
          value={tokenContract}
          onChange={(e) => setTokenContract(e.target.value.trim())}
        />
      </div>

      <Button
        onClick={handleSave}
        size={ButtonSize.Small}
        className="mx-auto mt-20"
      >
        Save
      </Button>
    </div>
  );
};
