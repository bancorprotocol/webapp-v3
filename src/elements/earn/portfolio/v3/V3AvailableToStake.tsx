import { TokenBalance } from 'components/tokenBalance/TokenBalance';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { NavigationOptions } from 'swiper/types';
import { ReactComponent as IconArrow } from 'assets/icons/arrow.svg';
import { useAppSelector } from 'store';
import { getAvailableToStakeTokens } from 'store/bancor/token';
import { Token } from 'services/observables/tokens';
import { PoolV3 } from 'services/observables/pools';
import 'swiper/css';
import { useDispatch } from 'react-redux';
import { pushModal } from 'store/modals/modals';
import { ModalNames } from 'modals';

const AvailableItem = ({ token, pool }: { token: Token; pool: PoolV3 }) => {
  const dispatch = useDispatch();

  return (
    <button
      onClick={() => dispatch(pushModal(ModalNames.DepositDisabled))}
      className="flex flex-col items-start w-full space-y-20 text-left content-block p-14"
    >
      <TokenBalance
        symbol={token.symbol}
        amount={token.balance!}
        usdPrice={token.usdPrice!}
        imgUrl={token.logoURI}
      />
      <div>
        <div className="mb-5 text-secondary">Earn</div>
        <div className="flex">
          <span className="text-[22px]">{pool.apr7d.total.toFixed(2)}%</span>
          <IconArrow className="w-10 rotate-[90deg] ml-10" />
        </div>
      </div>
    </button>
  );
};

const navOptions: NavigationOptions = {
  nextEl: '.swiper-next-btn',
  prevEl: '.swiper-prev-btn',
  disabledClass:
    'cursor-not-allowed text-secondary disabled:hover:text-secondary',
};

export const V3AvailableToStake = () => {
  const availabelToStake = useAppSelector(getAvailableToStakeTokens);
  if (availabelToStake.length === 0) return null;

  return (
    <section>
      <div className="flex justify-between pr-10 mb-20">
        <h2>
          Deposit & Earn{' '}
          <span className="ml-4 text-12 text-secondary">
            ({availabelToStake.length})
          </span>
        </h2>
        {availabelToStake.length > 3 && (
          <div className="flex items-center space-x-20">
            <button className="swiper-prev-btn hover:text-primary">
              <IconArrow className="w-10 rotate-[-90deg]" />
            </button>
            <button className="swiper-next-btn hover:text-primary">
              <IconArrow className="w-10 rotate-[90deg]" />
            </button>
          </div>
        )}
      </div>

      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={1}
        grabCursor
        slidesPerGroup={1}
        navigation={navOptions}
        breakpoints={{
          440: {
            slidesPerView: 2,
            slidesPerGroup: 2,
          },
          1280: {
            slidesPerView: 3,
            slidesPerGroup: 3,
          },
        }}
      >
        {availabelToStake.map((item, i) => (
          <SwiperSlide key={i}>
            <AvailableItem {...item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};
