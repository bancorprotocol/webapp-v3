import { useState } from 'react';
import { InputField } from 'components/inputField/InputField';
import { useAppSelector } from 'redux/index';
import {
  TokenList,
  Token,
  userPreferredListIds$,
} from 'services/observables/tokens';
import { Modal } from 'components/modal/Modal';
import { ModalFullscreen } from 'components/modalFullscreen/ModalFullscreen';
import { Switch } from '@headlessui/react';
import { prettifyNumber } from 'utils/helperFunctions';
import { wait } from 'utils/pureFunctions';
import { Image } from 'components/image/Image';
import { ReactComponent as IconEdit } from 'assets/icons/edit.svg';
import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import { getTokenListLS, setTokenListLS } from 'utils/localStorage';
import { isMobile } from 'react-device-detect';
import { SuggestedTokens } from './SuggestedTokens';

interface SearchableTokenListProps {
  onClick: Function;
  isOpen: boolean;
  setIsOpen: Function;
  excludedTokens: string[];
  includedTokens: string[];
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
                  className={`flex justify-between items-center border-2 border-grey-2 dark:border-grey-4 rounded px-15 py-6 ${
                    isSelected ? 'border-primary dark:border-primary-light' : ''
                  }`}
                  key={tokenList.name}
                >
                  <div className="flex items-center">
                    <Image
                      alt="TokenList"
                      src={tokenList.logoURI}
                      className="bg-grey-2 rounded-full h-28 w-28"
                    />
                    <div className={'ml-15'}>
                      <div className={'text-16'}>{tokenList.name}</div>
                      <div className={'text-12 text-grey-3'}>
                        {tokenList.tokens.length} Tokens
                      </div>
                    </div>
                  </div>
                  <div>
                    <Switch
                      checked={isSelected}
                      onChange={() => handleTokenlistClick(tokenList.name)}
                      className={`${
                        isSelected
                          ? 'bg-primary border-primary'
                          : 'bg-grey-3 border-grey-3'
                      } relative inline-flex flex-shrink-0 h-[20px] w-[40px] border-2 rounded-full cursor-pointer transition-colors ease-in-out duration-300`}
                    >
                      <span
                        aria-hidden="true"
                        className={`${
                          isSelected ? 'translate-x-[20px]' : 'translate-x-0'
                        } pointer-events-none inline-block h-[16px] w-[16px] rounded-full bg-white transform transition ease-in-out duration-300`}
                      />
                    </Switch>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-10 px-20 relative">
            <InputField
              input={search}
              setInput={setSearch}
              dataCy="searchToken"
              placeholder="Search name"
              borderGrey
            />
            {search && (
              <IconTimes
                className="w-12 absolute top-0 right-[36px]"
                onClick={() => setSearch('')}
              />
            )}
          </div>
          <div
            data-cy="searchableTokensList"
            className="h-[calc(70vh-50px)] md:h-[calc(70vh-206px)] overflow-auto px-10 pb-10"
          >
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
            <hr className="border-grey-2 dark:border-blue-1" />

            {tokens
              .filter(
                (token) =>
                  (includedTokens.length === 0 ||
                    includedTokens.includes(token.address)) &&
                  !excludedTokens.includes(token.address) &&
                  (token.symbol.toLowerCase().includes(search.toLowerCase()) ||
                    token.name.toLowerCase().includes(search.toLowerCase()))
              )
              .slice(0, limit ? 300 : tokens.length)
              .map((token) => {
                return (
                  <button
                    key={token.address}
                    onClick={() => {
                      onClick(token);
                      onClose();
                    }}
                    className="flex items-center justify-between rounded focus:outline-none focus:ring-2 focus:ring-primary w-full px-14 py-5 my-5"
                  >
                    <div className="flex items-center">
                      <Image
                        src={token.logoURI}
                        alt={`${token.symbol} Token`}
                        className="bg-grey-2 rounded-full h-28 w-28"
                      />
                      <div className="grid justify-items-start ml-15">
                        <div className="text-16">{token.symbol}</div>
                        <div className="text-12 text-grey-3">
                          {tokenName(token.name)}
                        </div>
                      </div>
                    </div>
                    <div>{token.balance && prettifyNumber(token.balance)}</div>
                  </button>
                );
              })}
          </div>
          <hr className="border-grey-2 dark:border-blue-1" />
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
              <span className="text-grey-3 text-12 font-medium">
                Only supported tokens will be displayed
              </span>
            </button>
          </div>
        </>
      )}
    </SearchableTokenListLayout>
  );
};
