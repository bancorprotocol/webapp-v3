import { Image } from 'components/image/Image';
import { Reserve, Token } from 'services/observables/tokens';

export const TokensOverlap = ({ tokens }: { tokens: Token[] | Reserve[] }) => {
  return (
    <div className="flex">
      {tokens.map((token, index) => (
        <Image
          key={token.address}
          src={token.logoURI}
          alt="Token"
          className={`${
            index === 1 && '-ml-12 z-0'
          } z-10 shadow bg-grey-2 rounded-full h-28 w-28`}
        />
      ))}
    </div>
  );
};
