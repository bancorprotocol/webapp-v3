import { Token } from 'services/observables/tokens';
import { Reserve } from 'services/observables/pools';
import { TokenImage } from 'components/image/TokenImage';

export const TokensOverlap = ({
  tokens,
  maxLogos = 4,
}: {
  tokens: Token[] | Reserve[];
  maxLogos?: number;
}) => {
  const tokenCount = tokens.length;

  return (
    <div className="flex">
      {tokens.slice(0, maxLogos).map((token, idx) => (
        <TokenImage
          key={token.symbol + idx}
          src={token.logoURI}
          alt="Token Logo"
          className={`w-30 h-30 border border-fog dark:border-black !rounded-full bg-fog dark:bg-black`}
          style={{
            marginLeft: tokens.length > 1 ? `${'-10'}px` : '0px',
          }}
        />
      ))}
      {tokenCount > maxLogos && (
        <div
          className={`w-30 h-30 bg-fog dark:bg-black rounded-full flex items-center justify-center text-12`}
          style={{
            marginLeft: `${'-10'}px`,
          }}
        >
          +{tokenCount - maxLogos}
        </div>
      )}
    </div>
  );
};
