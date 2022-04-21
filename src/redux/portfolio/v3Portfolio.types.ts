import { uniqueId } from 'lodash';
import { mockToken } from 'utils/mocked';
import { Token } from 'services/observables/tokens';
import { RewardsProgramStake } from 'services/web3/v3/portfolio/standardStaking';

export const mockBonuses: Bonus[] = [
  {
    id: uniqueId(),
    token: mockToken,
    claimable: [
      { id: uniqueId(), token: mockToken, amount: '123.123' },
      { id: uniqueId(), token: mockToken, amount: '123.123' },
    ],
  },
  {
    id: uniqueId(),
    token: mockToken,
    claimable: [
      { id: uniqueId(), token: mockToken, amount: '123.123' },
      { id: uniqueId(), token: mockToken, amount: '123.123' },
    ],
  },
];

export interface V3PortfolioState {
  holdingsRaw: HoldingRaw[];
  isLoadingHoldings: boolean;
  withdrawalRequestsRaw: WithdrawalRequestRaw[];
  withdrawalSettings: WithdrawalSettings;
  isLoadingWithdrawalRequests: boolean;
  bonusesModal: boolean;
  bonuses: Bonus[];
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

export interface Bonus {
  id: string;
  token: Token;
  claimable: BonusClaimable[];
}

export interface HoldingRaw {
  poolTokenId: string;
  poolId: string;
  poolTokenBalanceWei: string;
  tokenBalanceWei: string;
}

export interface Holding
  extends Omit<HoldingRaw, 'poolTokenBalanceWei' | 'tokenBalanceWei'> {
  token: Token;
  poolTokenBalance: string;
  tokenBalance: string;
  standardStakingReward?: RewardsProgramStake;
  combinedTokenBalance: string;
}
