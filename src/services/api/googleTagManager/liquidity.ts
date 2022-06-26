import { EthNetworks } from 'services/web3/types';
import { Events, eventTxtMap, sendGTM } from 'services/api/googleTagManager';

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
  liquidity_token_portion_percent: string;
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
  tokenAmountUsd?: string,
  bntAmount?: string,
  bntAmountUsd?: string,
  usdToggle?: boolean,
  withdrawl_percentage?: string
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
    liquidity_token_portion_percent: withdrawl_percentage
      ? withdrawl_percentage
      : 'N/A',
    liquidity_bnt_amount_usd: bntAmountUsd,
    liquidity_input_type: usdToggle ? 'Fiat' : 'Token',
  };
};

const getLiquidityEventLabel = (event: Events) => {
  const type = currentLiquidity.liquidity_type
    .replace(' Dual', '')
    .replace(' Single', '');
  return `Liquidity ${type} ${eventTxtMap.get(event)}`;
};

export const sendLiquidityApprovedEvent = (isUnlimited: boolean) => {
  const gtmData = {
    event: getLiquidityEventLabel(Events.approved),
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

export const sendLiquiditySuccessEvent = (transaction_hash: string) => {
  const gtmData = {
    event: getLiquidityEventLabel(Events.success),
    wallet_properties: undefined,
    event_properties: {
      ...currentLiquidity,
      transaction_hash,
    },
    ga_event: {
      category: 'Liquidity',
    },
  };
  sendGTM(gtmData);
};

export const sendLiquidityFailEvent = (errorMsg: string) => {
  const gtmData = {
    event: getLiquidityEventLabel(Events.fail),
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
    event: `Liquidity ${type} Pool Click`,
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
  sendGTM(gtmData);
};

export const sendLiquidityEvent = (
  event: Events,
  transaction_hash?: string
) => {
  const gtmData = {
    event: getLiquidityEventLabel(event),
    wallet_properties: undefined,
    event_properties: {
      ...currentLiquidity,
      transaction_hash,
    },
    ga_event: {
      category: 'Liquidity',
    },
  };
  sendGTM(gtmData);
};
