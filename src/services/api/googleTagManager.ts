import { trade } from 'services/router';
import { EthNetworks } from '../web3/types';

declare global {
  interface Window {
    dataLayer: any;
    ethereum: any;
  }
}

export const googleTagManager = () => {
  if (window.dataLayer) return;

  window.dataLayer = [
    {
      page: { class: 'App' },
    },
  ];

  init(window, document, 'script', 'dataLayer', 'GTM-TCBKR7W');
  sendGTMPath(undefined, window.location.pathname);
};

const init = (w: any, d: any, s: any, l: any, i: any) => {
  w[l] = w[l] || [];
  w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  var f = d.getElementsByTagName(s)[0],
    j = d.createElement(s),
    dl = l !== 'dataLayer' ? '&l=' + l : '';
  j.async = true;
  j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
  f.parentNode.insertBefore(j, f);
};

const sendGTM = (data: {}) => {
  const dataLayer = window.dataLayer as {}[];
  if (dataLayer) dataLayer.push(data);
};

export enum ConversionEvents {
  click,
  approvePop,
  approved,
  wallet_req,
  wallet_confirm,
  fail,
  success,
}

const eventTxtMap = new Map([
  [ConversionEvents.click, 'Click'],
  [ConversionEvents.approvePop, 'Unlimited Popup'],
  [ConversionEvents.approved, 'Unlimited Popup Select'],
  [ConversionEvents.wallet_req, 'Wallet Confirmation Request'],
  [ConversionEvents.wallet_confirm, 'Wallet Confirmed'],
  [ConversionEvents.fail, 'Failed'],
  [ConversionEvents.success, 'Success'],
]);

interface CurrentConversion {
  conversion_type: 'Limit' | 'Market';
  conversion_blockchain_network: 'Ropsten' | 'MainNet';
  conversion_token_pair: string;
  conversion_from_token: string;
  conversion_to_token: string;
  conversion_from_amount: string;
  conversion_from_amount_usd: string;
  conversion_to_amount: string;
  conversion_to_amount_usd: string;
  conversion_input_type: 'Fiat' | 'Token';
  conversion_rate: string;
  conversion_rate_percentage?: string;
  conversion_experation?: string;
  conversion_settings?: 'Regular' | 'Advanced';
}

let currentConversion: CurrentConversion;
export const setCurrentConversion = (
  type: 'Limit' | 'Market',
  network: EthNetworks = EthNetworks.Mainnet,
  tokenPair: string,
  fromToken: string,
  toToken: string = '',
  fromAmount: string,
  fromAmountUsd: string,
  toAmount: string,
  toAmountUsd: string,
  usdToggle: boolean,
  rate: string,
  ratePercentage?: string,
  expiration?: string,
  settings?: 'Regular' | 'Advanced'
) => {
  currentConversion = {
    conversion_type: type,
    conversion_blockchain_network:
      network === EthNetworks.Ropsten ? 'Ropsten' : 'MainNet',
    conversion_token_pair: tokenPair,
    conversion_from_token: fromToken,
    conversion_to_token: toToken,
    conversion_from_amount: fromAmount,
    conversion_from_amount_usd: fromAmountUsd,
    conversion_to_amount: toAmount,
    conversion_to_amount_usd: toAmountUsd,
    conversion_input_type: usdToggle ? 'Fiat' : 'Token',
    conversion_rate: rate,
    conversion_rate_percentage: ratePercentage,
    conversion_experation: expiration,
    conversion_settings: settings,
  };
};

export const sendConversionApprovedEvent = (isUnlimited: boolean) => {
  const gtmData = {
    event: 'CE Conversion ' + eventTxtMap.get(ConversionEvents.approved),
    wallet_properties: undefined,
    event_properties: {
      ...currentConversion,
      conversion_unlimited: isUnlimited ? 'Unlimited' : 'Limited',
    },
    ga_event: {
      category: 'Conversion',
    },
  };
  sendGTM(gtmData);
};

