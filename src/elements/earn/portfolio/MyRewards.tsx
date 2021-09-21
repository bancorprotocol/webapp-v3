import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';
import {
  fetchPendingRewards,
  fetchTotalClaimedRewards,
} from 'services/web3/protection/rewards';
import BigNumber from 'bignumber.js';
import { prettifyNumber } from 'utils/helperFunctions';
import { useAppSelector } from 'redux/index';
import { useInterval } from 'hooks/useInterval';

export const MyRewards = () => {
  const { account } = useWeb3React();
  const [claimableRewards, setClaimableRewards] = useState<number | null>(null);
  const [totalRewards, setTotalRewards] = useState<number | null>(null);
  const bntPrice = useAppSelector<string | null>(
    (state) => state.bancor.bntPrice
  );

  const getRewards = async (account: string) => {
    const pendingRewards = await fetchPendingRewards(account);
    const claimedRewards = await fetchTotalClaimedRewards(account);

    setClaimableRewards(Number(pendingRewards));
    const totalRewards = new BigNumber(pendingRewards)
      .plus(claimedRewards)
      .toString();
    setTotalRewards(Number(totalRewards));
  };

  useInterval(
    async () => {
      if (account) {
        await getRewards(account);
      }
    },
    account ? 15000 : null
  );

  useEffect(() => {
    if (!account) {
      setClaimableRewards(null);
      setTotalRewards(null);
    }
  }, [account]);

  return (
    <section className="content-section py-20 border-l-[10px] border-primary-light">
      <h2 className="ml-[20px] md:ml-[33px]">Rewards</h2>
      <hr className="content-separator my-14 mx-[20px] md:ml-[34px] md:mr-[44px]" />
      <div className="flex justify-between md:ml-[34px] md:mr-[44px]">
        <div>
          <div className="mb-5">Total Rewards to Date</div>
          {totalRewards && bntPrice ? (
            <div>
              <span className="md:text-16 font-semibold mr-5">
                {prettifyNumber(totalRewards)} BNT
              </span>
              <span className="text-12 text-primary">
                (~
                {prettifyNumber(totalRewards * Number(bntPrice), true)})
              </span>
            </div>
          ) : (
            <div>
              <span className="md:text-16 font-semibold mr-5">--</span>
            </div>
          )}
        </div>
        <div>
          <div className="mb-5">Claimable Rewards</div>
          {claimableRewards && bntPrice ? (
            <div>
              <span className="md:text-16 font-semibold mr-5">
                {prettifyNumber(claimableRewards)} BNT
              </span>
              <span className="text-12 text-primary">
                (~
                {prettifyNumber(claimableRewards * Number(bntPrice), true)})
              </span>
            </div>
          ) : (
            <div>
              <span className="md:text-16 font-semibold mr-5">--</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
