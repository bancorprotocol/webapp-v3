import {
  addNotification,
  BaseNotification,
  NotificationType,
} from 'redux/notification/notification';
import { Token } from 'services/observables/tokens';

const showNotification = (notification: BaseNotification, dispatch: any) =>
  dispatch(addNotification(notification));

export const rejectNotification = (dispatch: any) =>
  showNotification(
    {
      type: NotificationType.error,
      title: 'Transaction Rejected',
      msg: 'You rejected the trade. If this was by mistake, please try again.',
    },
    dispatch
  );

export const stakeNotification = (
  dispatch: any,
  amount: string,
  txHash: string
) =>
  showNotification(
    {
      type: NotificationType.pending,
      title: 'Pending Confirmation',
      msg: 'Staking vBNT is pending confirmation',
      txHash,
      updatedInfo: {
        successTitle: 'Success!',
        successMsg: `Your stake of ${amount} vBNT has been confirmed`,
        errorTitle: 'Transaction Failed',
        errorMsg: `Staking ${amount} vBNT had failed. Please try again or contact support.`,
      },
    },
    dispatch
  );

export const unstakeNotification = (
  dispatch: any,
  amount: string,
  txHash: string
) =>
  showNotification(
    {
      type: NotificationType.pending,
      title: 'Pending Confirmation',
      msg: 'Unstaking vBNT is pending confirmation',
      txHash,
      updatedInfo: {
        successTitle: 'Success!',
        successMsg: `Unstaking ${amount} vBNT has been confirmed`,
        errorTitle: 'Transaction Failed',
        errorMsg: `Unstaking ${amount} vBNT had failed. Please try again or contact support.`,
      },
    },
    dispatch
  );

export const stakeFailedNotification = (dispatch: any, amount: string) =>
  showNotification(
    {
      type: NotificationType.error,
      title: 'Transaction Failed',
      msg: `Staking ${amount} vBNT had failed. Please try again or contact support.`,
    },
    dispatch
  );

export const unstakeFailedNotification = (dispatch: any, amount: string) =>
  showNotification(
    {
      type: NotificationType.error,
      title: 'Transaction Failed',
      msg: `Staking ${amount} vBNT had failed. Please try again or contact support.`,
    },
    dispatch
  );

export const swapNotification = (
  dispatch: any,
  fromToken: Token,
  toToken: Token,
  fromAmount: string,
  toAmount: string,
  txHash: string
) =>
  showNotification(
    {
      type: NotificationType.pending,
      title: 'Pending Confirmation',
      msg: `Trading ${fromAmount} ${fromToken.symbol} is Pending Confirmation`,
      updatedInfo: {
        successTitle: 'Success!',
        successMsg: `Your trade ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol} has been confirmed`,
        errorTitle: 'Transaction Failed',
        errorMsg: `Trading ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol} had failed. Please try again or contact support`,
      },
      txHash,
    },
    dispatch
  );

export const swapFailedNotification = (
  dispatch: any,
  fromToken: Token,
  toToken: Token,
  fromAmount: string,
  toAmount: string
) =>
  showNotification(
    {
      type: NotificationType.error,
      title: 'Transaction Failed',
      msg: `Trading ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol} had failed. Please try again or contact support`,
    },
    dispatch
  );

export const poolExistNotification = (dispatch: any) =>
  showNotification(
    {
      type: NotificationType.error,
      title: 'Pool Already exist',
      msg: `The pool already exists on Bancor`,
    },
    dispatch
  );

export const poolCreateNotification = (dispatch: any, txHash: string) =>
  showNotification(
    {
      type: NotificationType.pending,
      title: 'Pending Confirmation',
      msg: 'Creating pool is pending confirmation',
      txHash,
      updatedInfo: {
        successTitle: 'Success!',
        successMsg: 'Your pool was successfully created',
        errorTitle: 'Creating Pool Failed',
        errorMsg: 'Fail creating pool. Please try again or contact support.',
      },
    },
    dispatch
  );

