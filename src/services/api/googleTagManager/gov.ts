import { getUnlimitedLimited, sendGTM } from '.';

export enum GovEvent {
  StartClick,
  Click,
  UnlimitedPopup,
  UnlimitedPopupSelect,
  WalletRequest,
  WalletConfirm,
  Success,
  Failed,
}

export interface GovProperties {
  stake_input_type: string;
  stake_token_amount_usd: string;
  stake_token_portion_percent: string;
}

const govTxtMap = new Map([
  [GovEvent.StartClick, 'Start Click'],
  [GovEvent.Click, 'Click'],
  [GovEvent.UnlimitedPopup, 'Unlimited View'],
  [GovEvent.UnlimitedPopupSelect, 'Unlimited Continue'],
  [GovEvent.WalletRequest, 'Wallet Request'],
  [GovEvent.WalletConfirm, 'Wallet Confirm'],
  [GovEvent.Success, 'Success'],
  [GovEvent.Success, 'Failed'],
]);

const getGovText = (event: GovEvent, stake?: boolean) =>
  `${stake ? 'Stake' : 'Unstake'} ${govTxtMap.get(event)}`;

export const sendGovEvent = (
  event: GovEvent,
  event_properties?: GovProperties,
  stake?: boolean,
  unlimitied_selection?: boolean,
  error?: string
) => {
  const data = {
    event: getGovText(event, stake),
    event_properties: {
      ...event_properties,
      unlimitied_selection:
        unlimitied_selection === undefined
          ? unlimitied_selection
          : getUnlimitedLimited(unlimitied_selection),
      error,
    },
    ga_event: {
      category: 'Gov ' + stake ? 'Stake' : 'Unstake',
    },
  };
  sendGTM(data);
};
