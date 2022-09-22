import { ModalV3 } from 'components/modal/ModalV3';
import { ReactComponent as WarningIcon } from 'assets/icons/warning.svg';
import { Button, ButtonVariant } from 'components/button/Button';
import { ReactComponent as IconSearch } from 'assets/icons/search.svg';
import { useEffect, useState } from 'react';
import { Navigate } from 'components/navigate/Navigate';

export const WrongNetworkModal = ({
  unsupportedNetwork,
}: {
  unsupportedNetwork: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(unsupportedNetwork);
  }, [unsupportedNetwork]);

  return (
    <>
      <ModalV3 setIsOpen={setIsOpen} isOpen={isOpen}>
        <div className="flex flex-col items-center gap-15 pb-40 px-40 text-center">
          <WarningIcon className="w-40 h-40 text-error" />
          <div className="text-[22px]">Wrong network</div>
          <div className="text-secondary mb-36">
            Please connect to a supported network in the dropdown menu or in
            your wallet
          </div>
          <Button variant={ButtonVariant.Secondary}>
            <Navigate
              to="https://support.bancor.network/hc/en-us/articles/5463892405010-MetaMask-Setup-Guide"
              className="flex items-center justify-center gap-12"
            >
              <IconSearch className="w-20 h-20" />
              Learn How
            </Navigate>
          </Button>
        </div>
      </ModalV3>
    </>
  );
};