export const ownershipNotification = (dispatch: any, txHash: string) =>
  showNotification(
    {
      type: NotificationType.pending,
      title: 'Pending Confirmation',
      msg: 'Accepting ownership is pending confirmation',
      txHash,
      updatedInfo: {
        successTitle: 'Success!',
        successMsg: 'Ownership Accepted',
        errorTitle: 'Ownership Failed',
        errorMsg:
          'Failed accepting ownership. Please try again or contact support.',
      },
    },
    dispatch
  );

export const setFeeNotification = (dispatch: any, txHash: string) =>
  showNotification(
    {
      type: NotificationType.pending,
      title: 'Pending Confirmation',
      msg: 'Setting convertion fee is pending confirmation',
      txHash,
      updatedInfo: {
        successTitle: 'Success!',
        successMsg: 'Conversion fee has been set',
        errorTitle: 'Conversion fee failed',
        errorMsg:
          'conversion fee setting failed. Please try again or contact support.',
      },
    },
    dispatch
  );

export const poolFailedNotification = (dispatch: any) =>
  showNotification(
    {
      type: NotificationType.error,
      title: 'Creating Pool Failed',
      msg: `Fail creating pool. Please try again or contact support.`,
    },
    dispatch
  );

export const stakeRewardsNotification = (
  dispatch: any,
  txHash: string,
  amount: string,
  pool: string
) =>
  showNotification(
    {
      type: NotificationType.pending,
      title: 'Pending Confirmation',
      msg: `Staking ${amount} BNT rewards is Pending Confirmation`,
      txHash,
      updatedInfo: {
        successTitle: 'Success!',
        successMsg: `${amount} BNT rewards were successfully staked into the ${pool} pool`,
        errorTitle: 'Transaction Failed',
        errorMsg: `Staking ${amount} BNT rewards had failed. Please try again or contact support.`,
      },
    },
    dispatch
  );

export const claimRewardsNotification = (
  dispatch: any,
  txHash: string,
  amount: string
) =>
  showNotification(
    {
      type: NotificationType.pending,
      title: 'Pending Confirmation',
      msg: `Rewards claiming of ${amount} is Pending Confirmation`,
      txHash,
      updatedInfo: {
        successTitle: 'Success!',
        successMsg: `${amount} BNT rewards were successfully claimed`,
        errorTitle: 'Transaction Failed',
        errorMsg: `Claiming ${amount} BNT rewards had failed. Please try again or contact support.`,
      },
    },
    dispatch
  );

export const stakeRewardsFailedNotification = (dispatch: any) =>
  showNotification(
    {
      type: NotificationType.error,
      title: 'Staking Rewards',
      msg: `Failed to stake rewards. Please try again or contact support.`,
    },
    dispatch
  );

export const claimRewardsFailedNotification = (dispatch: any) =>
  showNotification(
    {
      type: NotificationType.error,
      title: 'Claiming Rewards',
      msg: `Failed to claim rewards. Please try again or contact support.`,
    },
    dispatch
  );

export const withdrawProtectedPosition = (
  dispatch: any,
  token: Token,
  amount: string,
  txHash: string
) =>
  showNotification(
    {
      type: NotificationType.pending,
      title: 'Pending Confirmation',
      msg: `Withdrawal of ${amount} ${token.symbol} is Pending Confirmation`,
      txHash,
      updatedInfo: {
        successTitle: 'Success!',
        successMsg: `Your withdraw of ${amount} ${token.symbol} has been confirmed`,
        errorTitle: 'Transaction Failed',
        errorMsg: `Withdrawing ${amount} ${token.symbol} had failed. Please try again or contact support.`,
      },
    },
    dispatch
  );

export const withdrawProtectedPositionFailed = (
  dispatch: any,
  token: Token,
  amount: string
) =>
  showNotification(
    {
      type: NotificationType.error,
      title: 'Transaction Failed',
      msg: `Withdrawing ${amount} ${token.symbol} had failed. Please try again or contact support.`,
    },
    dispatch
  );

