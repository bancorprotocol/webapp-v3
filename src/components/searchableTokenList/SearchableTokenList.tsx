import { useMemo, useState } from 'react';
import { useAppSelector } from 'store';
import { TokenMinimal } from 'services/observables/tokens';
import { Modal } from 'components/modal/Modal';
import { prettifyNumber } from 'utils/helperFunctions';
import { wait } from 'utils/pureFunctions';
import { ReactComponent as IconEdit } from 'assets/icons/edit.svg';
import { getTokenListLS, setTokenListLS } from 'utils/localStorage';
import { SuggestedTokens } from './SuggestedTokens';
import { Switch } from 'components/switch/Switch';
import { TokenList } from 'services/observables/tokens';
import { userPreferredListIds$ } from 'services/observables/tokenLists';
import { orderBy } from 'lodash';
import { SearchInput } from 'components/searchInput/SearchInput';
import { Image } from 'components/image/Image';
import {
  bntToken,
  ethToken,
  usdcToken,
  usdtToken,
  wbtcToken,
} from 'services/web3/config';

interface SearchableTokenListProps {
  onClick: Function;
  isOpen: boolean;
  setIsOpen: Function;
  excludedTokens?: string[];
  includedTokens?: string[];
  tokens: TokenMinimal[];
  limit?: boolean;
}

const suggestedTokens = [bntToken, ethToken, wbtcToken, usdcToken, usdtToken];

export const SearchableTokenList = ({
  onClick,
  isOpen,
  setIsOpen,
  excludedTokens = [],
  includedTokens = [],
  tokens,
  limit,
}: SearchableTokenListProps) => {
  const [search, setSearch] = useState('');
  const [manage, setManage] = useState(false);
  const [userPreferredListIds, setUserLists] = useState(getTokenListLS());

  const tokensLists = useAppSelector<TokenList[]>(
    (state) => state.bancor.tokenLists
  );

  const onClose = async () => {
    setIsOpen(false);
    await wait(500);
    setManage(false);
    setSearch('');
  };

  const handleTokenlistClick = (listId: string) => {
    const alreadyPreferred = userPreferredListIds.includes(listId);

    const newUserPreferredListIds = alreadyPreferred
      ? userPreferredListIds.filter((list) => list !== listId)
      : [...userPreferredListIds, listId];

    if (newUserPreferredListIds.length === 0) return;

    setTokenListLS(newUserPreferredListIds);
    setUserLists(newUserPreferredListIds);
    userPreferredListIds$.next(newUserPreferredListIds);
  };

  const tokenName = (name: string) => {
    if (name.length < 19) return name;
    return name + '...';
  };

  const sortedTokens = useMemo(() => {
    const filtered = tokens.filter(
      (token) =>
        (includedTokens.length === 0 ||
          includedTokens.includes(token.address)) &&
        !excludedTokens.includes(token.address) &&
        (token.symbol.toLowerCase().includes(search.toLowerCase()) ||
          (token.name &&
            token.name.toLowerCase().includes(search.toLowerCase())))
    );
    return orderBy(filtered, ({ balanceUsd }) => balanceUsd ?? 0, 'desc').slice(
      0,
      limit ? 300 : filtered.length
    );
  }, [excludedTokens, includedTokens, limit, search, tokens]);

  return (
    <Modal
      title={manage ? 'Manage' : 'Select a Token'}
      isOpen={isOpen}
      setIsOpen={onClose}
      showBackButton={manage}
      onBackClick={() => setManage(false)}
    >
      {manage ? (
        <div className="h-full md:max-h-[calc(70vh-100px)] overflow-auto mb-20">
          <div className="px-20 pt-10 space-y-15">
            {tokensLists.map((tokenList) => {
              const isSelected = userPreferredListIds.some(
                (listId) => tokenList.name === listId
              );
              return (
                <div
                  className={`flex justify-between items-center border-2 border-silver dark:border-grey rounded px-15 py-6 ${
                    isSelected ? 'border-primary dark:border-primary-light' : ''
                  }`}
                  key={tokenList.name}
                >
                  <div className="flex items-center">
                    <Image
                      alt="TokenList"
                      src={tokenList.logoURI}
                      className="rounded-full bg-silver h-28 w-28"
                    />
                    <div className={'ml-15'}>
                      <div className={'text-16'}>{tokenList.name}</div>
                      <div className={'text-12 text-graphite'}>
                        {tokenList.tokens.length} Tokens
                      </div>
                    </div>
                  </div>
                  <div>
                    <Switch
                      selected={isSelected}
                      onChange={() => handleTokenlistClick(tokenList.name)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          <div className="relative px-20 mb-10">
            <SearchInput
              value={search}
              setValue={setSearch}
              className="w-full py-10 rounded-full"
            />
          </div>
          <div className="h-[calc(70vh-50px)] md:h-[calc(70vh-206px)] overflow-auto px-10 pb-10">
            <div className="pb-12">
              <SuggestedTokens
                allTokens={tokens}
                suggestedTokens={suggestedTokens}
                onClick={(token) => {
                  onClick(token);
                  onClose();
                }}
              />
            </div>
            <div className="flex justify-between px-10 mt-20">
              <div className="pb-6 text-secondary">Token</div>
              <div className="pb-6 text-secondary">Balance</div>
            </div>
            {sortedTokens.map((token) => {
              return (
                <button
                  key={token.address}
                  onClick={() => {
                    onClick(token);
                    onClose();
                  }}
                  className="flex items-center justify-between w-full py-5 my-5 rounded focus:ring-2 focus:ring-primary px-14"
                >
                  <div className="flex items-center">
                    <Image
                      src={token.logoURI}
                      alt={`${token.symbol} Token`}
                      className="!rounded-full h-32 w-32"
                    />
                    <div className="grid justify-items-start ml-15">
                      <div className="text-16">{token.symbol}</div>
                      <div className="text-12 text-secondary">
                        {tokenName(token.name ?? token.symbol)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-16">
                      {token.balance && prettifyNumber(token.balance)}
                      {token.isExternal && 'external'}
                    </div>
                    <div className="text-secondary">
                      {token.balanceUsd &&
                        prettifyNumber(token.balanceUsd, true)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <hr className="border-silver dark:border-black-low" />
          <div className="flex justify-center items-center h-[59px] my-5">
            <button
              onClick={() => {
                setUserLists(getTokenListLS());
                setManage(true);
              }}
              className="font-semibold text-primary"
            >
              <span className="flex justify-center items center">
                <IconEdit className="w-[18px] h-[18px] mr-4" />
                Manage Token Lists
              </span>
              <span className="font-medium text-graphite text-12">
                Only supported tokens will be displayed
              </span>
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};
