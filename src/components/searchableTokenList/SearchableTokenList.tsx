import { useState } from 'react';
import { InputField } from 'components/inputField/InputField';
import { useAppSelector } from 'redux/index';
import {
  getLogoURI,
  TokenList,
  TokenListItem,
  userLists$,
} from 'observables/tokens';
import { Modal } from 'components/modal/Modal';
import { Switch } from '@headlessui/react';
import { useDispatch } from 'react-redux';
import { getLSTokenList, setLSTokenList } from 'observables/triggers';

export const SearchableTokenList = ({
  onClick,
  isOpen,
  setIsOpen,
}: {
  onClick: Function;
  isOpen: boolean;
  setIsOpen: Function;
}) => {
  const [search, setSearch] = useState('');
  const [manage, setMange] = useState(false);
  const [userLists, setUserLists] = useState<number[]>(getLSTokenList());
  const dispatch = useDispatch();

  const tokens = useAppSelector<TokenListItem[]>(
    (state) => state.bancor.tokens
  );
  const tokensLists = useAppSelector<TokenList[]>(
    (state) => state.bancor.tokenLists
  );

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
      title={manage ? 'Manage Token Lists' : 'Select a Token'}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      {manage ? (
        <>
          {tokensLists.map((tokenList, index) => (
            <div
              className="flex justify-between items-center"
              key={'Tokenlist_' + index}
            >
              <div>{tokenList.name}</div>
              <img
                alt="TokenList"
                src={tokenList.logoURI}
                className="bg-grey-2 rounded-full h-28 w-28"
              />
              <Switch
                className={`swap-switch !min-w-[0px] ${
                  userLists.includes(index)
                    ? 'bg-primary border-primary dark:bg-primary-light dark:border-primary-light'
                    : 'bg-blue-1 border-blue-1 dark:bg-grey-3 dark:border-grey-3'
                }`}
                checked={userLists.includes(index)}
                onChange={() => handleTokenlistClick(index)}
              />
              <div>{tokenList.tokens.length} Tokens</div>
            </div>
          ))}
        </>
      ) : (
        <>
          <div className="mb-20">
            <InputField
              input={search}
              setInput={setSearch}
              placeholder="Search name or paste address"
              borderGrey
            />
          </div>
          <button onClick={() => setMange(true)}>Manage Token Lists</button>
          <div>
            {tokens
              .filter((token) =>
                token.symbol?.toLowerCase().includes(search.toLowerCase())
              )
              .map((token, index) => {
                return (
                  <button
                    key={'token_' + index}
                    onClick={() => onClick(token)}
                    className="flex items-center justify-between rounded focus:outline-none focus:ring-2 focus:ring-primary w-full px-14 py-5 my-5"
                  >
                    <div className="flex items-center">
                      <img
                        src={getLogoURI(token)}
                        alt={'Token'}
                        className="bg-grey-2 rounded-full h-28 w-28"
                      />
                      <div className="grid justify-items-start ml-5">
                        <div className="text-16">{token.symbol}</div>
                        <div className="text-12 text-grey-3">{token.name}</div>
                      </div>
                    </div>
                    <div>{token.balance}</div>
                  </button>
                );
              })}
          </div>
        </>
      )}
    </Modal>
  );
};
