import { timer } from 'rxjs';

const secondsToMilliseconds = (seconds: number) => seconds * 1000;

export const oneMinute$ = timer(0, secondsToMilliseconds(60));
