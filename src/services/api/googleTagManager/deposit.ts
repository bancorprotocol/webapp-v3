import { sendGTM } from 'services/api/googleTagManager';

enum DepositEvent {
  DepositPoolClick,
  DepositClick,
  DepositUnlimitedPopupView,
  DepositUnlimitedPopupSelect,
  DepositUnlimitedPopupRequest,
  DepositUnlimitedPopupConfirm,
  DepositWalletRequest,
  DepositWalletConfirm,
  DepositSuccess,
  DepositFailed,
}

const depositTxtMap = new Map([
  [DepositEvent.DepositPoolClick, 'Deposit Pool Click'],
  [DepositEvent.DepositClick, 'Deposit Click'],
  [DepositEvent.DepositUnlimitedPopupView, 'Deposit Unlimited Popup View'],
  [DepositEvent.DepositUnlimitedPopupSelect, 'Deposit Unlimited Popup Select'],
  [
    DepositEvent.DepositUnlimitedPopupRequest,
    'Deposit Unlimited Popup Request',
  ],
  [
    DepositEvent.DepositUnlimitedPopupConfirm,
    'Deposit Unlimited Popup Confirm',
  ],
  [DepositEvent.DepositWalletRequest, 'Deposit Wallet Request'],
  [DepositEvent.DepositWalletConfirm, 'Deposit Wallet Confirm'],
  [DepositEvent.DepositSuccess, 'Deposit Success'],
  [DepositEvent.DepositFailed, 'Deposit Failed'],
]);

export const sendDepositEvent = (
  event: DepositEvent,
  event_properties: any
) => {
  const data = {
    event: depositTxtMap.get(event),
    event_properties,
    ga_event: {
      category: 'Deposit',
    },
  };
  sendGTM(data);
};
