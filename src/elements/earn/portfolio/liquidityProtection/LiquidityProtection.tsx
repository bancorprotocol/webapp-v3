import { MyStake } from './protectedPositions/MyStake';
import { MyRewards } from './rewards/MyRewards';
import { ProtectedPositionsTable } from './protectedPositions/ProtectedPositionsTable';
import { ClaimAvailable } from './claim/ClaimAvailable';
import { ClaimLocked } from './claim/ClaimLocked';
import { useWeb3React } from '@web3-react/core';
import { useState } from 'react';
import { useAppSelector } from 'redux/index';
import { getTokenById } from 'redux/bancor/bancor';
import { Token } from 'services/observables/tokens';
import { bntToken } from 'services/web3/config';
import {
  LockedBnt,
  fetchLockedAvailableBalances,
} from 'services/web3/lockedbnt/lockedbnt';
import { EthNetworks } from 'services/web3/types';
import useAsyncEffect from 'use-async-effect';

export const LiquidityProtection = () => {
  const { chainId, account } = useWeb3React();
  const bnt = useAppSelector<Token | undefined>(
    getTokenById(bntToken(chainId ?? EthNetworks.Mainnet))
  );
  const [availableBNT, setAvailableBNT] = useState(0);
  const [locked, setLocked] = useState<LockedBnt[]>([]);

  useAsyncEffect(
    async (isMount) => {
      if (isMount() && account) {
        const availableLocked = await fetchLockedAvailableBalances(account);
        if (availableLocked) {
          setAvailableBNT(availableLocked.available);
          setLocked(availableLocked.locked);
        }
      }
    },
    [account]
  );

  return (
    <div className="space-y-30">
      <p>
        Manage your protected positions in Bancor pools and track and analyze
        your returns.
      </p>

      <div className="grid xl:grid-cols-2 gap-40">
        <MyStake />
        <MyRewards />
      </div>

      <ProtectedPositionsTable />

      <h2>Closed Positions</h2>
      <p>
        When unstaking protected positions, you will be able to see and claim
        your BNT here
      </p>
      <div className="grid xl:grid-cols-2 gap-40">
        <ClaimAvailable bnt={bnt} availableBNT={availableBNT} />
        <ClaimLocked bnt={bnt} locked={locked} />
      </div>
    </div>
  );
};
