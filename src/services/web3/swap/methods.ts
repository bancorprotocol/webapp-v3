import {
  buildNetworkContract,
  conversionPath,
  getRateByPath,
} from 'services/web3/contracts/network/wrapper';
import { web3 } from 'services/web3/contracts';
import { bancorNetwork$ } from 'services/observables/contracts';
import { take } from 'rxjs/operators';
import { TokenListItem } from 'services/observables/tokens';
import { expandToken, shrinkToken } from 'utils/pureFunctions';
import { ethToken, zeroAddress } from '../config';
import BigNumber from 'bignumber.js';
import { apiData$ } from 'services/observables/pools';

export const getRate = async (
  fromToken: TokenListItem,
  toToken: TokenListItem,
  amount: string
): Promise<string> => {
  const networkContractAddress = await bancorNetwork$.pipe(take(1)).toPromise();

  const path = await conversionPath({
    from: fromToken.address,
    to: toToken.address,
    networkContractAddress,
    web3,
  });

  const fromAmountWei = expandToken(amount, fromToken.decimals);
  const toAmountWei = await getRateByPath({
    networkContractAddress,
    amount: fromAmountWei,
    path,
    web3,
  });

  return shrinkToken(toAmountWei, toToken.decimals);
};

/*
export const swap = async ({
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  user,
  onUpdate,
  onPrompt,
}: {
  fromToken: TokenListItem;
  toToken: TokenListItem;
  fromAmount: string;
  toAmount: string;
  user: string;
  onUpdate: Function;
  onPrompt: Function;
}): Promise<string> => {
  const fromIsEth = fromToken.address.toLowerCase() === ethToken.toLowerCase();
  const networkContractAddress = await bancorNetwork$.pipe(take(1)).toPromise();

  const steps: any[] = [
    {
      name: 'Pathing',
      description: 'Finding path...',
    },
    {
      name: 'SetApprovalAmount',
      description: 'Setting approval amount...',
    },
    {
      name: 'ConvertProcessing',
      description: 'Processing conversion...',
    },
    {
      name: 'WaitingTxConf',
      description: 'Awaiting block confirmation...',
    },
    {
      name: 'Done',
      description: 'Done!',
    },
  ];
  onUpdate!(0, steps);

  const minimalRelays = await winningMinimalRelays();

  const fromWei = expandToken(fromAmount, fromToken.decimals);
  const relays = await findBestPath({
    relays: minimalRelays,
    fromId: fromToken.address,
    toId: toToken.address,
  });

  const ethPath = generateEthPath(fromToken.symbol, relays);

  onUpdate!(1, steps);
  await triggerApprovalIfRequired({
    owner: user,
    amount: fromWei,
    spender: networkContractAddress,
    tokenAddress: fromToken.address,
    onPrompt,
  });
  onUpdate!(2, steps);

  const networkContract = buildNetworkContract(networkContractAddress);

  const expectedReturnWei = expandToken(toAmount, toToken.decimals);

  const confirmedHash = await resolveTxOnConfirmation({
    tx: networkContract.methods.convertByPath(
      ethPath.path,
      fromWei,
      await weiMinusSlippageTolerance(expectedReturnWei),
      zeroAddress,
      zeroAddress,
      0
    ),
    onConfirmation: () => {}, //spamBalances([fromTokenContract, toTokenContract]),
    resolveImmediately: true,
    ...(fromIsEth && { value: fromWei }),
    onHash: () => onUpdate!(3, steps),
  });

  onUpdate!(4, steps);

  return confirmedHash;
};

const winningMinimalRelays = async (): Promise<MinimalRelay[]> => {
  const relaysWithBalances = (
    await apiData$.pipe(take(1)).toPromise()
  ).pools.filter((pool) =>
    pool.reserves.every((reserve) => reserve.balance !== '0')
  );

  const relaysByLiqDepth = relays
    .sort(sortByLiqDepth)
    .filter((relay) =>
      relaysWithBalances.some((r) => compareString(relay.id, r.pool_dlt_id))
    );
  const winningRelays = uniqWith(relaysByLiqDepth, compareRelayByReserves);

  const relaysWithConverterAddress = winningRelays.map((relay) => {
    const apiRelay = findOrThrow(this.apiData!.pools, (pool) =>
      compareString(pool.pool_dlt_id, relay.id)
    );
    return {
      ...relay,
      converterAddress: apiRelay.converter_dlt_id,
    };
  });

  const minimalRelays = relaysWithConverterAddress.map(
    viewRelayConverterToMinimal
  );
  return minimalRelays;
};

const findBestPath = async ({
  fromId,
  toId,
  relays,
}: {
  fromId: string;
  toId: string;
  relays: readonly MinimalRelay[];
}): Promise<MinimalRelay[]> => {
  const possibleStartingRelays = relays.filter((relay) =>
    relay.reserves.some((reserve) => compareString(reserve.contract, fromId))
  );
  const moreThanOneReserveOut = possibleStartingRelays.length > 1;
  const onlyOneHopNeeded = relays.some((relay) =>
    [fromId, toId].every((id) =>
      relay.reserves.some((reserve) => compareString(reserve.contract, id))
    )
  );
  const fromIsBnt = compareString(
    fromId,
    this.liquidityProtectionSettings.networkToken
  );
  const checkMultiplePaths =
    moreThanOneReserveOut && !onlyOneHopNeeded && !fromIsBnt;

  const allViewRelays = this.relays;

  if (checkMultiplePaths) {
    const fromSymbol = findOrThrow(
      this.apiData!.tokens,
      (token) => compareString(token.dlt_id, fromId),
      'failed finding token....'
    ).symbol;
    const excludedRelays = relays.filter(
      (relay) =>
        !possibleStartingRelays.some((r) =>
          compareString(r.anchorAddress, relay.anchorAddress)
        )
    );

    const results = await mapIgnoreThrown(
      possibleStartingRelays,
      async (startingRelay) => {
        const isolatedRelays = [startingRelay, ...excludedRelays];
        const relayPath = await Promise.race([
          this.findPath({
            fromId,
            relays: isolatedRelays,
            toId,
          }),
          throwAfter(1000),
        ]);

        const path = generateEthPath(fromSymbol, relayPath);
        const viewRelay = findOrThrow(allViewRelays, (relay) =>
          compareString(relay.id, startingRelay.anchorAddress)
        );

        return {
          startingRelayAnchor: startingRelay.anchorAddress,
          liqDepth: viewRelay.liqDepth,
          path,
          relays: relayPath,
        };
      }
    );

    const passedResults = results.filter((res) => res.liqDepth);

    if (passedResults.length == 0)
      throw new Error(`Failed finding a path between tokens`);

    const sortedReturns = passedResults.sort((a, b) =>
      new BigNumber(b.liqDepth).minus(a.liqDepth).toNumber()
    );
    const bestReturn = sortedReturns[0];
    return bestReturn.relays;
  } else {
    return this.findPath({ fromId, toId, relays });
  }
};

const generateEthPath = (from: string, relays: MinimalRelay[]) => {
  return relays.reduce<{
    lastSymbol: string;
    path: string[];
    sortedRelays: MinimalRelay[];
  }>(
    (acc, item) => {
      const destinationSymbol = item.reserves.find(
        (reserve) => reserve.symbol !== acc.lastSymbol
      )!;
      const anchorAddress = item.anchorAddress;
      const [fromReserve, toReserve] = sortAlongSide(
        item.reserves,
        (reserve) => reserve.symbol,
        [acc.lastSymbol]
      );
      return {
        path: [...acc.path, anchorAddress, destinationSymbol.contract],
        lastSymbol: destinationSymbol.symbol,
        sortedRelays: [
          ...acc.sortedRelays,
          { ...item, reserves: [fromReserve, toReserve] },
        ],
      };
    },
    {
      lastSymbol: from,
      path: [
        relays[0].reserves.find((reserve) => reserve.symbol == from)!.contract,
      ],
      sortedRelays: [],
    }
  );
};

const weiMinusSlippageTolerance = async (wei: string): Promise<string> => {
  const slippageTolerance = vxm.bancor.slippageTolerance;
  if (typeof slippageTolerance !== 'number')
    throw new Error('Error finding slippage tolerance');
  const percent = new BigNumber(1).minus(slippageTolerance);
  const newWei = new BigNumber(wei).times(percent).toFixed(0);
  return newWei;
};

const triggerApprovalIfRequired = async (tokenWithdrawal: {
  owner: string;
  spender: string;
  tokenAddress: string;
  amount: string;
  onPrompt?: OnPrompt;
}) => {
  const fromIsEth = compareString(
    tokenWithdrawal.tokenAddress,
    ethReserveAddress
  );
  if (fromIsEth) {
    if (tokenWithdrawal.onPrompt) {
      return awaitConfirmation(tokenWithdrawal.onPrompt);
    }
  }
  const { approvalIsRequired, currentApprovedBalance } =
    await isApprovalRequired(tokenWithdrawal);

  if (!approvalIsRequired) {
    if (tokenWithdrawal.onPrompt) {
      return this.awaitConfirmation(tokenWithdrawal.onPrompt);
    }
    return;
  }

  const withCurrentApprovedBalance = {
    ...tokenWithdrawal,
    currentApprovedBalance,
  };
  if (tokenWithdrawal.onPrompt) {
    const { unlimitedApproval } = await this.promptUserForApprovalType(
      tokenWithdrawal.onPrompt
    );
    await this.approveTokenWithdrawal({
      ...withCurrentApprovedBalance,
      ...(unlimitedApproval && { amount: unlimitedWei }),
    });
    await this.awaitConfirmation(tokenWithdrawal.onPrompt);
  } else {
    return this.approveTokenWithdrawal(withCurrentApprovedBalance);
  }
};

const resolveTxOnConfirmation = async ({
  tx,
  gas,
  value,
  resolveImmediately = false,
  onHash,
  onConfirmation,
}: {
  tx: ContractSendMethod;
  value?: string;
  gas?: number;
  resolveImmediately?: boolean;
  onHash?: (hash: string) => void;
  onConfirmation?: (hash: string) => void;
}): Promise<string> => {
  let adjustedGas: number | boolean = false;
  if (gas) {
    adjustedGas = gas;
  } else {
    try {
      adjustedGas = await determineTxGas(tx);
    } catch (e) {}
  }

  return new Promise((resolve, reject) => {
    let txHash: string;
    tx.send({
      from: currentUser,
      ...(adjustedGas && { gas: adjustedGas as number }),
      ...(value && { value: toHex(value) }),
    })
      .on('transactionHash', (hash: string) => {
        txHash = hash;
        if (onHash) onHash(hash);
        if (resolveImmediately) {
          resolve(txHash);
        }
      })
      .on('confirmation', (confirmationNumber: number) => {
        if (confirmationNumber === 1) {
          if (onConfirmation) onConfirmation(txHash);
          resolve(txHash);
        }
      })
      .on('error', (error: any) => reject(error));
  });
};*/
