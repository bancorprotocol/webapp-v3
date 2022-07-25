import {
  Events,
  eventTxtMap,
  getBlockchainNetwork,
  getFiat,
  getUnlimitedLimited,
  sendGTM,
} from 'services/api/googleTagManager';

interface CurrentConversion {
  conversion_type: 'Limit' | 'Market';
  conversion_blockchain_network: string;
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
    conversion_blockchain_network: getBlockchainNetwork(),
    conversion_token_pair: tokenPair,
    conversion_from_token: fromToken,
    conversion_to_token: toToken,
    conversion_from_amount: fromAmount,
    conversion_from_amount_usd: fromAmountUsd,
    conversion_to_amount: toAmount,
    conversion_to_amount_usd: toAmountUsd,
    conversion_input_type: getFiat(usdToggle),
    conversion_rate: rate,
    conversion_rate_percentage: ratePercentage,
    conversion_experation: expiration,
    conversion_settings: settings,
  };
};

export const sendConversionEvent = (
  event: Events,
  transaction_hash?: string,
  unlimitied_selection?: boolean,
  error?: string
) => {
  const eventClickPrefix = event === Events.click ? 'Swap ' : '';
  const gtmData = {
    event: `Conversion ${eventClickPrefix}${eventTxtMap.get(event)}`,
    wallet_properties: undefined,
    event_properties: {
      ...currentConversion,
      transaction_hash,
      unlimitied_selection: getUnlimitedLimited(!!unlimitied_selection),
      error,
    },
    ga_event: {
      category: 'Conversion',
    },
  };
  sendGTM(gtmData);
};
