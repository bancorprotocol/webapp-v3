import { SwapWidget } from 'elements/swapWidget/SwapWidget';
import { useQuery } from 'hooks/useQuery';

export const Swap = () => {
  const query = useQuery();

  return (
    <div className="pt-[210px] px-10">
      <SwapWidget
        from={query.get('from')}
        to={query.get('to')}
        limit={query.get('limit')}
      />
    </div>
  );
};
