import { useMemo, useState } from 'react';
import {
  fetchExternalHoldings,
  getExternalHoldingsNonUni,
  getExternalHoldingsUni,
} from 'elements/earn/portfolio/v3/externalHoldings/externalHoldings';
import { Token } from 'services/observables/tokens';
import { useAppSelector } from 'store';
import { useAsyncEffect } from 'use-async-effect';
import {
  ApyVisionData,
  ExternalHolding,
} from 'elements/earn/portfolio/v3/externalHoldings/externalHoldings.types';
import { getV3Tokens } from 'store/bancor/token';
import { orderBy } from 'lodash';

const initialApyVisionData: ApyVisionData = {
  positionsUni: [],
  positionsNonUni: [],
};

export const useExternalHoldings = () => {
  const account = useAppSelector((state) => state.user.account);
  const [apyVisionData, setApyVisionData] =
    useState<ApyVisionData>(initialApyVisionData);

  const v3Tokens: Token[] = useAppSelector(getV3Tokens);
  const tokensMap = useMemo(
    () => new Map(v3Tokens.map((token) => [token.address, token])),
    [v3Tokens]
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
    () => orderBy([...positionsUni, ...positionsNonUni], 'usdValue', 'desc'),
    [positionsUni, positionsNonUni]
  );

  useAsyncEffect(async () => {
    if (!account) {
      setApyVisionData(initialApyVisionData);
      return;
    }
    const apyVisionData = await fetchExternalHoldings(account);
    setApyVisionData(apyVisionData);
  }, [account]);

  return { positions };
};
