import { useState } from 'react';
import { InputField } from 'components/inputField/InputField';
import { useAppSelector } from 'redux/index';
import {
  getLogoByURI,
  getTokenLogoURI,
  TokenList,
  Token,
  userPreferredListIds$,
} from 'services/observables/tokens';
import { Modal } from 'components/modal/Modal';
import { Switch } from '@headlessui/react';
import { prettifyNumber } from 'utils/helperFunctions';
import wait from 'waait';
import { Image } from 'components/image/Image';
import { ReactComponent as IconEdit } from 'assets/icons/edit.svg';
import { getTokenListLS, setTokenListLS } from 'utils/localStorage';
import { Pool } from 'services/api/bancor';

interface SearchablePoolList {
  onClick: Function;
  isOpen: boolean;
  setIsOpen: Function;
  excludedPoolAnchors?: string[];
  includedPoolAnchors?: string[];
}

interface ListPool {
    decApr?: number;
    id: string;
    reserves: {
        symbol: string; 
        logoURI: string;
    }[]
}

export const SearchablePoolList = ({
  onClick,
  isOpen,
  setIsOpen,
  excludedPoolAnchors = [],
  includedPoolAnchors = [],
}: SearchablePoolList) => {
  const [search, setSearch] = useState('');
  const [manage, setManage] = useState(false);

  const pools = useAppSelector<Pool[]>((state) => state.bancor.pools);
  const tokens = useAppSelector<Token[]>((state) => state.bancor.tokens);

  const listPools = pools.map((pool): ListPool => ({ id: pool.pool_dlt_id, reserves: pool.reserves.map(reserve => {
      const token = tokens.find(token => token.address === reserve.address)!;
      return {
          ...token,
          decApr: 0.005
      }
  }).sort((a, b) => b.symbol > a.symbol ? -1 : 1) })).filter(pool => pool.reserves.every(reserve => Boolean(reserve && reserve.symbol))) as ListPool[]


  const onClose = async () => {
    setIsOpen(false);
    await wait(500);
    setManage(false);
    setSearch('');
  };


  return (
    <Modal
      title={'Select Pool'}
      isOpen={isOpen}
      setIsOpen={onClose}
      showBackButton={false}
      onBackClick={() => setManage(false)}
    >
      {manage ? (
        <div className="max-h-[calc(70vh-100px)] overflow-auto mb-20">
          <div className="pt-10 px-20 space-y-15">
           <h1>hello</h1>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-10 px-20">
            <InputField
              input={search}
              setInput={setSearch}
              dataCy="searchToken"
              placeholder="Search name"
              borderGrey
            />
          </div>
          <div
            data-cy="searchableTokensList"
            className="max-h-[calc(70vh-206px)] overflow-auto px-10 pb-10"
          >
            {listPools
              .map((pool) => {
                return (
                  <button
                    key={pool.id}
                    onClick={() => {
                      onClick(pool);
                      onClose();
                    }}
                    className="flex items-center justify-between rounded focus:outline-none focus:ring-2 focus:ring-primary w-full px-14 py-5 my-5"
                  >
                    <div className="flex items-center">
                      <Image
                        src={''}
                        alt={`${'f'} Token`}
                        className="bg-grey-2 rounded-full h-28 w-28"
                      />
                      <div className="grid justify-items-start ml-15">
                        <div className="text-16">{pool.reserves.map(reserve => reserve.symbol).join(' / ')}</div>
                      </div>
                    </div>
                    <div>{pool.decApr}</div>
                  </button>
                );
              })}
          </div>
          <hr className="border-grey-2 dark:border-blue-1" />
          
        </>
      )}
    </Modal>
  );
};
