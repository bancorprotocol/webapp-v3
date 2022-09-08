import { ContractsApi } from 'services/web3/v3/contractsApi';
import { Button } from 'components/button/Button';
import { providers, utils } from 'ethers';
import { getTenderlyRpcLS } from 'utils/localStorage';
import { StandardRewards__factory } from 'services/web3/abis/types';
import { web3 } from 'services/web3';

export const AdminStandardRewardsCreate = () => {
  const moveTime = async () => {
    try {
      const block1 = await web3.provider.getBlock('latest');
      console.log(block1);
      const params = [
        utils.hexValue(1), // hex encoded number of blocks to increase
      ];

      const provider = new providers.StaticJsonRpcProvider(getTenderlyRpcLS());
      await provider.send('evm_increaseTime', params);
      const block2 = await web3.provider.getBlock('latest');
      console.log(block2);
    } catch (e) {
      console.error('error advancing time', e);
    }
  };

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
        '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        '1000000000000000000000',
        '1662645568',
        '1662985255',
        { gasLimit: '9999000000000000000000' }
      );
      await tx.wait();
      console.log(tx);
    } catch (e) {
      console.error('failed to create program', e);
    }
  };

  return (
    <>
      <h2 className="pb-20 text-primary">Standard Rewards Database</h2>
      <Button onClick={createProgram}>Create</Button>
      <Button onClick={moveTime}>Move Time</Button>
    </>
  );
};
