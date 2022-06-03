import { memo, useState } from 'react';
import { prettifyNumber } from 'utils/helperFunctions';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { ExternalHolding } from 'elements/earn/portfolio/v3/externalHoldings/externalHoldings.types';
import { V3ExternalHoldingsModal } from 'elements/earn/portfolio/v3/externalHoldings/V3ExternalHoldingsModal';
import { TokensOverlap } from 'components/tokensOverlap/TokensOverlap';
import { useAppSelector } from 'store/index';
import { utils } from 'ethers';

interface Props {
  position: ExternalHolding;
}

const V3ExternalHoldingsItem = ({ position }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const allTokenListTokens = useAppSelector(
    (state) => state.bancor.allTokenListTokens
  );

  const nonBancorToken =
    position.nonBancorToken !== undefined
      ? allTokenListTokens.find(
          (t) =>
            utils.getAddress(t.address) ===
            utils.getAddress(position.nonBancorToken?.tokenAddress ?? '')
        )
      : undefined;

  return (
    <div className="rounded-20 border border-fog dark:border-grey p-20">
      <div className="h-30">
        <TokensOverlap
          tokens={
            nonBancorToken
              ? [...position.tokens, nonBancorToken]
              : position.tokens
          }
        />
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
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Full}
        className="mt-20"
        onClick={() => setIsOpen(true)}
      >
        Protect and earn
      </Button>

      <V3ExternalHoldingsModal
        position={position}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        nonBancorToken={nonBancorToken}
      />
    </div>
  );
};

export default memo(V3ExternalHoldingsItem);
