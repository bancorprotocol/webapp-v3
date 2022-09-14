import { ContractsApi } from 'services/web3/v3/contractsApi';
import { Button, ButtonSize } from 'components/button/Button';
import { providers } from 'ethers';
import { getTenderlyRpcLS } from 'utils/localStorage';
import { StandardRewards__factory } from 'services/web3/abis/types';
import { useState } from 'react';

export const AdminStandardRewardsCreate = () => {
  const [pool, setPool] = useState('');
  const [totalRewards, setTotalRewards] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const createProgram = async () => {
    try {
      const signer = new providers.StaticJsonRpcProvider(
        getTenderlyRpcLS()
      ).getUncheckedSigner(process.env.REACT_APP_BANCOR_DEPLOYER);

      const contract = StandardRewards__factory.connect(
        ContractsApi.StandardRewards.contractAddress,
        signer
      );
      const tx = await contract.createProgram(
        pool,
        totalRewards,
        startTime,
        endTime,
        { gasLimit: '9999000000000000000000' }
      );
      await tx.wait();
      console.log('successfully created program');
      console.log(tx);
    } catch (e) {
      console.error('failed to create program', e);
    }
  };

  return (
    <>
      <h2 className="pb-20 text-primary">Create Standard Rewards Program</h2>

      <div className={'space-y-20 mb-30'}>
        <div>
          <div className="font-semibold">Pool</div>
          <input
            type="text"
            className="w-full max-w-[500px] px-10 py-5 rounded-full mt-5 bg-secondary"
            value={pool}
            onChange={(e) => setPool(e.target.value.trim())}
          />
        </div>

        <div>
          <div className="font-semibold">Total Rewards</div>
          <input
            type="text"
            className="w-full max-w-[500px] px-10 py-5 rounded-full mt-5 bg-secondary"
            value={totalRewards}
            onChange={(e) => setTotalRewards(e.target.value.trim())}
          />
        </div>

        <div>
          <div className="font-semibold">Start Time</div>
          <input
            type="text"
            className="w-full max-w-[500px] px-10 py-5 rounded-full mt-5 bg-secondary"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value.trim())}
          />
        </div>

        <div>
          <div className="font-semibold">End Time</div>
          <input
            type="text"
            className="w-full max-w-[500px] px-10 py-5 rounded-full mt-5 bg-secondary"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value.trim())}
          />
        </div>
      </div>

      <Button size={ButtonSize.Small} onClick={createProgram}>
        Create
      </Button>
    </>
  );
};
