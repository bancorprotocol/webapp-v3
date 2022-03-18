import { uniqueId } from 'lodash';
import { mockToken } from 'utils/mocked';
import { Token } from 'services/observables/tokens';

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
export interface RewardsProgram {
  id: number;
  pool: string;
  poolToken: string;
  rewardsToken: string;
  isEnabled: boolean;
  startTime: number;
  endTime: number;
  rewardRate: string;
}
export interface ProviderStake {
  programId: number;
  amount: string;
}

export interface RewardsEarning extends ProviderStake {
  program: RewardsProgram;
}

export interface V3PortfolioState {
  allRewardsPrograms: RewardsProgram[];
  providerProgramStakes: ProviderStake[];
  bonusesModal: boolean;
  bonuses: Bonus[];
}
