import { sendGTM } from '.';

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

interface GovProperties {
  stake_input_type: 'Fiat' | 'USD';
  stake_token_amount_usd: string;
  stake_token_portion_percent: string;
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

export const sendGovEvent = (
  event: GovEvent,
  event_properties: GovProperties,
  stake?: boolean
) => {
  const data = {
    event: getGovText(event, stake),
    event_properties,
    ga_event: {
      category: 'Gov ' + stake ? 'Stake' : 'Unstake',
    },
  };
  sendGTM(data);
};
