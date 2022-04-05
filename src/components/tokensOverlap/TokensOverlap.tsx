import { Image } from 'components/image/Image';
import { Token } from 'services/observables/tokens';
import { Reserve } from 'services/observables/pools';

export const TokensOverlap = ({
  tokens,
  maxLogos = 4,
}: {
  tokens: Token[] | Reserve[];
  maxLogos?: number;
}) => {
  const tokenCount = tokens.length;

  return (
    <div className="relative">
      {tokens.slice(0, maxLogos).map((token, i) => (
        <Image
          key={token.symbol}
          src={token.logoURI}
          alt="Token Logo"
          className={`w-30 h-30 absolute border border-fog rounded-full bg-fog`}
          style={{
            left: `${i * 20}px`,
          }}
        />
      ))}
      {tokenCount > maxLogos && (
        <div
          className={`w-30 h-30 absolute bg-fog rounded-full flex items-center justify-center text-12`}
          style={{
            left: `${maxLogos * 20}px`,
          }}
        >
          +{tokenCount - maxLogos}
        </div>
      )}
    </div>
  );
};