export const sendConversionSuccessEvent = (fromTokenPrice: string | null) => {
  const gtmData = {
    event: 'CE Conversion ' + eventTxtMap.get(ConversionEvents.success),
    wallet_properties: undefined,
    event_properties: {
      ...currentConversion,
      conversion_market_token_rate: fromTokenPrice,
      transaction_category: 'Conversion',
    },
    ga_event: {
      category: 'Conversion',
    },
  };
  sendGTM(gtmData);
};

export const sendConversionFailEvent = (errorMsg: string) => {
  const gtmData = {
    event: 'CE Conversion ' + eventTxtMap.get(ConversionEvents.fail),
    wallet_properties: undefined,
    event_properties: {
      ...currentConversion,
      error: errorMsg,
    },
    ga_event: {
      category: 'Conversion',
    },
  };
  sendGTM(gtmData);
};

export const sendConversionEvent = (event: ConversionEvents) => {
  const eventClickPrefix = event === ConversionEvents.click ? 'Swap ' : '';
  const gtmData = {
    event: `CE Conversion ${eventClickPrefix}${eventTxtMap.get(event)}`,
    wallet_properties: undefined,
    event_properties: currentConversion,
    ga_event: {
      category: 'Conversion',
    },
  };
  sendGTM(gtmData);
};

export enum WalletEvents {
  popup,
  click,
  connect,
}
const walletTxtMap = new Map([
  [WalletEvents.popup, 'Wallet Connect Select Wallet Popup'],
  [WalletEvents.click, 'Wallet Connect Wallet Icon Click'],
  [WalletEvents.connect, 'Wallet Connect'],
]);

export const sendWalletEvent = (
  walletEvent: WalletEvents,
  event_properties: {} | undefined = undefined,
  id: string = '',
  name: string = ''
) => {
  const wallet = 'Wallet';
  const event = walletTxtMap.get(walletEvent);
  if (id && name)
    sendGTM({
      event: 'CE ' + event,
      ga_event: {
        category: wallet,
      },
      wallet_properties: {
        wallet_id: id,
        wallet_name: name,
      },
    });
  else
    sendGTM({
      event: 'CE ' + event,
      event_properties: event_properties,
      wallet_properties: undefined,
      ga_event: {
        category: wallet,
      },
    });
};

export const sendInsight = (open: boolean) => {
  sendGTM({
    event: `CE Conversion Insights ${open ? 'Open' : 'Closed'}`,
    event_properties: undefined,
    wallet_properties: undefined,
    ga_event: {
      category: 'Conversion',
    },
    page: { swap_insights: open ? 'Open' : 'Closed' },
  });
};

export const sendGTMPath = (
  from: string | undefined,
  to: string,
  darkMode: boolean = false
) => {
  const item = localStorage.getItem('insightsExpanded');
  const open = item ? (JSON.parse(item) as boolean) : false;
  sendGTM({
    event: 'VP ' + to,
    page: {
      from_path: from,
      to_path: to,
      theme: darkMode ? 'Dark' : 'Light',
      currency: 'USD',
      swap_insights: to === trade ? (open ? 'Open' : 'Closed') : undefined,
    },
    wallet_properties: undefined,
    ga_event: undefined,
  });
};

interface CurrentLiquidity {
  liquidity_type:
    | 'Deposit Dual'
    | 'Withdraw Dual'
    | 'Deposit Single'
    | 'Withdraw Single';
  liquidity_blockchain_network: 'Ropsten' | 'MainNet';
  liquidity_pool: string;
  liquidity_token_symbol: string;
  liquidity_token_amount: string;
  liquidity_token_amount_usd?: number | string;
  liquidity_bnt_amount?: string;
  liquidity_bnt_amount_usd?: string;
  liquidity_input_type?: 'Fiat' | 'Token';
}

