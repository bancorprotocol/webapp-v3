import { useState } from 'react';
import { WelcomeData } from 'api/bancor';
import { InputField } from 'components/inputField/InputField';
import { useAppSelector } from 'redux/index';

export const SearchableTokenList = ({ onClick }: { onClick: Function }) => {
  const [search, setSearch] = useState('');

  const welcomeData = useAppSelector<WelcomeData>(
    (state) => state.bancorAPI.welcomeData
  );
  return (
    <>
      <div className="my-20">
        <InputField
          input={search}
          setInput={setSearch}
          placeholder="Search name or paste address"
        />
      </div>
      {welcomeData.tokens
        .filter((token) =>
          token.symbol.toLowerCase().includes(search.toLowerCase())
        )
        .map((token) => {
          return (
            <button
              key={token.dlt_id}
              onClick={() => onClick(token)}
              className="flex items-center justify-between w-full px-16 py-10 my-5"
            >
              <div className="flex items-center">
                <div className="bg-grey-2 rounded-full h-28 w-28" />
                <div className="grid justify-items-start ml-5">
                  <div className="text-16">{token.symbol}</div>
                  <div className="text-12 text-grey-3">Bancor</div>
                </div>
              </div>
              <div>230.345</div>
            </button>
          );
        })}
    </>
  );
};
