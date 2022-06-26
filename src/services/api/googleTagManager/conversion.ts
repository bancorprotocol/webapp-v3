import { EthNetworks } from 'services/web3/types';
import { Events, eventTxtMap, sendGTM } from 'services/api/googleTagManager';

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
    event: 'Conversion ' + eventTxtMap.get(Events.approved),
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

export const sendConversionSuccessEvent = (
  fromTokenPrice: string | null,
  transaction_hash?: string
) => {
  const gtmData = {
    event: 'Conversion ' + eventTxtMap.get(Events.success),
    wallet_properties: undefined,
    event_properties: {
      ...currentConversion,
      conversion_market_token_rate: fromTokenPrice,
      transaction_hash,
    },
    ga_event: {
      category: 'Conversion',
    },
  };
  sendGTM(gtmData);
};

export const sendConversionFailEvent = (errorMsg: string) => {
  const gtmData = {
    event: 'Conversion ' + eventTxtMap.get(Events.fail),
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

export const sendConversionEvent = (
  event: Events,
  transaction_hash?: string
) => {
  const eventClickPrefix = event === Events.click ? 'Swap ' : '';
  const gtmData = {
    event: `Conversion ${eventClickPrefix}${eventTxtMap.get(event)}`,
    wallet_properties: undefined,
    event_properties: {
      ...currentConversion,
      transaction_hash,
    },
    ga_event: {
      category: 'Conversion',
    },
  };
  sendGTM(gtmData);
};
