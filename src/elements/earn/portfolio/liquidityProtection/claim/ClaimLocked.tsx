import { Image } from '../../../../../components/image/Image';
import { Token } from 'services/observables/tokens';
import { LockedBnt } from 'services/web3/lockedbnt/lockedbnt';
import { ReactComponent as IconLock } from 'assets/icons/locked.svg';
import { prettifyNumber } from 'utils/helperFunctions';
import { CountdownTimer } from 'components/countdownTimer/CountdownTimer';
import { UTCTimestamp } from 'lightweight-charts';

interface ClaimLockedProps {
  bnt?: Token;
  locked: LockedBnt[];
}

export const ClaimLocked = ({ bnt, locked }: ClaimLockedProps) => {
  const noBntLocked = locked.length === 0;

  return (
    <section className="content-section py-20">
      <h2 className="ml-[20px] md:ml-[44px]">Locked</h2>
      <hr className="content-separator my-14 mx-[20px] md:mx-[44px]" />
      <div className="mx-[20px] md:mx-[44px] mt-30 mb-10">
        <div className="flex-col items-center justify-between">
          {noBntLocked ? (
            <div className="flex items-center">
              <>
                <Image
                  alt="BNT Logo"
                  className="w-30 mr-10"
                  src={bnt?.logoURI}
                />
                <span>No BNT locked</span>
              </>
            </div>
          ) : (
            <>
              {locked.map((lock, index) => (
                <div>
                  <div
                    key={lock.expiry.toString()}
                    className="w-full flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <IconLock className="h-20 mr-16" />
                      <Image
                        alt="BNT Logo"
                        className="w-30 mr-10"
                        src={bnt?.logoURI}
                      />
                      <div className="mr-10">{bnt?.symbol}</div>
                      <div className="mr-10">{prettifyNumber(lock.bnt)}</div>
                      <div className="text-12 text-primary dark:text-primary-light">{`(~${prettifyNumber(
                        bnt && bnt.usdPrice
                          ? Number(bnt.usdPrice) * lock.bnt
                          : 0,
                        true
                      )})`}</div>
                    </div>
                    <div className="flex text-12">
                      <div className="text-primary dark:text-primary-light font-semibold mr-10 text-14">
                        <CountdownTimer
                          date={lock.expiry.unix() as UTCTimestamp}
                        />
                      </div>
                      left to claim
                    </div>
                  </div>
                  {index !== locked.length - 1 && (
                    <hr className="content-separator my-16" />
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
};
