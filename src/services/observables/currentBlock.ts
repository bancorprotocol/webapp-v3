import { from, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { web3 } from 'services/web3/contracts';
import dayjs from 'utils/dayjs';

export const currentBlock$ = from(web3.eth.getBlockNumber()).pipe(
  map((currentBlock) => ({ currentBlock, timeUnix: dayjs().unix() })),
  shareReplay(1)
);
