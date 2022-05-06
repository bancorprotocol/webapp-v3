import { PageTradeQuery } from 'router/trade.routes';

export abstract class BancorRoutes {
  static index = '/';
  static termsOfUse = '/terms-of-use';
  static privacyPolicy = '/privacy-policy';
  static notFound = '/404';
  static admin = '/admin';
  static welcome = '/welcome';
  static earn = '/earn';
  static earnV2 = this.earn + '/v2';
  static tokens = '/tokens';
  static vote = '/vote';
  static fiat = '/fiat';
  static portfolio = '/portfolio';
  static portfolioV1 = this.portfolio + '/v1';
  static portfolioV2 = this.portfolio + '/v2';
  static portfolioV2RewardsClaim = this.portfolioV2 + '/rewards/claim';
  static portfolioV2RewardsStake = (id: string, posGroupId?: string) =>
    `${this.portfolioV2}/rewards/stake/${id}${
      posGroupId ? `?posGroupId=${posGroupId}` : ''
    }`;

  static addLiquidityV2 = (id: string) => this.earnV2 + '/add-liquidity/' + id;

  static trade = (query?: PageTradeQuery) => {
    const path = '/trade';

    const from = query?.from ? `from=${query.from}` : '';
    const to = query?.to ? `to=${query.to}` : '';
    const limit = query?.limit ? 'limit=true' : '';
    const search = [from, to, limit].filter((x) => !!x).join('&');

    return [path, search].filter((x) => !!x).join('?');
  };
}
