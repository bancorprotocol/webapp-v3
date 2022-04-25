import { memo } from 'react';
import { prettifyNumber } from 'utils/helperFunctions';
import { Image } from 'components/image/Image';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { ExternalHolding } from 'elements/earn/portfolio/v3/externalHoldings/externalHoldings.types';
import { TokensOverlap } from 'components/tokensOverlap/TokensOverlap';

interface Props {
  position: ExternalHolding;
}

const V3ExternalHoldingsItem = ({ position }: Props) => {
  return (
    <div className="rounded-20 border border-fog p-20">
      <div className="h-30">
        <TokensOverlap tokens={position.tokens} />
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
