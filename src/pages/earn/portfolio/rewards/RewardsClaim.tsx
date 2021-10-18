import { useWeb3React } from '@web3-react/core';
import {
  claimRewards,
  fetchPendingRewards,
} from 'services/web3/protection/rewards';
import { useEffect, useState } from 'react';
import { useAppSelector } from 'redux/index';
import { useInterval } from 'hooks/useInterval';
import { prettifyNumber } from 'utils/helperFunctions';

export const RewardsClaim = () => {
  const [claimableRewards, setClaimableRewards] = useState<number | null>(null);
  const { account } = useWeb3React();
  const bntPrice = useAppSelector<string | null>(
    (state) => state.bancor.bntPrice
  );

  const fetchClaimableRewards = async (account: string) => {
    const pendingRewards = await fetchPendingRewards(account);
    setClaimableRewards(Number(pendingRewards));
  };

  useInterval(
    async () => {
      if (account) {
        await fetchClaimableRewards(account);
      }
    },
    account ? 15000 : null
  );

  useEffect(() => {
    if (!account) {
      setClaimableRewards(null);
    }
  }, [account]);

  const handleClaim = async () => {
    if (account) {
      const txHash = await claimRewards();
    }
  };

  return (
    <div className="bg-white dark:bg-blue-4 h-screen w-screen md:h-auto md:w-auto md:bg-grey-1 md:dark:bg-blue-3 mt-20">
      <div className="flex justify-center w-full mx-auto 2xl:space-x-20">
        <div className="widget">
          <h2 className="text-20 py-16 px-20">Claim Rewards</h2>
          <hr className="widget-separator" />

          <div className="flex justify-between px-20">
            <h3>Claimable Rewards</h3>
            {claimableRewards && bntPrice ? (
              <div>
                <span className="text-primary text-12 mr-10">
                  (~{prettifyNumber(claimableRewards * Number(bntPrice), true)})
                </span>
                <span className="font-semibold">
                  {prettifyNumber(claimableRewards)} BNT
                </span>
              </div>
            ) : (
              <div>--</div>
            )}
          </div>

          <button
            onClick={() => handleClaim()}
            className="btn-primary rounded w-full mt-20"
            disabled={!account}
          >
            Claim
          </button>
        </div>
      </div>
    </div>
  );
};
