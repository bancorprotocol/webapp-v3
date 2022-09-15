import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';
import { Pool } from 'services/observables/pools';
import { Image } from 'components/image/Image';
import { ModalNames } from 'modals';
import { useDispatch } from 'react-redux';
import { pushModal } from 'store/modals/modals';

interface SelectPoolProps {
  pool: Pool;
  pools: Pool[];
  label: string;
  onSelect: Function;
}

export const SelectPool = ({
  pool,
  pools,
  label,
  onSelect,
}: SelectPoolProps) => {
  const dispatch = useDispatch();

  return (
    <div className="flex justify-between items-center">
      <span className="font-medium">{label}</span>
      <button
        onClick={() =>
          dispatch(
            pushModal({
              modal: ModalNames.SelectPool,
              data: { pools, onSelect },
            })
          )
        }
        className="flex items-center border border-charcoal dark:border-graphite rounded-[16px] px-20 py-6"
      >
        <Image
          src={pool.reserves[0].logoURI.replace('thumb', 'small')}
          alt="Token Logo"
          className="!rounded-full w-24 h-24 z-20"
        />
        <Image
          src={pool.reserves[1].logoURI.replace('thumb', 'small')}
          alt="Token Logo"
          className="-ml-10 !rounded-full w-24 h-24 z-10"
        />
        <span className="ml-10">{pool.name}</span>
        <IconChevronDown className="w-12 ml-10" />
      </button>
    </div>
  );
};
