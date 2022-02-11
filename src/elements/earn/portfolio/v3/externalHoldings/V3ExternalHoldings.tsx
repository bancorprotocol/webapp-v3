import { useAppSelector } from 'redux/index';
import { Token } from 'services/observables/tokens';
import { memo, useMemo, useState } from 'react';
import {
  ApyVisionData,
  ExternalHolding,
  fetchExternalHoldings,
  getExternalHoldingsNonUni,
  getExternalHoldingsUni,
} from 'elements/earn/portfolio/v3/externalHoldings/externalHoldings';
import { useAsyncEffect } from 'use-async-effect';
import { useWeb3React } from '@web3-react/core';
import V3ExternalHoldingsItem from 'elements/earn/portfolio/v3/externalHoldings/V3ExternalHoldingsItem';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react/swiper-react';
import { NavigationOptions } from 'swiper/types';

const navOptions: NavigationOptions = {
  nextEl: '.external-holding-swiper-next-btn',
  prevEl: '.external-holding-swiper-prev-btn',
  disabledClass:
    'cursor-not-allowed text-graphite disabled:hover:text-graphite',
};

const V3ExternalHoldings = () => {
  const { account } = useWeb3React();
  const [apyVisionData, setApyVisionData] = useState<ApyVisionData>({
    positionsUni: [],
    positionsNonUni: [],
  });

  const allTokens: Token[] = useAppSelector((state) => state.bancor.tokens);
  const tokensMap = useMemo(
    () => new Map(allTokens.map((token) => [token.symbol, token])),
    [allTokens]
  );

  const positionsUni: ExternalHolding[] = useMemo(
    () => getExternalHoldingsUni(apyVisionData.positionsUni, tokensMap),
    [apyVisionData.positionsUni, tokensMap]
  );

  const positionsNonUni: ExternalHolding[] = useMemo(
    () => getExternalHoldingsNonUni(apyVisionData.positionsNonUni, tokensMap),
    [apyVisionData.positionsNonUni, tokensMap]
  );

  const positions: ExternalHolding[] = useMemo(
    () => [...positionsUni, ...positionsNonUni],
    [positionsUni, positionsNonUni]
  );

  useAsyncEffect(async () => {
    if (!account) {
      return;
    }
    const apyVisionData = await fetchExternalHoldings(account);
    setApyVisionData(apyVisionData);
  }, [account]);

  return (
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
        <div>1 of {positions.length}</div>
      </div>
    </section>
  );
};

export default memo(V3ExternalHoldings);
