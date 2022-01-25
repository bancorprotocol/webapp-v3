import { TokenBalance } from 'components/tokenBalance/TokenBalance';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react/swiper-react.js';
import 'swiper/swiper.min.css';
import { NavigationOptions } from 'swiper/types';
import { ReactComponent as IconArrow } from 'assets/icons/arrow.svg';
import { useAppSelector } from 'redux/index';
import { getAvailableToStakeTokens } from 'redux/bancor/token';
import { Pool, Token } from 'services/observables/tokens';

const ContentBlock = ({
  token,
  tknApr,
}: {
  token: Token;
  pool: Pool;
  tknApr: number;
  bntApr: number;
}) => {
  return (
    <button
      onClick={() => alert('clicked')}
      className="content-block w-full flex items-start space-y-20 flex-col p-14 text-left"
    >
      <TokenBalance
        symbol={token.symbol}
        amount={token.balance!}
        usdPrice={token.usdPrice!}
        imgUrl={token.logoURI}
        inverted
      />
      <div>
        <div className="text-graphite mb-5">Earn</div>
        <div className="flex">
          <span className="text-[22px]">{tknApr.toFixed(2)}%</span>
          <IconArrow className="w-10 rotate-[90deg] ml-10" />
        </div>
      </div>
    </button>
  );
};

export const V3AvailableToStake = () => {
  const availabelToStake = useAppSelector(getAvailableToStakeTokens);
  const navOptions: NavigationOptions = {
    nextEl: '.swiper-next-btn',
    prevEl: '.swiper-prev-btn',
    disabledClass:
      'cursor-not-allowed text-graphite disabled:hover:text-graphite',
  };

  return (
    <section className="">
      <div className="flex justify-between mb-10 pr-10">
        <h2>
          Available to stake{' '}
          <span className="text-12 ml-4 text-graphite">
            ({availabelToStake.length})
          </span>
        </h2>
        <div className="space-x-20 flex items-center">
          <button className="swiper-prev-btn hover:text-primary">
            <IconArrow className="w-10 rotate-[-90deg]" />
          </button>
          <button className="swiper-next-btn hover:text-primary">
            <IconArrow className="w-10 rotate-[90deg]" />
          </button>
        </div>
      </div>

      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={3}
        grabCursor
        slidesPerGroup={3}
        navigation={navOptions}
      >
        {availabelToStake.map((item, i) => (
          <SwiperSlide key={i}>
            <ContentBlock {...item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};
