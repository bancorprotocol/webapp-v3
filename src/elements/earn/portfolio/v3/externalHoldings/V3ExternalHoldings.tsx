import { memo, useState } from 'react';
import V3ExternalHoldingsItem from 'elements/earn/portfolio/v3/externalHoldings/V3ExternalHoldingsItem';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react/swiper-react';
import { NavigationOptions } from 'swiper/types';
import { useExternalHoldings } from 'elements/earn/portfolio/v3/externalHoldings/useExternalHoldings';

const navOptions: NavigationOptions = {
  nextEl: '.external-holding-swiper-next-btn',
  prevEl: '.external-holding-swiper-prev-btn',
  disabledClass:
    'cursor-not-allowed text-graphite disabled:hover:text-graphite',
};

const V3ExternalHoldings = () => {
  const [activeIndex, setActiveIndex] = useState(1);
  const { positions } = useExternalHoldings();

  return positions.length ? (
    <section className="content-block p-20">
      <h2>External Holdings at risk</h2>
      <p className="mb-10 text-graphite">
        Your holdings on other platforms are vulnerable to impermanent loss
      </p>
      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={1}
        grabCursor
        onActiveIndexChange={({ activeIndex }) =>
          setActiveIndex(activeIndex + 1)
        }
        navigation={navOptions}
      >
        {positions.map((pos, i) => (
          <SwiperSlide key={i}>
            <V3ExternalHoldingsItem position={pos} />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="space-x-10 flex items-center mt-10">
        <button className="external-holding-swiper-prev-btn hover:text-primary">
          {'<--'}
        </button>
        <button className="external-holding-swiper-next-btn hover:text-primary">
          {'-->'}
        </button>
        <div>
          {activeIndex} of {positions.length}
        </div>
      </div>
    </section>
  ) : (
    <div className="hidden" />
  );
};

export default memo(V3ExternalHoldings);
