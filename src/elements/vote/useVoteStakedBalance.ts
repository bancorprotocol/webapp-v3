import { usePoolPick } from 'queries/usePoolPick';
import { useQuery } from '@tanstack/react-query';
import { vBntToken } from 'services/web3/config';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { useAppSelector } from 'store';
import { shrinkToken } from 'utils/formulas';

export const useVoteStakedBalance = () => {
  const { getOne } = usePoolPick(['decimals']);
  const vBNT = getOne(vBntToken);
  const account = useAppSelector((state) => state.user.account);

  return useQuery(
    ['chain', 'vote', 'stakedBalance', account],
    async () => {
      if (!account) {
        throw new Error('Not logged in.');
      }
      if (!vBNT.data) {
        throw new Error('Data not fetched.');
      }
      const staked = await ContractsApi.Governance.read.votesOf(account);
      return shrinkToken(staked.toString(), vBNT.data.decimals);
    },
    { enabled: !!account && !!vBNT.data }
  );
};
