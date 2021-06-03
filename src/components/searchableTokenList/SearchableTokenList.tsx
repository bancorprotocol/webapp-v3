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
      <InputField input={search} setInput={setSearch} />
      {welcomeData.tokens
        .filter((token) =>
          token.symbol.toLowerCase().includes(search.toLowerCase())
        )
        .map((token) => {
          return (
            <div key={token.dlt_id}>
              <button onClick={() => onClick(token)}>{token.symbol}</button>
            </div>
          );
        })}
    </>
  );
};
