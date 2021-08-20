import React, { useEffect, useState } from 'react';
import { InputField } from 'components/inputField/InputField';
import { useAppSelector } from 'redux/index';
import { Token } from 'services/observables/tokens';
import { Modal } from 'components/modal/Modal';
import wait from 'waait';
import { Image } from 'components/image/Image';
import { Pool } from 'services/api/bancor';
import { createListPool, ListPool } from 'utils/pureFunctions';

interface SearchablePoolListProps {
  onClick: (pool: ListPool) => void;
  isOpen: boolean;
  setIsOpen: Function;
  excludedPoolAnchors?: string[];
  includedPoolAnchors?: string[];
}

export const SearchablePoolList = ({
  onClick,
  isOpen,
  setIsOpen,
  excludedPoolAnchors = [],
  includedPoolAnchors = [],
}: SearchablePoolListProps) => {
  const [search, setSearch] = useState('');

  const pools = useAppSelector<Pool[]>((state) => state.bancor.pools);
  const tokens = useAppSelector<Token[]>((state) => state.bancor.tokens);

  const listPools = pools
    .filter((pool) => {
      if (includedPoolAnchors.length > 0) {
        return includedPoolAnchors.some(
          (anchor) => anchor === pool.pool_dlt_id
        );
      } else if (excludedPoolAnchors.length > 0) {
        return !excludedPoolAnchors.some(
          (anchor) => anchor === pool.pool_dlt_id
        );
      } else {
        return true;
      }
    })
    .map((pool): ListPool => createListPool(pool, tokens, 0.005))
    .filter((pool) =>
      pool.reserves.every((reserve) => Boolean(reserve && reserve.symbol))
    ) as ListPool[];

  const [filteredPools, setFilteredPools] = useState(listPools);
  useEffect(() => {
    setFilteredPools(
      listPools.filter((pool) =>
        pool.reserves.some((reserve) =>
          reserve.symbol.toLowerCase().includes(search.toLowerCase())
        )
      )
    );
  }, [pools, tokens, search]);

  const onClose = async () => {
    setIsOpen(false);
    await wait(500);
    setSearch('');
  };

  console.log({ filteredPools });
  return (
    <Modal
      title={'Select Pool'}
      isOpen={isOpen}
      setIsOpen={onClose}
      showBackButton={false}
      onBackClick={onClose}
    >
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
          {filteredPools.map((pool) => {
            return (
              <button
                key={pool.id}
                onClick={() => {
                  onClick(pool);
                  onClose();
                }}
                className="flex items-center justify-between rounded focus:outline-none focus:ring-2 focus:ring-primary w-full px-14 py-5 my-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex">
                    {pool.reserves.map((reserve, index) => (
                      <Image
                        key={reserve.symbol}
                        src={reserve.logoURI}
                        alt={`${reserve.symbol} Token`}
                        className={`bg-grey-2 rounded-full h-28 w-28 ${
                          index === 1 ? 'mr-4' : ''
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid justify-items-start ml-15">
                    <div className="text-16">
                      {pool.reserves
                        .map((reserve) => reserve.symbol)
                        .join(' / ')}
                    </div>
                  </div>
                </div>
                <div>
                  {typeof pool.decApr !== 'undefined' &&
                    Intl.NumberFormat('en-AU', {
                      style: 'percent',
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 2,
                    }).format(pool.decApr)}
                </div>
              </button>
            );
          })}
        </div>
        <hr className="border-grey-2 dark:border-blue-1" />
      </>
    </Modal>
  );
};