let currentLiquidity: CurrentLiquidity;
export const setCurrentLiquidity = (
  type: 'Deposit Dual' | 'Withdraw Dual' | 'Deposit Single' | 'Withdraw Single',
  network: EthNetworks = EthNetworks.Mainnet,
  pool: string,
  tokenSymbol: string,
  tokenAmount: string,
  tokenAmountUsd: string | undefined,
  bntAmount: string | undefined,
  bntAmountUsd: string | undefined,
  usdToggle: boolean | undefined
) => {
  currentLiquidity = {
    liquidity_type: type,
    liquidity_blockchain_network:
      network === EthNetworks.Ropsten ? 'Ropsten' : 'MainNet',
    liquidity_pool: pool,
    liquidity_token_symbol: tokenSymbol,
    liquidity_token_amount: tokenAmount,
    liquidity_token_amount_usd: tokenAmountUsd,
    liquidity_bnt_amount: bntAmount,
    liquidity_bnt_amount_usd: bntAmountUsd,
    liquidity_input_type: usdToggle ? 'Fiat' : 'Token',
  };
};

const getLiquidityEventLabel = (event: ConversionEvents) => {
  const type = currentLiquidity.liquidity_type
    .replace(' Dual', '')
    .replace(' Single', '');
  return `CE Liquidity ${type} ${eventTxtMap.get(event)}`;
};

export const sendLiquidityApprovedEvent = (isUnlimited: boolean) => {
  console.log(getLiquidityEventLabel(ConversionEvents.approved));
  const gtmData = {
    event: getLiquidityEventLabel(ConversionEvents.approved),
    wallet_properties: undefined,
    event_properties: {
      ...currentLiquidity,
      liquidity_unlimited: isUnlimited ? 'Unlimited' : 'Limited',
    },
    ga_event: {
      category: 'Liquidity',
    },
  };
  sendGTM(gtmData);
};

export const sendLiquiditySuccessEvent = (txHash: string) => {
  console.log(getLiquidityEventLabel(ConversionEvents.success));
  const gtmData = {
    event: getLiquidityEventLabel(ConversionEvents.success),
    wallet_properties: undefined,
    event_properties: {
      ...currentLiquidity,
      transaction_id: txHash,
      transaction_category: 'Liquidity',
    },
    ga_event: {
      category: 'Liquidity',
    },
  };
  sendGTM(gtmData);
};

export const sendLiquidityFailEvent = (errorMsg: string) => {
  console.log(getLiquidityEventLabel(ConversionEvents.fail));
  const gtmData = {
    event: getLiquidityEventLabel(ConversionEvents.fail),
    wallet_properties: undefined,
    event_properties: {
      ...currentLiquidity,
      error: errorMsg,
    },
    ga_event: {
      category: 'Liquidity',
    },
  };
  sendGTM(gtmData);
};

export const sendLiquidityPoolClickEvent = (
  type: 'Withdraw' | 'Deposit',
  pool: string,
  tokenSymbol: string | undefined,
  network: EthNetworks = EthNetworks.Mainnet
) => {
  const gtmData = {
    event: `CE Liquidity ${type} Pool Click`,
    wallet_properties: undefined,
    event_properties: {
      liquidity_type: 'Withdraw Single',
      liquidity_blockchain_network:
        network === EthNetworks.Ropsten ? 'Ropsten' : 'MainNet',
      liquidity_pool: pool,
      liquidity_token_symbol: tokenSymbol,
    },
    ga_event: {
      category: 'Liquidity',
    },
  };
  console.log(gtmData);
  sendGTM(gtmData);
};

export const sendLiquidityEvent = (event: ConversionEvents) => {
  console.log(getLiquidityEventLabel(event));
  const gtmData = {
    event: getLiquidityEventLabel(event),
    wallet_properties: undefined,
    event_properties: currentLiquidity,
    ga_event: {
      category: 'Liquidity',
    },
  };
  sendGTM(gtmData);
};
