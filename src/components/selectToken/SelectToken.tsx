import { useState } from 'react';
import { classNameGenerator } from 'utils/pureFunctions';
import { SearchableTokenList } from 'components/searchableTokenList/SearchableTokenList';
import { Token } from 'services/observables/tokens';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';
import { Image } from 'components/image/Image';

interface SelectTokenProps {
  label?: string;
  selectable?: boolean;
  token?: Token | null;
  tokens?: Token[];
  setToken?: Function;
  startEmpty?: boolean;
  excludedTokens?: string[];
  includedTokens?: string[];
}

export const SelectToken = ({
  label,
  selectable,
  token,
  tokens,
  setToken,
  startEmpty,
  excludedTokens = [],
  includedTokens = [],
}: SelectTokenProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSelectToken, setSelectToken] = useState(!!startEmpty);

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="text-blue-4 dark:text-grey-0 font-medium">{label}</div>
        {!showSelectToken || token ? (
          <div
            className={`flex items-center ${classNameGenerator({
              'cursor-pointer': selectable,
            })}`}
            onClick={() => (selectable ? setIsOpen(true) : {})}
          >
            {token ? (
              <>
                <Image
                  src={token.logoURI}
                  alt="Token"
                  className="bg-grey-2 rounded-full h-28 w-28"
                />
                <span className="text-20 mx-10">{token.symbol}</span>
              </>
            ) : (
              <>
                <div className="loading-skeleton h-28 w-28"></div>
                <div className="loading-skeleton mx-10 h-16 w-50"></div>
              </>
            )}

            {selectable && (
              <div>
                <IconChevronDown className="w-[10px] mr-10 text-grey-4 dark:text-grey-3" />
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => (selectable ? setIsOpen(true) : {})}
            className="flex items-center text-primary font-medium text-20"
          >
            Select a token
            <IconChevronDown className="w-[10px] ml-10" />
          </button>
        )}
      </div>

      <SearchableTokenList
        onClick={(token: Token) => {
          if (setToken) setToken(token);
          setSelectToken(false);
        }}
        isOpen={isOpen}
        limit
        setIsOpen={setIsOpen}
        tokens={tokens ? tokens : []}
        excludedTokens={excludedTokens}
        includedTokens={includedTokens}
      />
    </>
  );
};
