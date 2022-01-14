import { swap } from 'services/router';
import { EthNetworks } from '../web3/types';

declare global {
  interface Window {
    dataLayer: any;
    ethereum: any;
  }
}

export const googleTagManager = (id: string, name: string | null) => {
  if (window.dataLayer) return;

  window.dataLayer = [
    {
      wallet:
        id && name
          ? {
              id: id,
              name: name,
            }
          : {},
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

const conversionTxt = (event: ConversionEvents): string => {
  switch (event) {
    case ConversionEvents.click:
      return 'Conversion Swap Click';
    case ConversionEvents.approvePop:
      return 'Conversion Unlimited Popup';
    case ConversionEvents.approved:
      return 'Conversion Unlimited Popup Select';
    case ConversionEvents.wallet_req:
      return 'Conversion Wallet Confirmation Request';
    case ConversionEvents.wallet_confirm:
      return 'Conversion Wallet Confirmed';
    case ConversionEvents.fail:
      return 'Conversion Failed';
    case ConversionEvents.success:
      return 'Conversion Success';
  }
};

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
    event: 'CE ' + conversionTxt(ConversionEvents.approved),
    user_properties: undefined,
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
    event: 'CE ' + conversionTxt(ConversionEvents.success),
    user_properties: undefined,
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
    event: 'CE ' + conversionTxt(ConversionEvents.fail),
    user_properties: undefined,
    event_properties: {
      conversion: currentConversion,
      error: errorMsg,
    },
    ga_event: {
      category: 'Conversion',
    },
  };
  sendGTM(gtmData);
};

export const sendConversionEvent = (event: ConversionEvents) => {
  const gtmData = {
    event: 'CE ' + conversionTxt(event),
    user_properties: undefined,
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
const walletTxt = (event: WalletEvents): string => {
  switch (event) {
    case WalletEvents.popup:
      return 'Wallet Connect Select Wallet Popup';
    case WalletEvents.click:
      return 'Wallet Connect Wallet Icon Click';
    case WalletEvents.connect:
      return 'Wallet Connect';
  }
};

export const sendWalletEvent = (
  walletEvent: WalletEvents,
  event_properties: {} | undefined = undefined,
  id: string = '',
  name: string = ''
) => {
  const wallet = 'Wallet';
  const event = walletTxt(walletEvent);
  if (id && name)
    sendGTM({
      event: 'CE ' + event,
      ga_event: {
        category: wallet,
      },
      user_properties: {
        wallet_id: id,
        wallet_name: name,
      },
      wallet: {
        id,
        name,
      },
    });
  else
    sendGTM({
      event: 'CE ' + event,
      event_properties: event_properties,
      user_properties: undefined,
      ga_event: {
        category: wallet,
      },
    });
};

export const sendInsight = (open: boolean) => {
  sendGTM({
    event: `CE Conversion Insights ${open ? 'Open' : 'Closed'}`,
    event_properties: undefined,
    user_properties: undefined,
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
      swap_insights: to === swap ? (open ? 'Open' : 'Closed') : undefined,
    },
    user_properties: undefined,
    ga_event: undefined,
  });
};
