import { combineLatest, Subject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { liquidityProtectionStore$ } from './contracts';
import { switchMapIgnoreThrow } from './customOperators';
import { onLogin$ } from './user';
import { fetchLockedBalances } from '../../services/web3/contracts/liquidityProtectionStore/wrapper';
import dayjs from 'utils/dayjs';
import { partition } from 'lodash';
import { BigNumber } from 'bignumber.js';

export const lockedBalancesTrigger = new Subject<true>();

const lockedBalancesTrigger$ = lockedBalancesTrigger.pipe(startWith(true));

export const getLockedBalances = () => lockedBalancesTrigger.next(true);

export const lockedBalances$ = combineLatest([
  liquidityProtectionStore$,
  onLogin$,
  lockedBalancesTrigger$,
]).pipe(
  switchMapIgnoreThrow(([storeAddress, currentUser]) =>
    fetchLockedBalances(storeAddress, currentUser)
  ),
  map((balances) => {
    const now = dayjs();
    const [availableToClaim, pending] = partition(balances, (balance) =>
      dayjs.unix(balance.expirationTime).isBefore(now)
    );

    const totalAvailable = availableToClaim
      .reduce((acc, item) => acc.plus(item.amountDec), new BigNumber(0))
      .toString();

    return {
      availableToClaim,
      pending,
      totalAvailable,
    };
  })
);
