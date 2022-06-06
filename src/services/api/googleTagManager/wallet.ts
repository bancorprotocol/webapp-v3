import { sendGTM } from 'services/api/googleTagManager';

export enum WalletEvents {
  popup,
  click,
  connect,
}
const walletTxtMap = new Map([
  [WalletEvents.popup, 'Wallet Connect Select Wallet Popup'],
  [WalletEvents.click, 'Wallet Connect Wallet Icon Click'],
  [WalletEvents.connect, 'Wallet Connect'],
]);

export const sendWalletEvent = (
  walletEvent: WalletEvents,
  event_properties: {} | undefined = undefined,
  id: string = '',
  name: string = ''
) => {
  const wallet = 'Wallet';
  const event = walletTxtMap.get(walletEvent);
  if (id && name)
    sendGTM({
      event: 'CE ' + event,
      ga_event: {
        category: wallet,
      },
      wallet_properties: {
        wallet_id: id,
        wallet_name: name,
      },
    });
  else
    sendGTM({
      event: 'CE ' + event,
      event_properties: event_properties,
      wallet_properties: undefined,
      ga_event: {
        category: wallet,
      },
    });
};
