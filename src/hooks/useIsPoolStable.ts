import { useCallback, useEffect, useState } from 'react';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { useInterval } from 'hooks/useInterval';

export const useIsPoolStable = (
  poolId: string,
  intervalMs: number | null = 30000
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPoolStable, setIsPoolStable] = useState<boolean | null>(null);

  const checkPoolStatus = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setIsPoolStable(null);
    try {
      const res = await ContractsApi.BancorNetworkInfo.read.isPoolStable(
        poolId
      );
      console.log('res pool stable', res);
      setIsPoolStable(res);
      return res;
    } catch (e) {
      console.error(e);
      setIsPoolStable(null);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [poolId]);

  useEffect(() => {
    void checkPoolStatus();
  }, [checkPoolStatus]);

  useInterval(checkPoolStatus, intervalMs);

  return { isPoolStable, isLoading, checkPoolStatus };
};
