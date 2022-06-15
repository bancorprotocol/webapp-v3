enum GovEvent {
  StartClick,
  Click,
  UnlimitedPopup,
  UnlimitedPopupSelect,
  WalletRequest,
  WalletConfirm,
  Success,
  Failed,
}

const govTxtMap = new Map([
  [GovEvent.StartClick, 'Start Click'],
  [GovEvent.Click, 'Click'],
  [GovEvent.UnlimitedPopup, 'Unlimited Popup'],
  [GovEvent.UnlimitedPopupSelect, 'Unlimited Popup Select'],
  [GovEvent.WalletRequest, 'Wallet Confirmation Request'],
  [GovEvent.WalletConfirm, 'Wallet Confirm'],
  [GovEvent.Success, 'Success'],
  [GovEvent.Success, 'Failed'],
]);

const getGovText = (event: GovEvent, stake?: boolean) =>
  stake ? 'Stake' : 'Unstake' + ' ' + govTxtMap.get(event);

export const sendGovEvent = () => {};
