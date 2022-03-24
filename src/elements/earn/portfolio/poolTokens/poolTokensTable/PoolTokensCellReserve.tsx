import { Image } from 'components/image/Image';
import { prettifyNumber } from 'utils/helperFunctions';
import { PoolToken } from 'services/observables/v3/pools';

export const PoolTokensCellReserve = (poolToken: PoolToken) => {
  return (
    <div className="flex items-center">
      <Image
        src={poolToken.bnt.token.logoURI}
        alt="Token"
        className="bg-silver rounded-full h-28 w-28 mr-5"
      />
      {`${poolToken.bnt.token.symbol} ${prettifyNumber(poolToken.bnt.amount)}`}
      <div className="mx-20">+</div>
      <Image
        src={poolToken.tkn.token.logoURI}
        alt="Token"
        className="bg-silver rounded-full h-28 w-28 mr-5"
      />
      {`${poolToken.tkn.token.symbol} ${prettifyNumber(poolToken.tkn.amount)}`}
    </div>
  );
};
