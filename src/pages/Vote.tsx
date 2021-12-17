import { useWeb3React } from '@web3-react/core';
import { ReactComponent as IconLink } from 'assets/icons/link.svg';
import { CountdownTimer } from 'components/countdownTimer/CountdownTimer';
import { ModalVbnt } from 'elements/modalVbnt/ModalVbnt';
import { useCallback, useState } from 'react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'redux/index';
import { openWalletModal } from 'redux/user/user';
import { Token } from 'services/observables/tokens';
import { getNetworkVariables } from 'services/web3/config';
import {
  getStakedAmount,
  getUnstakeTimer,
} from 'services/web3/governance/governance';
import { EthNetworks } from 'services/web3/types';
import { prettifyNumber } from 'utils/helperFunctions';
import { openNewTab } from 'utils/pureFunctions';

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
    <div className="flex flex-col bg-white dark:bg-blue-4 max-w-[535px] min-h-[325px] px-30 pt-30 pb-[22px] shadow hover:shadow-lg dark:shadow-none rounded-20">
      <div className="flex text-20 font-semibold mb-18">
        <div className="text-primary dark:text-primary-light mr-12">{`Step ${step}`}</div>
        {title}
      </div>
      <div className="text-14 text-grey-4 dark:text-grey-0 mb-auto">
        {content}
      </div>
      <button
        className="btn-primary rounded w-[220px] h-[37px] mt-20 text-14"
        onClick={() => onClick()}
      >
        {button}
      </button>
      <hr className="widget-separator mb-15 mt-50" />
      <div className="min-h-[48px]">{footer}</div>
    </div>
  );
};

export const Vote = () => {
  const { chainId, account } = useWeb3React();
  const tokens = useAppSelector<Token[]>((state) => state.bancor.tokens);
  const [govToken, setGovToken] = useState<Token | undefined>();
  const [stakeAmount, setStakeAmount] = useState<string | undefined>();
  const [unstakeTime, setUnstakeTime] = useState<number | undefined>();
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [stakeModal, setStakeModal] = useState<boolean>(false);
  const [isStake, setIsStake] = useState<boolean>(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const networkVars = getNetworkVariables(
      chainId ? chainId : EthNetworks.Mainnet
    );
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

  return (
    <div className="flex flex-col text-14 max-w-[1140px] md:mx-auto mx-20">
      <div className="font-bold text-3xl text-blue-4 dark:text-grey-0 mb-18">
        Vote
      </div>
      <div className="text-blue-4 dark:text-grey-0 mb-44">
        Bancor is a DAO managed by vBNT stakers who determine the future of the
        protocol with their proposals.
      </div>

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
            <div className="grid grid-cols-2 text-grey-4 dark:text-grey-0">
              <div>
                {!account || (govToken && govToken.balance) ? (
                  <div className="text-blue-4 font-semibold text-20 dark:text-grey-0 mb-4">
                    {govToken && govToken.balance
                      ? `${prettifyNumber(govToken.balance)} ${govToken.symbol}`
                      : '--'}
                  </div>
                ) : (
                  <div className="loading-skeleton h-[24px] w-[140px] mb-4" />
                )}
                Unstaked Balance
              </div>
              <div>
                {!account || stakeAmount ? (
                  <div className="text-blue-4 font-semibold text-20 dark:text-grey-0 mb-4">
                    {stakeAmount && govToken
                      ? `${prettifyNumber(stakeAmount)} ${govToken.symbol}`
                      : '--'}
                  </div>
                ) : (
                  <div className="loading-skeleton h-[24px] w-[140px] mb-4" />
                )}
                Staked Balance
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
                href="https://blog.bancor.network/gasless-voting-is-live-on-bancor-governance-82d232da16b9"
                target="_blank"
                className="flex items-center text-primary dark:text-primary-light font-medium"
                rel="noreferrer"
              >
                How to Vote <IconLink className="w-14 ml-6" />
              </a>
            </div>
          }
        />

        <div className="flex flex-col md:flex-row md:col-span-2 md:items-center bg-white dark:bg-blue-4 shadow hover:shadow-lg dark:shadow-none rounded-20 mb-20">
          <div className="flex flex-col max-w-[520px] min-h-[170px] p-24">
            <div className="text-16 text-blue-4 dark:text-grey-0 mb-18 font-medium">
              Unstake from Governance
            </div>

            <div className="text-12 text-grey-4 dark:text-grey-0 mb-auto">
              In order to remove vBNT from governance you would need to unstake
              them first.
            </div>
            <div className="md:flex items-center w-full">
              <button
                className={`text-12 font-medium btn-sm rounded-10 w-full mt-20 md:mt-0 md:max-w-[190px]  ${
                  (!!unstakeTime ||
                    !stakeAmount ||
                    Number(stakeAmount) === 0) &&
                  !isUnlocked
                    ? 'btn-outline-secondary text-grey-3 dark:bg-blue-3 dark:text-grey-3 dark:border-grey-3'
                    : 'btn-outline-primary border border-primary hover:border-primary-dark hover:bg-white hover:text-primary-dark dark:border-primary-light dark:hover:border-primary-light dark:hover:bg-blue-3 dark:hover:text-primary-light'
                }`}
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
              </button>
              {unstakeTime && !isUnlocked && (
                <div className="flex text-12 text-grey-3 md:ml-10 justify-center md:justify-start mt-10 md:mt-0 md:text-left w-full">
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
            <div className="text-16 text-blue-4 dark:text-grey-0 mb-18 font-medium">
              Legacy onchain contract
            </div>

            <div className="text-12 text-grey-4 dark:text-grey-0 mb-auto">
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
    </div>
  );
};
