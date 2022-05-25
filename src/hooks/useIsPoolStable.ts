import { useCallback, useState } from 'react';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { useInterval } from 'hooks/useInterval';

export const useIsPoolStable = (
  poolId: string,
  intervalMs: number | null = 30000
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPoolStable, setIsPoolStable] = useState(false);

  const checkPoolStatus = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await ContractsApi.BancorNetworkInfo.read.isPoolStable(
        poolId
      );
      setIsPoolStable(res);
      return res;
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [poolId]);

  useInterval(checkPoolStatus, intervalMs);

  return { isPoolStable, isLoading, checkPoolStatus };
};