export const removeLiquidityNotification = (
  dispatch: any,
  amount: string,
  symbol: string,
  txHash: string
) =>
  showNotification(
    {
      type: NotificationType.pending,
      title: 'Pending Confirmation',
      msg: `Removing ${amount} ${symbol} is Pending Confirmation`,
      txHash,
      updatedInfo: {
        successTitle: 'Success!',
        successMsg: `Your withdraw of ${amount} ${symbol} has been confirmed`,
        errorTitle: 'Transaction Failed',
        errorMsg: `Removing ${amount} ${symbol} had failed. Please try again or contact support`,
      },
    },
    dispatch
  );

export const removeLiquidityNotificationFailed = (
  dispatch: any,
  amount: string,
  symbol: string
) =>
  showNotification(
    {
      type: NotificationType.error,
      title: 'Transaction Failed',
      msg: `Removing ${amount} ${symbol} had failed. Please try again or contact support`,
    },
    dispatch
  );

export const claimBntNotification = (
  dispatch: any,
  txHash: string,
  amount: string
) =>
  showNotification(
    {
      type: NotificationType.pending,
      title: 'Pending Confirmation',
      msg: `Claiming locked ${amount} BNT is Pending Confirmation`,
      txHash,
      updatedInfo: {
        successTitle: 'Success!',
        successMsg: `${amount} locked BNT were successfully claimed`,
        errorTitle: 'Transaction Failed',
        errorMsg: `Claiming locked ${amount} BNT had failed. Please try again or contact support.`,
      },
    },
    dispatch
  );

export const addLiquiditySingleNotification = (
  dispatch: any,
  txHash: string,
  amount: string,
  symbol: string,
  pool: string
) =>
  showNotification(
    {
      type: NotificationType.pending,
      title: 'Add Protection',
      msg: `Staking ${amount} ${symbol} for Protection is Pending Confirmation`,
      txHash,
      updatedInfo: {
        successTitle: 'Success!',
        successMsg: `You Staked ${amount} ${symbol} for Protection in Pool ${pool}`,
        errorTitle: 'Transaction Failed',
        errorMsg: `Staking ${amount} ${symbol} for Protection in Pool ${pool} failed. Please try again or contact support.`,
      },
    },
    dispatch
  );

export const addLiquiditySingleFailedNotification = (
  dispatch: any,
  amount: string,
  symbol: string,
  pool: string
) =>
  showNotification(
    {
      type: NotificationType.error,
      title: 'Transaction Failed',
      msg: `Staking ${amount} ${symbol} for protection in pool ${pool} failed. Please try again or contact support.`,
    },
    dispatch
  );

export const addLiquidityNotification = (
  dispatch: any,
  txHash: string,
  amountTkn: string,
  tkn: string,
  amountBnt: string,
  bnt: string,
  pool: string
) =>
  showNotification(
    {
      type: NotificationType.pending,
      title: 'Add Liquidity',
      msg: `Adding ${amountTkn} ${tkn} and ${amountBnt} ${bnt} to pool ${pool} is Pending Confirmation`,
      txHash,
      updatedInfo: {
        successTitle: 'Success!',
        successMsg: `You Added ${amountTkn} ${tkn} and ${amountBnt} ${bnt} to pool ${pool}`,
        errorTitle: 'Transaction Failed',
        errorMsg: `Adding ${amountTkn} ${tkn} and ${amountBnt} ${bnt} to pool ${pool} failed. Please try again or contact support.`,
      },
    },
    dispatch
  );

export const addLiquidityFailedNotification = (
  dispatch: any,
  amountTkn: string,
  tkn: string,
  amountBnt: string,
  bnt: string,
  pool: string
) =>
  showNotification(
    {
      type: NotificationType.error,
      title: 'Transaction Failed',
      msg: `Adding ${amountTkn} ${tkn} and ${amountBnt} ${bnt} to pool ${pool} failed. Please try again or contact support.`,
    },
    dispatch
  );
