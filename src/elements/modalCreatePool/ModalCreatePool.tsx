import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from 'redux/index';
import { Pool, Token } from 'services/observables/tokens';
import { ReactComponent as IconPlus } from 'assets/icons/plus-circle.svg';
import { createPool } from 'services/web3/liquidity/liquidity';
import { useWeb3React } from '@web3-react/core';
import { useDispatch } from 'react-redux';
import { EthNetworks } from 'services/web3/types';
import { getNetworkVariables, ropstenTokens } from 'services/web3/config';
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

export const ModalCreatePool = () => {
  const { chainId, account } = useWeb3React();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const tokens = useAppSelector<Token[]>((state) => state.bancor.tokens);
  const allTokens = useAppSelector<Token[]>((state) => state.bancor.allTokens);
  const [bnt, setBNT] = useState<Token | undefined>();
  const [token, setToken] = useState<Token | null>(null);
  const [fee, setFee] = useState<string>('0.2');
  const pools = useAppSelector<Pool[]>((state) => state.pool.pools);
  const dispatch = useDispatch();

  const confirm = async () => {
    //isCreateDisabled() TS fails
    if (!account || !chainId || !token) return;

    await createPool(
      token,
      (Number(fee) / 100).toString(),
      chainId,
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
    const networkVars = getNetworkVariables(
      chainId ? chainId : EthNetworks.Mainnet
    );
    setBNT(tokens.find((x) => x.address === networkVars.bntToken));
  }, [tokens, chainId]);

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
      !account ||
      !chainId ||
      !token ||
      !fee ||
      numFee > 3 ||
      numFee < 0 ||
      !!errorText()
    );
  };

  return (
    <>
      <button
        className="btn-outline-secondary rounded-[12px] h-[35px]"
        onClick={() => setIsOpen(true)}
      >
        Create Pool
      </button>
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
                tokens={
                  chainId === EthNetworks.Ropsten ? ropstenTokens : allTokens
                }
                setToken={setToken}
                selectable
                startEmpty
                excludedTokens={tokens ? tokens.map((x) => x.address) : []}
              />
            </div>
          </div>

          <div className="flex justify-between items-center ml-15">
            <div className="text-grey-4">Fee</div>
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
          <button
            onClick={() => confirm()}
            disabled={isCreateDisabled()}
            className="btn-primary w-full"
          >
            {errorText() ?? 'Create a Pool'}
          </button>
        </div>
      </Modal>
    </>
  );
};
