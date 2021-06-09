import { useState } from 'react';
import { InputField } from 'components/inputField/InputField';
import { useAppSelector } from 'redux/index';
import { ViewToken } from 'redux/bancorAPI/bancorAPI';

export const SearchableTokenList = ({ onClick }: { onClick: Function }) => {
  const [search, setSearch] = useState('');

  const tokens = useAppSelector<ViewToken[]>((state) => state.bancorAPI.tokens);
  return (
    <>
      <div className="my-20">
        <InputField
          input={search}
          setInput={setSearch}
          placeholder="Search name or paste address"
        />
      </div>
      {tokens
        .filter((token) =>
          token.symbol?.toLowerCase().includes(search.toLowerCase())
        )
        .map((token, index) => {
          return (
            <button
              key={'token' + index}
              onClick={() => onClick(token)}
              className="flex items-center justify-between w-full px-16 py-10 my-5"
            >
              <div className="flex items-center">
                <img
                  src={token.logoURI}
                  alt={'Token'}
                  className="bg-grey-2 rounded-full h-28 w-28"
                />
                <div className="grid justify-items-start ml-5">
                  <div className="text-16">{token.symbol}</div>
                  <div className="text-12 text-grey-3">{token.name}</div>
                </div>
              </div>
              <div>230.345</div>
            </button>
          );
        })}
    </>
  );
};
