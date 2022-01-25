import { TokenBalance } from 'components/tokenBalance/TokenBalance';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react/swiper-react.js';
import 'swiper/swiper.min.css';
import { NavigationOptions } from 'swiper/types';
import { ReactComponent as IconArrow } from 'assets/icons/arrow.svg';

const ContentBlock = () => {
  return (
    <button
      onClick={() => alert('clicked')}
      className="content-block w-full flex items-start space-y-20 flex-col p-14 text-left"
    >
      <TokenBalance label={'ETH'} amount={'123'} usdPrice={'0.3'} imgUrl={''} />
      <div>
        <div className="text-graphite mb-5">Earn</div>
        <div className="flex">
          <span className="text-[22px]">44%</span>
          <IconArrow className="w-10 rotate-[90deg] ml-10" />
        </div>
      </div>
    </button>
  );
};

export const V3AvailableToStake = () => {
  const navOptions: NavigationOptions = {
    nextEl: '.swiper-next-btn',
    prevEl: '.swiper-prev-btn',
    disabledClass:
      'cursor-not-allowed text-graphite disabled:hover:text-graphite',
  };

  return (
    <section className="">
      <div className="flex justify-between mb-10 pr-10">
        <h2>Available to stake</h2>
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
        slidesPerView={4}
        grabCursor
        slidesPerGroup={3}
        navigation={navOptions}
      >
        {[...Array(10)].map((_, i) => (
          <SwiperSlide key={i}>
            <ContentBlock />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};
