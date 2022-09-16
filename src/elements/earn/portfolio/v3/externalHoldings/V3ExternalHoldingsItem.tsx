import { memo } from 'react';
import { prettifyNumber } from 'utils/helperFunctions';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { ExternalHolding } from 'elements/earn/portfolio/v3/externalHoldings/externalHoldings.types';
import { TokensOverlap } from 'components/tokensOverlap/TokensOverlap';
import { ModalNames } from 'modals';
import { useDispatch } from 'react-redux';
import { pushModal } from 'store/modals/modals';

interface Props {
  position: ExternalHolding;
}

const V3ExternalHoldingsItem = ({ position }: Props) => {
  const dispatch = useDispatch();
  return (
    <div className="p-20 border rounded-20 border-fog">
      <div className="h-30">
        <TokensOverlap tokens={position.tokens} />
      </div>
      <div className="flex justify-between mt-20">
        <div>{position.ammName}: </div>
        <div>{prettifyNumber(position.usdValue, true)}</div>
      </div>
      <div className="flex justify-between mt-6">
        <div>Rekt Status: </div>
        <div className="text-error">{position.rektStatus}</div>
      </div>
      <Button
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Full}
        className="mt-20"
        onClick={() =>
          dispatch(
            pushModal({
              modal: ModalNames.V3ExternalHoldings,
              data: { position },
            })
          )
        }
      >
        Protect and earn
      </Button>
    </div>
  );
};

export default memo(V3ExternalHoldingsItem);
