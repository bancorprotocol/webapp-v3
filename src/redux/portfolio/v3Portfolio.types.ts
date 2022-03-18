import { uniqueId } from 'lodash';
import { mockToken } from 'utils/mocked';
import { Token } from 'services/observables/tokens';
import { BigNumber } from 'ethers';
import { ProgramDataStructOutput } from 'services/web3/abis/types/StandardStakingRewardsV1';

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

export interface ProviderStake {
  programId: BigNumber;
  amount: BigNumber;
}

export interface RewardsEarning extends ProviderStake {
  program: ProgramDataStructOutput;
}

export interface V3PortfolioState {
  allRewardsPrograms: ProgramDataStructOutput[];
  providerProgramStakes: ProviderStake[];
  bonusesModal: boolean;
  bonuses: Bonus[];
}
