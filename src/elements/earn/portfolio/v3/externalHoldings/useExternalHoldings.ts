import { useMemo, useState } from 'react';
import {
  fetchExternalHoldings,
  getExternalHoldingsNonUni,
  getExternalHoldingsUni,
} from 'elements/earn/portfolio/v3/externalHoldings/externalHoldings';
import { Token } from 'services/observables/tokens';
import { useAppSelector } from 'redux/index';
import { useAsyncEffect } from 'use-async-effect';
import {
  ApyVisionData,
  ExternalHolding,
} from 'elements/earn/portfolio/v3/externalHoldings/externalHoldings.types';
import { getV3Tokens } from 'redux/bancor/token';

const initialApyVisionData: ApyVisionData = {
  positionsUni: [],
  positionsNonUni: [],
};

export const useExternalHoldings = () => {
  const account = useAppSelector<string | undefined>(
    (state) => state.user.account
  );
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
    () => [...positionsUni, ...positionsNonUni],
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
