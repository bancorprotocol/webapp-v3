import { Token } from 'services/observables/tokens';
import { RewardsProgramStake } from 'services/web3/v3/portfolio/standardStaking';
import { PoolV3 } from 'services/observables/pools';

export interface V3PortfolioState {
  isPortfolioLoading: boolean;
  holdingsRaw: HoldingRaw[];
  isLoadingHoldings: boolean;
  withdrawalRequestsRaw: WithdrawalRequestRaw[];
  withdrawalSettings: WithdrawalSettings;
  isLoadingWithdrawalRequests: boolean;
  bonusesModal: boolean;
  standardRewards: RewardsProgramStake[];
  isLoadingStandardRewards: boolean;
}

export interface WithdrawalRequestRaw {
  id: number;
  provider: string;
  poolToken: string;
  reserveToken: string;
  createdAt: number;
  poolTokenAmountWei: string;
  reserveTokenAmountWei: string;
}

export interface WithdrawalRequest
  extends Omit<
    WithdrawalRequestRaw,
    'poolTokenAmountWei' | 'reserveTokenAmountWei'
  > {
  lockEndsAt: number;
  poolTokenAmount: string;
  reserveTokenAmount: string;
  token: Token;
}

export interface WithdrawalSettings {
  lockDuration: number;
  withdrawalFee: number;
}

export interface BonusClaimable {
  id: string;
  token: Token;
  amount: string;
}

export interface HoldingRaw {
  poolTokenId: string;
  poolDltId: string;
  poolTokenBalanceWei: string;
  tokenBalanceWei: string;
}

export interface Holding {
  pool: PoolV3;
  poolTokenBalance: string;
  tokenBalance: string;
  standardStakingReward?: RewardsProgramStake;
  combinedTokenBalance: string;
}
