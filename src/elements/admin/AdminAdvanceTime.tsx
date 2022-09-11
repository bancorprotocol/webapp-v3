import { Button, ButtonSize } from 'components/button/Button';
import { providers, utils } from 'ethers';
import { getTenderlyRpcLS } from 'utils/localStorage';
import { web3 } from 'services/web3';
import { useState } from 'react';

export const AdminAdvanceTime = () => {
  const [input, setInput] = useState('');

  const moveTime = async () => {
    try {
      const params = [utils.hexValue(Number(input))];

      const provider = new providers.StaticJsonRpcProvider(getTenderlyRpcLS());
      await provider.send('evm_increaseTime', params);
      const block = await web3.provider.getBlock('latest');
      console.log('advanced time and block on tenderly');
      console.log(block);
    } catch (e) {
      console.error('error advancing time', e);
    }
  };

  return (
    <>
      <h2 className="pb-20 text-primary">Tenderly Time</h2>

      <div className={'mb-30'}>
        <div className="font-semibold">Advance time in seconds</div>
        <input
          type="text"
          className="w-full max-w-[500px] px-10 py-5 rounded-full mt-5 bg-secondary"
          value={input}
          onChange={(e) => setInput(e.target.value.trim())}
        />
      </div>

      <Button size={ButtonSize.Small} onClick={moveTime}>
        Advance Time
      </Button>
    </>
  );
};
