import { Pool } from 'services/observables/tokens';
import { Image } from '../image/Image';
import { InputField } from '../inputField/InputField';
import { useState } from 'react';

interface Props {
  pools: Pool[];
  onSelect: Function;
}
export const SelectPoolModalContent = ({ pools, onSelect }: Props) => {
  const [search, setSearch] = useState('');
  const filteredPools = pools.filter((pool) =>
    pool.reserves[0].symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
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
      <div className="h-full md:max-h-[calc(70vh-100px)] overflow-auto mb-20 px-20 space-y-20">
        <div className="flex justify-between text-blue-4 mt-10">
          <span>Pools</span>
          <span>APR</span>
        </div>
        {filteredPools.map((pool) => (
          <button
            key={pool.pool_dlt_id}
            onClick={() => onSelect(pool)}
            className="flex justify-between items-center w-full"
          >
            <span className="flex items-center">
              <Image
                src={pool.reserves[0].logoURI.replace('thumb', 'small')}
                alt="Token Logo"
                className="bg-grey-1 rounded-full w-24 h-24 z-20"
              />
              <Image
                src={pool.reserves[1].logoURI.replace('thumb', 'small')}
                alt="Token Logo"
                className="-ml-10 bg-grey-1 rounded-full w-24 h-24 z-10"
              />
              <span className="ml-10">{pool.name}</span>
            </span>
            <span className="text-12">{pool.apr.toFixed(2)}%</span>
          </button>
        ))}
      </div>
    </>
  );
};
