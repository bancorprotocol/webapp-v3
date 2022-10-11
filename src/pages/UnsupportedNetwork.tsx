import { Navigate } from 'components/navigate/Navigate';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { ReactComponent as WarningIcon } from 'assets/icons/warning.svg';
import { ReactComponent as IconSearch } from 'assets/icons/search.svg';
import { requestSwitchChain } from 'utils/helperFunctions';

export const UnsupportedNetwork = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-15 h-screen text-center">
      <WarningIcon className="w-40 h-40 text-error" />
      <div className="text-[22px]">Wrong network</div>
      <div className="text-secondary mb-36">
        Please connect to a supported network in the dropdown menu or in your
        wallet
      </div>
      <div className="flex items-center gap-15">
        <Button variant={ButtonVariant.Secondary} size={ButtonSize.Meduim}>
          <Navigate
            to="https://support.bancor.network/hc/en-us/articles/5463892405010-MetaMask-Setup-Guide"
            className="flex items-center justify-center gap-12"
          >
            <IconSearch className="w-20 h-20" />
            Learn How
          </Navigate>
        </Button>
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Meduim}
          onClick={() => requestSwitchChain()}
        >
          Switch Network
        </Button>
      </div>
    </div>
  );
};
