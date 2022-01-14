import { ReactComponent as IconSearch } from 'assets/icons/search.svg';
import { ReactComponent as IconClose } from 'assets/icons/times.svg';

interface Props {
  value: string;
  setValue: (value: string) => void;
  className?: string;
}

const defaultClassName =
  'block w-full border border-silver pl-[38px] pr-[38px] dark:bg-charcoal dark:border-grey focus:outline-none focus:border-primary';

export const SearchInput = ({ value, setValue, className }: Props) => {
  return (
    <div className="relative">
      <IconSearch className="absolute w-16 ml-14 text-graphite" />
      {value.length > 0 && (
        <button
          onClick={() => setValue('')}
          className="absolute h-full right-0 mr-14 text-graphite hover:text-error"
        >
          <IconClose className="w-12" />
        </button>
      )}

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search"
        className={`${defaultClassName} ${className}`}
      />
    </div>
  );
};
