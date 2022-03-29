import { Image } from 'components/image/Image';
import { Token } from 'services/observables/tokens';
import { Reserve } from 'services/observables/pools';

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
          } z-10 shadow bg-silver rounded-full h-28 w-28`}
        />
      ))}
    </div>
  );
};
