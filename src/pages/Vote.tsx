import { useWeb3React } from '@web3-react/core';
import { ReactComponent as IconLink } from 'assets/icons/link.svg';
import { CountdownTimer } from 'components/countdownTimer/CountdownTimer';
import { ModalVbnt } from 'elements/modalVbnt/ModalVbnt';
import { useCallback, useState } from 'react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'store';
import { openWalletModal } from 'store/user/user';
import { Token } from 'services/observables/tokens';
import { getNetworkVariables } from 'services/web3/config';
import {
  getStakedAmount,
  getUnstakeTimer,
} from 'services/web3/governance/governance';
import { prettifyNumber } from 'utils/helperFunctions';
import { openNewTab } from 'utils/pureFunctions';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { Page } from 'components/Page';

interface VoteCardProps {
  title: string;
  step: number;
  content: string;
  button: string;
  onClick: Function;
  footer: JSX.Element;
}
const VoteCard = ({
  title,
  step,
  content,
  button,
  onClick,
  footer,
}: VoteCardProps) => {
  return (
    <div className="content-block flex flex-col max-w-[535px] min-h-[325px] px-30 pt-30 pb-[22px] md:hover:shadow-lg">
      <div className="flex text-20 font-semibold mb-18">
        <div className="text-primary dark:text-primary-light mr-12">{`Step ${step}`}</div>
        {title}
      </div>
      <div className="text-secondary mb-auto">{content}</div>
      <Button className="w-[220px] mt-20" onClick={() => onClick()}>
        {button}
      </Button>
      <hr className="widget-separator mb-15 mt-50" />
      <div className="min-h-[48px]">{footer}</div>
    </div>
  );
};

