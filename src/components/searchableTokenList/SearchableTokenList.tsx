import { useState } from 'react';
import { InputField } from 'components/inputField/InputField';
import { useAppSelector } from 'redux/index';
import {
  getLogoByURI,
  getTokenLogoURI,
  TokenList,
  TokenListItem,
  userLists$,
} from 'services/observables/tokens';
import { Modal } from 'components/modal/Modal';
import { Switch } from '@headlessui/react';
import { getLSTokenList, setLSTokenList } from 'services/observables/triggers';
import { prettifyNumber } from 'utils/helperFunctions';
import wait from 'waait';

interface SearchableTokenListProps {
  onClick: Function;
  isOpen: boolean;
  setIsOpen: Function;
  excludedTokens: string[];
}

export const SearchableTokenList = ({
  onClick,
  isOpen,
  setIsOpen,
  excludedTokens = [],
}: SearchableTokenListProps) => {
  const [search, setSearch] = useState('');
  const [manage, setManage] = useState(false);
  const [userLists, setUserLists] = useState<number[]>(getLSTokenList());

  const tokens = useAppSelector<TokenListItem[]>(
    (state) => state.bancor.tokens
  );
  const tokensLists = useAppSelector<TokenList[]>(
    (state) => state.bancor.tokenLists
  );

  const onClose = async () => {
    setIsOpen(false);
    await wait(500);
    setManage(false);
    setSearch('');
  };

  const handleTokenlistClick = (index: number) => {
    const foundIndex = userLists.indexOf(index);
    const newUserLists =
      foundIndex === -1
        ? [...userLists, index]
        : userLists.filter((x) => x !== index);

    setLSTokenList(newUserLists);
    setUserLists(newUserLists);
    userLists$.next(userLists);
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
            {tokensLists.map((tokenList, index) => (
              <div
                className={`flex justify-between items-center border-2 border-grey-2 dark:border-grey-4 rounded px-15 py-6 ${
                  userLists.includes(index)
                    ? 'border-primary dark:border-primary-light'
                    : ''
                }`}
                key={'Tokenlist_' + index}
              >
                <div className="flex items-center">
                  <img
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
                    checked={userLists.includes(index)}
                    onChange={() => handleTokenlistClick(index)}
                    className={`${
                      userLists.includes(index)
                        ? 'bg-primary border-primary'
                        : 'bg-grey-3 border-grey-3'
                    } relative inline-flex flex-shrink-0 h-[20px] w-[40px] border-2 rounded-full cursor-pointer transition-colors ease-in-out duration-300`}
                  >
                    <span
                      aria-hidden="true"
                      className={`${
                        userLists.includes(index)
                          ? 'translate-x-[20px]'
                          : 'translate-x-0'
                      }
            pointer-events-none inline-block h-[16px] w-[16px] rounded-full bg-white transform transition ease-in-out duration-300`}
                    />
                  </Switch>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-10 px-20">
            <InputField
              input={search}
              setInput={setSearch}
              placeholder="Search name"
              borderGrey
            />
          </div>
          <div className="max-h-[calc(70vh-206px)] overflow-auto px-10 pb-10">
            {tokens
              .filter(
                (token) =>
                  !excludedTokens.includes(token.address) &&
                  (token.symbol.toLowerCase().includes(search.toLowerCase()) ||
                    token.name.toLowerCase().includes(search.toLowerCase()))
              )
              .map((token, index) => {
                return (
                  <button
                    key={'token_' + index}
                    onClick={() => {
                      onClick(token);
                      onClose();
                    }}
                    className="flex items-center justify-between rounded focus:outline-none focus:ring-2 focus:ring-primary w-full px-14 py-5 my-5"
                  >
                    <div className="flex items-center">
                      <img
                        src={getTokenLogoURI(token)}
                        alt={'Token'}
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
          <div className="flex justify-center items-center h-[59px]">
            <button
              onClick={() => setManage(true)}
              className="text-primary font-semibold"
            >
              Manage Token Lists
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};
