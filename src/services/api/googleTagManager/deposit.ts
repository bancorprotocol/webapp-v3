import { getUnlimitedLimited, sendGTM } from 'services/api/googleTagManager';

export enum DepositEvent {
  DepositPoolClick,
  DepositAmountView,
  DepositAmountContinue,
  DepositUnlimitedPopupRequest,
  DepositUnlimitedPopupConfirm,
  DepositWalletUnlimitedRequest,
  DepositWalletUnlimitedConfirm,
  DepositWalletRequest,
  DepositWalletConfirm,
  DepositSuccess,
  DepositFailed,
}

const depositTxtMap = new Map([
  [DepositEvent.DepositPoolClick, 'Deposit Pool Click'],
  [DepositEvent.DepositAmountView, 'Deposit Enter Amount View'],
  [DepositEvent.DepositAmountContinue, 'Deposit Enter Amount Continue'],
  [DepositEvent.DepositUnlimitedPopupRequest, 'Deposit Unlimited Request'],
  [DepositEvent.DepositUnlimitedPopupConfirm, 'Deposit Unlimited Continue'],
  [
    DepositEvent.DepositWalletUnlimitedRequest,
    'Deposit Wallet Unlimited Request',
  ],
  [
    DepositEvent.DepositWalletUnlimitedConfirm,
    'Deposit Wallet Unlimited Confirm',
  ],
  [DepositEvent.DepositWalletRequest, 'Deposit Wallet Request'],
  [DepositEvent.DepositWalletConfirm, 'Deposit Wallet Confirm'],
  [DepositEvent.DepositSuccess, 'Deposit Success'],
  [DepositEvent.DepositFailed, 'Deposit Failed'],
]);

interface CurrentDeposit {
  deposit_pool: string;
  deposit_blockchain: string;
  deposit_blockchain_network: string;
  deposit_input_type: string;
  deposit_token: string;
  deposit_token_amount?: string;
  deposit_token_amount_usd?: string;
  deposit_portion?: string;
  deposit_access_full_earning?: string;
  deposit_display_currency?: string;
}

let currentDeposit: CurrentDeposit;
export const setCurrentDeposit = (currDeposit: CurrentDeposit) =>
  (currentDeposit = currDeposit);

export const sendDepositEvent = (
  event: DepositEvent,
  unlimitied_selection?: boolean,
  error?: string,
  transaction_hash?: string,
  pool_click_location?: string
) => {
  const data = {
    event: depositTxtMap.get(event),
    event_properties: {
      ...currentDeposit,
      unlimitied_selection:
        unlimitied_selection === undefined
          ? unlimitied_selection
          : getUnlimitedLimited(unlimitied_selection),
      pool_click_location,
      transaction_hash,
      error,
    },
    ga_event: {
      category: 'Deposit',
    },
  };
  sendGTM(data);
};
