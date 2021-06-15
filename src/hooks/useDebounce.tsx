import { useCallback, useState } from 'react';
import { debounce } from 'lodash';

export const useDebounce = (
  initialState: any = null,
  interval: number = 500
) => {
  const [state, setState] = useState(initialState);

  const setDebouncedState = (_val: any) => {
    debouncer(_val);
  };

  const debouncer = useCallback(
    debounce((_prop: string) => {
      setState(_prop);
    }, interval),
    []
  );

  return [state, setDebouncedState];
};
