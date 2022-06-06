import { BancorURL } from 'router/bancorURL.service';

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

export const sendGTM = (data: {}) => {
  const dataLayer = window.dataLayer as {}[];
  if (dataLayer) dataLayer.push(data);
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
      swap_insights:
        to === BancorURL.trade() ? (open ? 'Open' : 'Closed') : undefined,
    },
    wallet_properties: undefined,
    ga_event: undefined,
  });
};
