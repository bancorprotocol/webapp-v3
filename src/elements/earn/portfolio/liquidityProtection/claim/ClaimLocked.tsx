import { Token } from 'services/observables/tokens';
import { LockedBnt } from 'services/web3/lockedbnt/lockedbnt';
import { ReactComponent as IconLock } from 'assets/icons/locked.svg';
import { prettifyNumber } from 'utils/helperFunctions';
import { CountdownTimer } from 'components/countdownTimer/CountdownTimer';
import { UTCTimestamp } from 'lightweight-charts';
import { isMobile } from 'react-device-detect';
import { Image } from 'components/image/Image';

interface ClaimLockedProps {
  bnt?: Token;
  lockedBNT: LockedBnt[];
  loading: boolean;
}

export const ClaimLocked = ({ bnt, lockedBNT, loading }: ClaimLockedProps) => {
  const noBntLocked = lockedBNT.length === 0;

  return (
    <section className="py-20 content-section">
      <h2 className="ml-[20px] md:ml-[44px]">Locked</h2>
      <hr className="content-separator my-14 mx-[20px] md:mx-[44px]" />

      {loading ? (
        <div className="flex items-center h-50 mx-30">
          <div className="w-full h-20 loading-skeleton"></div>
        </div>
      ) : (
        <div className="mx-[20px] md:mx-[44px] mt-30 mb-10">
          <div className="flex-col items-center justify-between">
            {noBntLocked ? (
              <div className="flex items-center">
                <>
                  <Image
                    alt="BNT Logo"
                    className="w-30 h-30 !rounded-full mr-10"
                    src={bnt?.logoURI}
                  />
                  <span>No BNT locked</span>
                </>
              </div>
            ) : (
              <>
                {lockedBNT.map((lock, index) => (
                  <div key={lock.expiry.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        {!isMobile && <IconLock className="h-20 mr-16" />}
                        <Image
                          alt="BNT Logo"
                          className="w-30 h-30 !rounded-full mr-10"
                          src={bnt?.logoURI}
                        />
                        <div className="mr-10">{bnt?.symbol}</div>
                        <div className="mr-10">{prettifyNumber(lock.bnt)}</div>
                        <div className="text-12 text-primary dark:text-primary-light">{`(${prettifyNumber(
                          bnt && bnt.usdPrice
                            ? Number(bnt.usdPrice) * lock.bnt
                            : 0,
                          true
                        )})`}</div>
                      </div>
                      <div className="flex text-12">
                        <div className="mr-10 font-semibold text-primary dark:text-primary-light text-14">
                          <CountdownTimer date={lock.expiry as UTCTimestamp} />
                        </div>
                        {!isMobile && 'left to claim'}
                      </div>
                    </div>
                    {index !== lockedBNT.length - 1 && (
                      <hr className="my-16 content-separator" />
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
