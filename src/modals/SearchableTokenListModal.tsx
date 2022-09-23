import { Switch } from 'components/switch/Switch';
import { SuggestedTokens } from 'components/searchableTokenList/SuggestedTokens';
import { SearchInput } from 'components/searchInput/SearchInput';
import { orderBy } from 'lodash';
import { Modal, ModalFullscreen, ModalNames } from 'modals';
import { useState, useMemo } from 'react';
import { isMobile } from 'react-device-detect';
import { userPreferredListIds$ } from 'services/observables/tokenLists';
import { Token, TokenList, TokenMinimal } from 'services/observables/tokens';
import { useAppSelector } from 'store';
import { prettifyNumber } from 'utils/helperFunctions';
import { getTokenListLS, setTokenListLS } from 'utils/localStorage';
import { Image } from 'components/image/Image';
import { wait } from 'utils/pureFunctions';
import { useModal } from 'hooks/useModal';
import { getIsModalOpen, getModalData } from 'store/modals/modals';
import { ReactComponent as IconEdit } from 'assets/icons/edit.svg';

export const SearchableTokenListModal = () => {
  const [manage, setManage] = useState(false);
  const [search, setSearch] = useState('');

  const { popModal } = useModal();
  const isOpen = useAppSelector((state) =>
    getIsModalOpen(state, ModalNames.SearchableTokenList)
  );

  const onClose = async () => {
    popModal();
    await wait(500);
    setManage(false);
    setSearch('');
  };

  if (isMobile) {
    return (
      <ModalFullscreen
        title={manage ? 'Manage' : 'Select a Token'}
        setIsOpen={() => {
          if (manage) return setManage(false);
          onClose();
        }}
        className="flex flex-col px-0"
        isOpen={isOpen}
      >
        <SearchableTokenListContent
          manage={manage}
          setManage={setManage}
          search={search}
          setSearch={setSearch}
          onClose={onClose}
        />
      </ModalFullscreen>
    );
  }

  return (
    <Modal
      title={manage ? 'Manage' : 'Select a Token'}
      isOpen={isOpen}
      setIsOpen={popModal}
      showBackButton={manage}
      onBackClick={() => setManage(false)}
    >
      <SearchableTokenListContent
        manage={manage}
        setManage={setManage}
        search={search}
        setSearch={setSearch}
        onClose={onClose}
      />
    </Modal>
  );
};

interface SearchableTokenListProps {
  limit: boolean;
  tokens: TokenMinimal[];
  excludedTokens?: string[];
  includedTokens?: string[];
  onSelected: (token: Token | TokenMinimal) => void;
}

const SearchableTokenListContent = ({
  manage,
  setManage,
  search,
  setSearch,
  onClose,
}: {
  manage: boolean;
  setManage: (value: boolean) => void;
  search: string;
  setSearch: (value: string) => void;
  onClose: Function;
}) => {
  const [userPreferredListIds, setUserLists] = useState(getTokenListLS());
  const props = useAppSelector<SearchableTokenListProps | undefined>((state) =>
    getModalData(state, ModalNames.SearchableTokenList)
  );

  const tokensLists = useAppSelector<TokenList[]>(
    (state) => state.bancor.tokenLists
  );

  const suggestedTokens = ['BNT', 'ETH', 'WBTC', 'USDC', 'USDT'];

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
    if (!props) return [];
    const { tokens, includedTokens, excludedTokens, limit } = props;

    const filtered = tokens.filter(
      (token) =>
        (includedTokens?.length === 0 ||
          includedTokens?.includes(token.address)) &&
        !excludedTokens?.includes(token.address) &&
        (token.symbol.toLowerCase().includes(search.toLowerCase()) ||
          (token.name &&
            token.name.toLowerCase().includes(search.toLowerCase())))
    );
    return orderBy(filtered, ({ balanceUsd }) => balanceUsd ?? 0, 'desc').slice(
      0,
      limit ? 300 : filtered.length
    );
  }, [props, search]);

  if (!props) return null;

  const { tokens, onSelected } = props;

  return (
    <>
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
          <div className="w-full px-10 h-[calc(70vh-50px)] md:h-[calc(70vh-206px)] overflow-auto pb-10">
            <div className="pb-12">
              <SuggestedTokens
                allTokens={tokens}
                suggestedTokens={suggestedTokens}
                onClick={(token) => {
                  onSelected(token);
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
                    onSelected(token);
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
    </>
  );
};
