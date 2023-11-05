import { useWeb3React } from '@web3-react/core';
import { ModalVbnt } from 'elements/modalVbnt/ModalVbnt';
import { useCallback, useState } from 'react';
import { useEffect } from 'react';
import { useAppSelector } from 'store';
import { Token } from 'services/observables/tokens';
import { getNetworkVariables } from 'services/web3/config';
import {
  getStakedAmount,
  getUnstakeTimer,
} from 'services/web3/governance/governance';
import { Page } from 'components/Page';
import { useDispatch } from 'react-redux';
import {
  setStakedVbntAmount,
  setUnstakeVbntTimer,
  setStakedBntAmount,
  setUnstakeBntTimer,
} from 'store/gov/gov';
import { VoteCardDivided } from 'pages/vote/VoteCardDivided';
import { UnstakeCard } from 'pages/vote/UnstakedCard';
import { StakeCard } from 'pages/vote/StakedCard';
import { VoteCard } from 'pages/vote/VoteCard';
import { LegacyVoteCard } from './LegacyVoteCard';

export const Vote = () => {
  const { chainId } = useWeb3React();
  const dispatch = useDispatch();
  const account = useAppSelector((state) => state.user.account);
  const tokens = useAppSelector<Token[]>((state) => state.bancor.tokensV2);
  const stakeVbntAmount = useAppSelector<string | undefined>(
    (state) => state.gov.stakedVbntAmount
  );
  const unstakeVbntTime = useAppSelector<number | undefined>(
    (state) => state.gov.unstakeVbntTimer
  );
  const stakeBntAmount = useAppSelector<string | undefined>(
    (state) => state.gov.stakedBntAmount
  );
  const unstakeBntTime = useAppSelector<number | undefined>(
    (state) => state.gov.unstakeBntTimer
  );
  const [vbntToken, setVbntToken] = useState<Token | undefined>();
  const [bntToken, setBntToken] = useState<Token | undefined>();
  const [isVbntUnlocked, setIsVbntUnlocked] = useState<boolean>(false);
  const [isBntUnlocked, setIsBntUnlocked] = useState<boolean>(false);
  const [stakeVbntModal, setStakeVbntModal] = useState<boolean>(false);
  const [stakeBntModal, setStakeBntModal] = useState<boolean>(false);
  const [isVbntStake, setIsVbntStake] = useState<boolean>(false);
  const [isBntStake, setIsBntStake] = useState<boolean>(false);

  useEffect(() => {
    const networkVars = getNetworkVariables();
    setVbntToken(tokens.find((x) => x.address === networkVars.govToken));
    setBntToken(tokens.find((x) => x.address === networkVars.bntToken));
  }, [tokens, chainId]);

  const refresh = useCallback(async () => {
    if (account) {
      const [
        unstakeVbntTimer,
        stakedVbntAmount,
        unstakeBntTimer,
        stakedBntAmount,
      ] = await Promise.all([
        getUnstakeTimer(account, false),
        getStakedAmount(account, false),
        getUnstakeTimer(account, true),
        getStakedAmount(account, true),
      ]);

      dispatch(setUnstakeVbntTimer(unstakeVbntTimer));
      dispatch(setStakedVbntAmount(stakedVbntAmount));
      dispatch(setUnstakeBntTimer(unstakeBntTimer));
      dispatch(setStakedBntAmount(stakedBntAmount));
    } else {
      dispatch(setUnstakeVbntTimer(undefined));
      dispatch(setStakedVbntAmount(undefined));
      dispatch(setUnstakeBntTimer(undefined));
      dispatch(setStakedBntAmount(undefined));
    }
  }, [account, dispatch]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <Page
      title={'Vote'}
      subtitle={`Bancor is a DAO managed by vBNT and/or BNT stakers who determine the future of 
      the protocol with their proposals. In order to actively participate in the DAO, stake vBNT 
      or BNT (or both) to receive voting powers.`}
    >
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-30 gap-x-50">
          <VoteCardDivided>
            <StakeCard
              account={account}
              govToken={vbntToken}
              setIsStake={setIsVbntStake}
              setStakeModal={setStakeVbntModal}
              symbol="vBNT"
              stakeAmount={stakeVbntAmount}
            />
            <UnstakeCard
              isUnlocked={isVbntUnlocked}
              setIsStake={setIsVbntStake}
              setStakeModal={setStakeVbntModal}
              stakeAmount={stakeVbntAmount}
              symbol="vBNT"
              unstakeTime={unstakeVbntTime}
              setIsUnlocked={setIsVbntUnlocked}
            />
          </VoteCardDivided>
          <VoteCardDivided>
            <StakeCard
              account={account}
              govToken={bntToken}
              setIsStake={setIsBntStake}
              setStakeModal={setStakeBntModal}
              symbol="BNT"
              stakeAmount={stakeBntAmount}
            />
            <UnstakeCard
              isUnlocked={isBntUnlocked}
              setIsStake={setIsBntStake}
              setStakeModal={setStakeBntModal}
              stakeAmount={stakeBntAmount}
              symbol="BNT"
              unstakeTime={unstakeBntTime}
              setIsUnlocked={setIsBntUnlocked}
            />
          </VoteCardDivided>
          <VoteCardDivided>
            <VoteCard
              stakedAny={
                Number(stakeVbntAmount) !== 0 || Number(stakeBntAmount) !== 0
              }
            />
            <LegacyVoteCard />
          </VoteCardDivided>
        </div>
        {vbntToken && (
          <ModalVbnt
            key="vbntModal"
            isOpen={stakeVbntModal}
            setIsOpen={setStakeVbntModal}
            token={vbntToken}
            stake={isVbntStake}
            stakeBalance={stakeVbntAmount}
            onCompleted={refresh}
          />
        )}
        {bntToken && (
          <ModalVbnt
            key="bntModal"
            isOpen={stakeBntModal}
            setIsOpen={setStakeBntModal}
            token={bntToken}
            stake={isBntStake}
            stakeBalance={stakeBntAmount}
            onCompleted={refresh}
          />
        )}
      </>
    </Page>
  );
};
