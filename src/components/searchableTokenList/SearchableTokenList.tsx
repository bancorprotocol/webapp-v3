import { useMemo, useState } from 'react';
import { useAppSelector } from 'store';
import { Token } from 'services/observables/tokens';
import { Modal } from 'components/modal/Modal';
import { ModalFullscreen } from 'components/modalFullscreen/ModalFullscreen';
import { prettifyNumber } from 'utils/helperFunctions';
import { wait } from 'utils/pureFunctions';
import { ReactComponent as IconEdit } from 'assets/icons/edit.svg';
import { getTokenListLS, setTokenListLS } from 'utils/localStorage';
import { isMobile } from 'react-device-detect';
import { SuggestedTokens } from './SuggestedTokens';
import { Switch } from 'components/switch/Switch';
import { TokenList } from 'services/observables/tokens';
import { userPreferredListIds$ } from 'services/observables/tokenLists';
import { orderBy } from 'lodash';
import { SearchInput } from 'components/searchInput/SearchInput';
import { Image } from 'components/image/Image';

interface SearchableTokenListProps {
  onClick: Function;
  isOpen: boolean;
  setIsOpen: Function;
  excludedTokens?: string[];
  includedTokens?: string[];
  tokens: Token[];
  limit?: boolean;
}

interface SearchableTokenListLayoutProps {
  manage: boolean;
  setManage: Function;
  isOpen: boolean;
  onClose: Function;
  children: JSX.Element;
}

const SearchableTokenListLayout = ({
  manage,
  setManage,
  onClose,
  isOpen,
  children,
}: SearchableTokenListLayoutProps) => {
  if (isMobile) {
    return (
      <ModalFullscreen
        title={manage ? 'Manage' : 'Select a Token'}
        setIsOpen={() => {
          if (manage) return setManage(false);
          onClose();
        }}
        isOpen={isOpen}
        showHeader
      >
        {children}
      </ModalFullscreen>
    );
  }

  return (
    <Modal
      title={manage ? 'Manage' : 'Select a Token'}
      isOpen={isOpen}
      setIsOpen={onClose}
      showBackButton={manage}
      onBackClick={() => setManage(false)}
    >
      {children}
    </Modal>
  );
};

const suggestedTokens = ['BNT', 'ETH', 'WBTC', 'USDC', 'USDT'];

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
    return orderBy(filtered, 'balanceUsd', 'desc').slice(
      0,
      limit ? 300 : filtered.length
    );
  }, [excludedTokens, includedTokens, limit, search, tokens]);

  return (
    <SearchableTokenListLayout
      manage={manage}
      onClose={onClose}
      isOpen={isOpen}
      setManage={setManage}
    >
      {manage ? (
        <div className="h-full md:max-h-[calc(70vh-100px)] overflow-auto mb-20">
          <div className="pt-10 px-20 space-y-15">
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
                      className="bg-silver rounded-full h-28 w-28"
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
          <div className="mb-10 px-20 relative">
            <SearchInput
              value={search}
              setValue={setSearch}
              className="rounded-full py-10 w-full"
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
              <div className="text-secondary pb-6">Token</div>
              <div className="text-secondary pb-6">Balance</div>
            </div>
            {sortedTokens.map((token) => {
              return (
                <button
                  key={token.address}
                  onClick={() => {
                    onClick(token);
                    onClose();
                  }}
                  className="flex items-center justify-between rounded focus:ring-2 focus:ring-primary px-14 py-5 my-5 w-full"
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
              className="text-primary font-semibold"
            >
              <span className="flex justify-center items center">
                <IconEdit className="w-[18px] h-[18px] mr-4" />
                Manage Token Lists
              </span>
              <span className="text-graphite text-12 font-medium">
                Only supported tokens will be displayed
              </span>
            </button>
          </div>
        </>
      )}
    </SearchableTokenListLayout>
  );
};
