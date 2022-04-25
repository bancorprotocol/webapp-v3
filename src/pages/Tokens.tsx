import { TopMovers } from 'elements/tokens/TopMovers';
import { TokenTable } from 'elements/tokens/TokenTable';
import { useState } from 'react';

export const Tokens = () => {
  const [searchInput, setSearchInput] = useState('');

  return (
    <div className="space-y-30 max-w-[1140px] pt-80 mb-20 mx-auto bg-fog dark:bg-black">
      <TopMovers setSearch={setSearchInput} />
      <TokenTable searchInput={searchInput} setSearchInput={setSearchInput} />
    </div>
  );
};
