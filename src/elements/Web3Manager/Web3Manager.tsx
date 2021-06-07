import { useWeb3React } from '@web3-react/core';
import { useAutoConnect } from 'web3/wallet/hooks';

export const Web3Manager = ({ children }: { children: JSX.Element }) => {
  const { active } = useWeb3React();
  const { error: networkError } = useWeb3React();

  const triedAutoLogin = useAutoConnect();

  if (!triedAutoLogin) return null;

  if (!active && networkError) {
    return (
      <div>
        Oops! An unknown error occurred. Please refresh the page, or visit from
        another browser or device.
      </div>
    );
  }

  return children;
};
