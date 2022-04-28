import { TopMovers } from 'elements/tokens/TopMovers';
import { TokenTable } from 'elements/tokens/TokenTable';
import { useState } from 'react';
import { Page } from 'components/Page';

export const Tokens = () => {
  const [searchInput, setSearchInput] = useState('');
  const title = 'Tokens';
  const subtitle = 'Explore all tokens supported by Bancor.';

  return (
    <Page title={title} subtitle={subtitle}>
      <div className="space-y-30">
        <TopMovers setSearch={setSearchInput} />
        <TokenTable searchInput={searchInput} setSearchInput={setSearchInput} />
      </div>
    </Page>
  );
};
