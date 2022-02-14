import { memo } from 'react';
import { prettifyNumber } from 'utils/helperFunctions';
import { Image } from 'components/image/Image';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { ExternalHolding } from 'elements/earn/portfolio/v3/externalHoldings/externalHoldings.types';

interface Props {
  position: ExternalHolding;
}

const MAX_TOKEN_LOGOS = 4;

const V3ExternalHoldingsItem = ({ position }: Props) => {
  const { tokens } = position;
  const tokenCount = tokens.length;
  return (
    <div className="rounded-20 border border-fog p-20">
      <div className="relative h-30">
        {tokens.slice(0, MAX_TOKEN_LOGOS).map((token, i) => (
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
        {tokenCount > MAX_TOKEN_LOGOS && (
          <div
            className={`w-30 h-30 absolute bg-fog rounded-full flex items-center justify-center text-12`}
            style={{
              left: `${MAX_TOKEN_LOGOS * 20}px`,
            }}
          >
            +{tokenCount - MAX_TOKEN_LOGOS}
          </div>
        )}
      </div>
      <div className="mt-20 flex justify-between">
        <div>{position.ammName}: </div>
        <div>{prettifyNumber(position.usdValue, true)}</div>
      </div>
      <div className="mt-6 flex justify-between">
        <div>Rekt Status: </div>
        <div className="text-error">{position.rektStatus}</div>
      </div>
      <Button
        variant={ButtonVariant.SECONDARY}
        size={ButtonSize.SMALL}
        className="w-full mt-20"
      >
        Protect and earn
      </Button>
    </div>
  );
};

export default memo(V3ExternalHoldingsItem);
