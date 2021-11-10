import { useDispatch } from 'react-redux';
import {
  claimBntNotification,
  rejectNotification,
} from 'services/notifications/notifications';
import { Token } from 'services/observables/tokens';
import { claimBnt } from 'services/web3/lockedbnt/lockedbnt';
import { prettifyNumber } from 'utils/helperFunctions';
import { Image } from '../../../../../components/image/Image';

interface ClaimAvailableProps {
  bnt?: Token;
  availableBNT: number;
  loading: boolean;
}

export const ClaimAvailable = ({
  bnt,
  availableBNT,
  loading,
}: ClaimAvailableProps) => {
  const dispatch = useDispatch();
  const noBntToClaim = availableBNT === 0;

  return (
    <section className="content-section py-20">
      <h2 className="ml-[20px] md:ml-[44px]">Available to Claim</h2>
      <hr className="content-separator my-14 mx-[20px] md:mx-[44px]" />
      {loading ? (
        <div className="flex items-center h-50 mx-30">
          <div className="loading-skeleton h-20 w-full"></div>
        </div>
      ) : (
        <div className="mx-[20px] md:mx-[44px] mt-30 mb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image alt="BNT Logo" className="w-30 mr-10" src={bnt?.logoURI} />
              {noBntToClaim ? (
                <span> No BNT to claim</span>
              ) : (
                <>
                  <span className="pr-10">{bnt?.symbol}</span>
                  <span className="pr-10 text-14">
                    {prettifyNumber(availableBNT)}
                  </span>
                  <span className="text-12 text-primary dark:text-primary-light">{`(~${prettifyNumber(
                    bnt && bnt.usdPrice
                      ? Number(bnt.usdPrice) * availableBNT
                      : 0,
                    true
                  )})`}</span>
                </>
              )}
            </div>
            <button
              className="btn-primary btn-sm rounded-[12px]"
              onClick={() =>
                claimBnt(
                  (txHash) => {
                    claimBntNotification(
                      dispatch,
                      txHash,
                      prettifyNumber(availableBNT)
                    );
                  },
                  () => {},
                  () => rejectNotification(dispatch),
                  () => {}
                )
              }
              disabled={noBntToClaim}
            >
              Claim BNT
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
