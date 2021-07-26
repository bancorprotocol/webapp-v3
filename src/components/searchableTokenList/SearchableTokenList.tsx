import { useState } from 'react';
import { InputField } from 'components/inputField/InputField';
import { useAppSelector } from 'redux/index';
import {
  getLogoByURI,
  getTokenLogoURI,
  TokenList,
  Token,
  userPreferredListIds$,
} from 'services/observables/tokens';
import { Modal } from 'components/modal/Modal';
import { Switch } from '@headlessui/react';
import { getLSTokenList, setLSTokenList } from 'services/observables/triggers';
import { prettifyNumber } from 'utils/helperFunctions';
import wait from 'waait';
import { Image } from 'components/image/Image';
import { ReactComponent as IconEdit } from 'assets/icons/edit.svg';

interface SearchableTokenListProps {
  onClick: Function;
  isOpen: boolean;
  setIsOpen: Function;
  excludedTokens: string[];
  includedTokens: string[];
}

export const SearchableTokenList = ({
  onClick,
  isOpen,
  setIsOpen,
  excludedTokens = [],
  includedTokens = [],
}: SearchableTokenListProps) => {
  const [search, setSearch] = useState('');
  const [manage, setManage] = useState(false);
  const [userPreferredListIds, setUserLists] = useState(getLSTokenList());

  const tokens = useAppSelector<Token[]>((state) => state.bancor.tokens);

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

    setLSTokenList(newUserPreferredListIds);
    setUserLists(newUserPreferredListIds);
    userPreferredListIds$.next(newUserPreferredListIds);
  };

  return (
    <Modal
      title={manage ? 'Manage' : 'Select a Token'}
      isOpen={isOpen}
      setIsOpen={onClose}
      showBackButton={manage}
      onBackClick={() => setManage(false)}
    >
      {manage ? (
        <div className="max-h-[calc(70vh-100px)] overflow-auto mb-20">
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
                      src={getLogoByURI(tokenList.logoURI)}
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
                        }pointer-events-none inline-block h-[16px] w-[16px] rounded-full bg-white transform transition ease-in-out duration-300`}
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
            {tokens
              .filter(
                (token) =>
                  (includedTokens.length === 0 ||
                    includedTokens.includes(token.address)) &&
                  !excludedTokens.includes(token.address) &&
                  (token.symbol.toLowerCase().includes(search.toLowerCase()) ||
                    token.name.toLowerCase().includes(search.toLowerCase()))
              )
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
                        src={getTokenLogoURI(token)}
                        alt={`${token.symbol} Token`}
                        className="bg-grey-2 rounded-full h-28 w-28"
                      />
                      <div className="grid justify-items-start ml-15">
                        <div className="text-16">{token.symbol}</div>
                        <div className="text-12 text-grey-3">{token.name}</div>
                      </div>
                    </div>
                    <div>{token.balance && prettifyNumber(token.balance)}</div>
                  </button>
                );
              })}
          </div>
          <hr className="border-grey-2 dark:border-blue-1" />
          <div className="flex flex-col justify-center items-center h-[59px]">
            <button
              onClick={() => setManage(true)}
              className="text-primary font-semibold"
            >
              <div className="flex">
                <IconEdit className="w-[18px] mr-4" />
                Manage Token Lists
              </div>
            </button>
            <div className="text-grey-3 text-12 font-medium">
              Only supported tokens will be displayed
            </div>
          </div>
        </>
      )}
    </Modal>
  );
};
