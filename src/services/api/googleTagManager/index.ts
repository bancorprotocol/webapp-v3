import { BancorURL } from 'router/bancorURL.service';
import { isForkAvailable } from 'services/web3/config';

declare global {
  interface Window {
    dataLayer: any;
    ethereum: any;
    Buffer: Buffer;
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

interface GTMData {
  event?: string;
  event_properties?: any;
  ga_event?: {
    category: string;
  };
  wallet_properties?: { wallet_id: string; wallet_name: string };
  page?: any;
}

export const sendGTM = (data: GTMData, prefix: string = 'CE') => {
  const dataLayer = window.dataLayer as {}[];
  if (dataLayer) dataLayer.push({ ...data, event: prefix + ' ' + data.event });
};

export enum Events {
  click,
  approvePop,
  approved,
  wallet_req,
  wallet_confirm,
  fail,
  success,
}

export const eventTxtMap = new Map([
  [Events.click, 'Click'],
  [Events.approvePop, 'Unlimited Popup'],
  [Events.approved, 'Unlimited Popup Select'],
  [Events.wallet_req, 'Wallet Confirmation Request'],
  [Events.wallet_confirm, 'Wallet Confirmed'],
  [Events.fail, 'Failed'],
  [Events.success, 'Success'],
]);

export const sendInsight = (open: boolean) => {
  sendGTM({
    event: `Conversion Insights ${getOpenClosed(open)}`,
    event_properties: undefined,
    wallet_properties: undefined,
    ga_event: {
      category: 'Conversion',
    },
    page: { swap_insights: getOpenClosed(open) },
  });
};

export const sendGTMPath = (
  from: string | undefined,
  to: string,
  darkMode: boolean = false
) => {
  const item = localStorage.getItem('insightsExpanded');
  const open = item ? (JSON.parse(item) as boolean) : false;
  sendGTM(
    {
      event: to,
      page: {
        from_path: from,
        to_path: to,
        theme: getDarkMode(darkMode),
        currency: getCurrency(),
        swap_insights:
          to === BancorURL.trade() ? getOpenClosed(open) : undefined,
      },
      wallet_properties: undefined,
      ga_event: undefined,
    },
    'VP'
  );
};

export const getBlockchain = () => 'Ethereum';

export const getBlockchainNetwork = () =>
  isForkAvailable ? 'Tenderly' : 'MainNet';

export const getFiat = (isFiat?: boolean) => (isFiat ? 'Fiat' : 'Token');

export const getCurrency = () => 'USD';

const getDarkMode = (darkMode: boolean) => (darkMode ? 'Dark' : 'Light');

const getOpenClosed = (open: boolean) => (open ? 'Open' : 'Closed');

export const getOnOff = (on: boolean) => (on ? 'On' : 'Off');

export const getLimitMarket = (limit: boolean) => (limit ? 'Limit' : 'Market');

export const getV2V3 = (v2: boolean) => (v2 ? 'V2' : 'V3');