export const Vote = () => {
  const { chainId } = useWeb3React();
  const account = useAppSelector((state) => state.user.account);
  const tokens = useAppSelector<Token[]>((state) => state.bancor.tokens);
  const [govToken, setGovToken] = useState<Token | undefined>();
  const [stakeAmount, setStakeAmount] = useState<string | undefined>();
  const [unstakeTime, setUnstakeTime] = useState<number | undefined>();
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [stakeModal, setStakeModal] = useState<boolean>(false);
  const [isStake, setIsStake] = useState<boolean>(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const networkVars = getNetworkVariables();
    setGovToken(tokens.find((x) => x.address === networkVars.govToken));
  }, [tokens, chainId]);

  const refresh = useCallback(async () => {
    if (account && govToken) {
      const [unstakeTimer, stakedAmount] = await Promise.all([
        getUnstakeTimer(account),
        getStakedAmount(account, govToken),
      ]);
      setUnstakeTime(unstakeTimer);
      setStakeAmount(stakedAmount);
    } else {
      setUnstakeTime(undefined);
      setStakeAmount(undefined);
    }
  }, [account, govToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const title = 'Vote';
  const subtitle =
    'Bancor is a DAO managed by vBNT stakers who determine the future of the protocol with their proposals.';

  return (
    <Page title={title} subtitle={subtitle}>
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-50 gap-x-50">
          <VoteCard
            step={1}
            title="Stake your vBNT"
            content="In order to participate in Bancor governance activities, you should first stake your vBNT tokens."
            button="Stake Tokens"
            onClick={() => {
              if (!account) {
                dispatch(openWalletModal(true));
                return;
              }

              setIsStake(true);
              setStakeModal(true);
            }}
            footer={
              <div className="grid grid-cols-2 text-grey dark:text-white">
                <div>
                  {!account || (govToken && govToken.balance) ? (
                    <div className="text-charcoal font-semibold text-20 dark:text-white mb-4">
                      {govToken && govToken.balance
                        ? `${prettifyNumber(govToken.balance)} ${
                            govToken.symbol
                          }`
                        : '--'}
                    </div>
                  ) : (
                    <div className="loading-skeleton h-[24px] w-[140px] mb-4" />
                  )}
                  <div className="text-secondary">Unstaked Balance</div>
                </div>
                <div>
                  {!account || stakeAmount ? (
                    <div className="text-charcoal font-semibold text-20 dark:text-white mb-4">
                      {stakeAmount && govToken
                        ? `${prettifyNumber(stakeAmount)} ${govToken.symbol}`
                        : '--'}
                    </div>
                  ) : (
                    <div className="loading-skeleton h-[24px] w-[140px] mb-4" />
                  )}
                  <div className="text-secondary">Staked Balance</div>
                </div>
              </div>
            }
          />
          <VoteCard
            step={2}
            title="Make a Difference"
            content="Voting on Bancor DAO is free as it is using the Snapshot off-chain infrastructure. Every user can vote on every available proposal and help shape the future of the Bancor Protocol."
            button="Vote on Snapshot"
            onClick={() => {
              openNewTab('https://vote.bancor.network/');
            }}
            footer={
              <div className="flex items-end h-[48px]">
                <a
                  href="https://support.bancor.network/hc/en-us/articles/5476957904914-Guide-Bancor-Governance-Voting"
                  target="_blank"
                  className="flex items-center text-primary dark:text-primary-light font-medium"
                  rel="noreferrer"
                >
                  How to Vote <IconLink className="w-14 ml-6" />
                </a>
              </div>
            }
          />

          <div className="content-block flex flex-col md:flex-row md:col-span-2 md:items-center md:hover:shadow-lg">
            <div className="flex flex-col max-w-[520px] min-h-[170px] p-24">
              <div className="text-16 text-charcoal dark:text-white mb-18 font-medium">
                Unstake from Governance
              </div>

              <div className="text-secondary text-12 mb-auto">
                In order to remove vBNT from governance you would need to
                unstake them first.
              </div>
              <div className="md:flex items-center w-full">
                <Button
                  variant={
                    (!!unstakeTime ||
                      !stakeAmount ||
                      Number(stakeAmount) === 0) &&
                    !isUnlocked
                      ? ButtonVariant.SECONDARY
                      : ButtonVariant.PRIMARY
                  }
                  size={ButtonSize.SMALL}
                  className={`w-full mt-20 md:mt-0 md:max-w-[190px]`}
                  disabled={
                    (!!unstakeTime ||
                      !stakeAmount ||
                      Number(stakeAmount) === 0) &&
                    !isUnlocked
                  }
                  onClick={() => {
                    setIsStake(false);
                    setStakeModal(true);
                  }}
                >
                  Unstake Tokens
                </Button>
                {unstakeTime && !isUnlocked && (
                  <div className="flex text-12 text-graphite md:ml-10 justify-center md:justify-start mt-10 md:mt-0 md:text-left w-full">
                    <span className="mr-4">Unstake available in</span>
                    <CountdownTimer
                      date={unstakeTime}
                      onEnded={() => setIsUnlocked(true)}
                    />
                  </div>
                )}
              </div>
            </div>
            <hr className="widget-separator md:transform md:rotate-90 md:w-[120px] my-0 ml-2" />
            <div className="flex flex-col max-w-[525px] min-h-[170px] py-24 pl-24 md:pl-8">
              <div className="text-16 text-charcoal dark:text-white mb-18 font-medium">
                Legacy onchain contract
              </div>

              <div className="text-secondary text-12 mb-auto">
                View previous votes and decisions made onchain.
              </div>

              <a
                href="https://etherscan.io/address/0x892f481bd6e9d7d26ae365211d9b45175d5d00e4"
                target="_blank"
                className="flex items-center text-primary dark:text-primary-light font-medium"
                rel="noreferrer"
              >
                View Legacy Gov <IconLink className="w-14 ml-6" />
              </a>
            </div>
          </div>
        </div>
        {govToken && (
          <ModalVbnt
            isOpen={stakeModal}
            setIsOpen={setStakeModal}
            token={govToken}
            stake={isStake}
            stakeBalance={stakeAmount}
            onCompleted={refresh}
          />
        )}
      </>
    </Page>
  );
};
