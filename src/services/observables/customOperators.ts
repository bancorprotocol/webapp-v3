import { Observable } from 'rxjs';
import { switchMap, filter } from 'rxjs/operators';

export const switchMapIgnoreThrow =
  <T, Y>(switchMapProm: (data: T) => Promise<Y>) =>
  (source: Observable<T>): Observable<Y> =>
    source.pipe(
      switchMap((whatever) =>
        switchMapProm(whatever).catch(() => 'DONT THROW' as unknown as Y)
      ),
      filter((x) => !(typeof x === 'string' && x === 'DONT THROW'))
    );
