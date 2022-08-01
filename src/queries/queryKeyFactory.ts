export abstract class QueryKey {
  private static _v2 = () => ['v2'];
  private static _v3 = () => ['v3'];
  private static _chain = () => [...this._v3(), 'chain'];
  private static _chainPools = (key?: number | string) => [
    ...this._chain(),
    'pools',
    key,
  ];

  static chainPoolIds = () => [...this._chainPools('poolIds')];
  static chainPoolTokenIds = (key?: number) => [
    ...this._chainPools(key),
    'poolTokenIds',
  ];
  static chainSymbols = (key?: number) => [...this._chainPools(key), 'symbols'];
  static chainDecimals = (key?: number) => [
    ...this._chainPools(key),
    'decimals',
  ];
  static chainName = (key?: number) => [...this._chainPools(key), 'name'];
  static chainTradingEnabled = (key?: number) => [
    ...this._chainPools(key),
    'tradingEnabled',
  ];
  static chainTradingLiquidity = (key?: number) => [
    ...this._chainPools(key),
    'tradingLiquidity',
  ];
  static chainDepositingEnabled = (key?: number) => [
    ...this._chainPools(key),
    'depositingEnabled',
  ];
  static chainStakedBalance = (key?: number) => [
    ...this._chainPools(key),
    'stakedBalance',
  ];
  static chainTradingFee = (key?: number) => [
    ...this._chainPools(key),
    'tradingFee',
  ];
  static chainLatestProgram = (key?: number) => [
    ...this._chainPools(key),
    'latestProgramId',
  ];
  static chainPrograms = (key?: number) => [
    ...this._chainPools(key),
    'programs',
  ];
  static chainBalances = (user?: string | null) => [
    ...this._chain(),
    'balances',
    user,
  ];
  static chainVoteBalance = (user?: string) => [...this._chain(), 'vote', user];

  static v2ApiWelcome = () => [...this._v2(), 'api', 'welcome'];

  private static _v3Api = () => [...this._v3(), 'api'];
  static apiPools = () => [...this._v3Api(), 'pools'];
  static apiTokens = () => [...this._v3Api(), 'tokens'];
  static apiBnt = () => [...this._v3Api(), 'bnt'];
  static apiStatistics = () => [...this._v3Api(), 'statistics'];
}
