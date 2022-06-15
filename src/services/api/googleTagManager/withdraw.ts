import { sendGTM } from 'services/api/googleTagManager';

enum WithdrawEvent {
  WithdrawPoolClick,
  WithdrawAmountView,
  WithdrawAmountContinue,
  WithdrawUnlimitedTokenView,
  WithdrawUnlimitedTokenContinue,
  WithdrawTokenRequest,
  WithdrawTokenConfirm,
  WithdrawCooldownRequest,
  WithdrawCooldownConfirm,
  WithdrawSuccess,
  WithdrawFailed,
  CompleteView,
  WithdrawRemoveRewardView,
  WithdrawRemoveRewardContinue,
  WithdrawRemoveRewardRequest,
  WithdrawRemoveRewardConfirm,
  WithdrawCooldownAmountView,
  WithdrawCooldownAmountContinue,
  WithdrawCancelClick,
  WithdrawCancelApproveClick,
  WithdrawCancelWalletRequest,
  WithdrawCancelWalletConfirm,
  WithdrawCancelSuccess,
  WithdrawCancelFailed,
}

const withdrawTxtMap = new Map([
  [WithdrawEvent.WithdrawPoolClick, 'Withdraw Pool Click'],
  [WithdrawEvent.WithdrawAmountView, 'Withdraw Enter Amount View'],
  [WithdrawEvent.WithdrawAmountContinue, 'Withdraw Enter Amount Continue'],
  [
    WithdrawEvent.WithdrawUnlimitedTokenView,
    'Withdraw XX Unlimited Token View',
  ],
  [
    WithdrawEvent.WithdrawUnlimitedTokenContinue,
    'Withdraw XX Unlimited Token Continue',
  ],
  [WithdrawEvent.WithdrawTokenRequest, 'Withdraw XX Wallet Token Request'],
  [WithdrawEvent.WithdrawTokenConfirm, 'Withdraw XX Wallet Token Confirm'],
  [
    WithdrawEvent.WithdrawCooldownRequest,
    'Withdraw XX Wallet Cooldown Request',
  ],
  [
    WithdrawEvent.WithdrawCooldownConfirm,
    'Withdraw XX Wallet Cooldown Confirm',
  ],
  [WithdrawEvent.WithdrawSuccess, 'Withdraw XX Success'],
  [WithdrawEvent.WithdrawFailed, 'Withdraw XX Failed'],
  [WithdrawEvent.CompleteView, 'Withdraw XX Complete View'],
  [WithdrawEvent.WithdrawRemoveRewardView, 'Withdraw FR Remove Reward View'],
  [
    WithdrawEvent.WithdrawRemoveRewardContinue,
    'Withdraw FR Remove Reward Continue',
  ],
  [
    WithdrawEvent.WithdrawRemoveRewardRequest,
    'Withdraw FR Wallet Remove Reward Request',
  ],
  [
    WithdrawEvent.WithdrawRemoveRewardConfirm,
    'Withdraw FR Wallet Remove Reward Confirm',
  ],
  [
    WithdrawEvent.WithdrawCooldownAmountView,
    'Withdraw FR Cooldown Amount View',
  ],
  [
    WithdrawEvent.WithdrawCooldownAmountContinue,
    'Withdraw FR Cooldown Amount Continue',
  ],
  [WithdrawEvent.WithdrawCancelClick, 'Withdraw Cancel CTA Click'],
  [WithdrawEvent.WithdrawCancelApproveClick, 'Withdraw Cancel Approve Click'],
  [
    WithdrawEvent.WithdrawCancelWalletRequest,
    'Withdraw Cancel Wallet Confirmation Request',
  ],
  [WithdrawEvent.WithdrawCancelWalletConfirm, 'Withdraw Cancel Wallet Confirm'],
  [WithdrawEvent.WithdrawCancelSuccess, 'Withdraw Cancel Success'],
  [WithdrawEvent.WithdrawCancelFailed, 'Withdraw Cancel Failed'],
]);

const getWithdrawText = (event: WithdrawEvent, reward?: boolean) => {
  const txt = withdrawTxtMap.get(event);
  return txt?.replace('XX', reward ? 'FR' : 'FW');
};

export const sendWithdrawEvent = (
  event: WithdrawEvent,
  event_properties: any,
  reward?: boolean
) => {
  const data = {
    event: getWithdrawText(event, reward),
    event_properties,
    ga_event: {
      category: 'Withdraw',
    },
  };
  sendGTM(data);
};

enum WithdrawACEvent {
  CTAClick,
  ApproveClick,
  WalletUnlimitedRequest,
  WalletUnlimitedConfirm,
  WalletRequest,
  WalletConfirm,
  Success,
  Failed,
}

const withdrawACTxtMap = new Map([
  [WithdrawACEvent.CTAClick, 'CTA Click'],
  [WithdrawACEvent.ApproveClick, 'Approve Click'],
  [WithdrawACEvent.WalletUnlimitedRequest, 'Wallet Unlimited Request'],
  [WithdrawACEvent.WalletUnlimitedConfirm, 'Wallet Unlimited Confirm'],
  [WithdrawACEvent.WalletRequest, 'Wallet Request'],
  [WithdrawACEvent.WalletConfirm, 'Wallet Confirm'],
  [WithdrawACEvent.Success, 'Success'],
  [WithdrawACEvent.Success, 'Failed'],
]);

const getWithdrawACText = (event: WithdrawACEvent) =>
  'Withdraw AC ' + withdrawACTxtMap.get(event);

export const sendWithdrawACEvent = () => {};

enum WithdrawBonusEvent {
  CTAClick,
  ClaimClick,
  ClaimEarnClick,
  WalletRequest,
  WalletConfirm,
  Success,
  Failed,
}

const withdrawBonusTxtMap = new Map([
  [WithdrawBonusEvent.CTAClick, 'CTA Click'],
  [WithdrawBonusEvent.ClaimClick, 'Claim Click'],
  [WithdrawBonusEvent.ClaimEarnClick, 'Claim & Earn Click'],
  [WithdrawBonusEvent.WalletRequest, 'Wallet Request'],
  [WithdrawBonusEvent.WalletConfirm, 'Wallet Confirm'],
  [WithdrawBonusEvent.Success, 'Success'],
  [WithdrawBonusEvent.Success, 'Failed'],
]);

const getWithdrawBonusText = (event: WithdrawBonusEvent) =>
  'Withdraw Bonus ' + withdrawBonusTxtMap.get(event);

export const sendWithdrawBonusEvent = () => {};
