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

  const onClose = () => {
    setIsOpen(false);
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
        <div className="space-y-15 mt-20">
          {tokensLists.map((tokenList, index) => (
            <div
              className="flex justify-between items-center border-2 border-grey-3 rounded px-15 py-6"
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
                  <div className={'text-12'}>
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
                  <span className="sr-only">Use setting</span>
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
      ) : (
        <div>
          <div className="mb-20">
            <InputField
              input={search}
              setInput={setSearch}
              placeholder="Search name or paste address"
              borderGrey
            />
          </div>
          <div className="max-h-[522px] overflow-scroll px-2">
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
                    onClick={() => onClick(token)}
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
          <div>
            <hr />
            <button
              onClick={() => setManage(true)}
              className="w-full py-20 text-center text-primary font-semibold"
            >
              Manage Token Lists
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
