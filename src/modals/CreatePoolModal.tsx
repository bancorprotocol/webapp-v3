import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from 'store';
import { Token } from 'services/observables/tokens';
import { ReactComponent as IconPlus } from 'assets/icons/plus-circle.svg';
import { createPool } from 'services/web3/liquidity/liquidity';
import { useDispatch } from 'react-redux';
import { EthNetworks } from 'services/web3/types';
import { getNetworkVariables } from 'services/web3/config';
import { SelectToken } from 'components/selectToken/SelectToken';
import { InputField } from 'components/inputField/InputField';
import { Modal } from 'components/modal/Modal';
import {
  ownershipNotification,
  poolCreateNotification,
  poolExistNotification,
  poolFailedNotification,
  rejectNotification,
  setFeeNotification,
} from 'services/notifications/notifications';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { Pool } from 'services/observables/pools';

export const CreatePoolModal = () => {
  const account = useAppSelector((state) => state.user.account);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const tokens = useAppSelector<Token[]>((state) => state.bancor.tokensV2);
  const allTokens = useAppSelector<Token[]>((state) => state.bancor.allTokens);
  const [bnt, setBNT] = useState<Token | undefined>();
  const [token, setToken] = useState<Token | null>(null);
  const [fee, setFee] = useState<string>('0.2');
  const pools = useAppSelector<Pool[]>((state) => state.pool.v2Pools);
  const dispatch = useDispatch();

  const confirm = async () => {
    //isCreateDisabled() TS fails
    if (!account || !token) return;

    await createPool(
      token,
      (Number(fee) / 100).toString(),
      EthNetworks.Mainnet,
      () => poolExistNotification(dispatch),
      (txHash: string) => poolCreateNotification(dispatch, txHash),
      (txHash: string) => ownershipNotification(dispatch, txHash),
      (txHash: string) => setFeeNotification(dispatch, txHash),
      () => rejectNotification(dispatch),
      () => poolFailedNotification(dispatch)
    );

    setIsOpen(false);
  };

  useEffect(() => {
    const networkVars = getNetworkVariables();
    setBNT(tokens.find((x) => x.address === networkVars.bntToken));
  }, [tokens]);

  const errorText = useCallback(() => {
    if (
      token &&
      pools.findIndex((x) => x.reserves[0].address === token.address) !== -1
    ) {
      return 'Pool Already Exists';
    }
  }, [token, pools]);

  const isCreateDisabled = () => {
    const numFee = Number(fee);
    return (
      !account || !token || !fee || numFee > 3 || numFee < 0 || !!errorText()
    );
  };

  return (
    <>
      <Button
        variant={ButtonVariant.Secondary}
        size={ButtonSize.ExtraSmall}
        className="h-[35px]"
        onClick={() => setIsOpen(true)}
      >
        Create Pool
      </Button>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen} title="Create Pool">
        <div className="p-14">
          <div className="mx-10 mb-30">
            <SelectToken label="First Token" token={bnt} selectable={false} />
          </div>
          <div className="widget-block">
            <div className="widget-block-icon">
              <IconPlus className="w-[25px] text-primary dark:text-primary-light" />
            </div>
            <div className="my-30">
              <SelectToken
                label="Second Token"
                token={token}
                tokens={allTokens}
                setToken={setToken}
                selectable
                startEmpty
                excludedTokens={tokens ? tokens.map((x) => x.address) : []}
              />
            </div>
          </div>

          <div className="flex justify-between items-center ml-15">
            <div className="text-grey">Fee</div>
            <div className="max-w-[200px] my-20">
              <InputField
                input={fee}
                setInput={setFee}
                borderGrey
                format
                customClass="text-right"
              />
            </div>
          </div>
          <Button
            onClick={() => confirm()}
            disabled={isCreateDisabled()}
            size={ButtonSize.Full}
          >
            {errorText() ?? 'Create a Pool'}
          </Button>
        </div>
      </Modal>
    </>
  );
};
