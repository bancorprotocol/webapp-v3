import { memo } from 'react';
import V3ExternalHoldingsItem from 'elements/earn/portfolio/v3/externalHoldings/V3ExternalHoldingsItem';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react/swiper-react';
import { NavigationOptions } from 'swiper/types';
import { useExternalHoldings } from 'elements/earn/portfolio/v3/externalHoldings/useExternalHoldings';
import { ReactComponent as IconArrow } from 'assets/icons/arrow.svg';

const navOptions: NavigationOptions = {
  nextEl: '.external-holding-swiper-next-btn',
  prevEl: '.external-holding-swiper-prev-btn',
  disabledClass:
    'cursor-not-allowed text-graphite disabled:hover:text-graphite',
};

const V3ExternalHoldings = () => {
  const { positions } = useExternalHoldings();

  return positions.length ? (
    <section className="content-block p-20">
      <h2>
        External Holdings at risk{' '}
        <span className="text-14 text-secondary">({positions.length})</span>
      </h2>
      <p className="mt-10 mb-20 text-secondary">
        Your holdings on other platforms are vulnerable to impermanent loss
      </p>
      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={1}
        grabCursor
        navigation={navOptions}
      >
        {positions.map((pos, i) => (
          <SwiperSlide key={i}>
            <V3ExternalHoldingsItem position={pos} />
          </SwiperSlide>
        ))}
      </Swiper>

      {positions.length > 1 && (
        <div className="space-x-30 flex items-center mt-10">
          <button className="external-holding-swiper-prev-btn hover:text-primary">
            <IconArrow className="w-10 rotate-[-90deg]" />
          </button>
          <button className="external-holding-swiper-next-btn hover:text-primary">
            <IconArrow className="w-10 rotate-[90deg]" />
          </button>
        </div>
      )}
    </section>
  ) : (
    <div className="hidden" />
  );
};

export default memo(V3ExternalHoldings);
