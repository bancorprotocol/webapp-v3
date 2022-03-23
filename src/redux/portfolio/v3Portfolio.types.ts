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
}

export interface V3PortfolioState {
  holdingsRaw: HoldingRaw[];
  bonusesModal: boolean;
  bonuses: Bonus[];
}
