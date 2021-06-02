import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons/faCog';

export const SwapHeader = ({
  isLimit,
  setIsLimit,
}: {
  isLimit: boolean;
  setIsLimit: Function;
}) => {
  return (
    <div>
      <div className="flex justify-between text-grey-3 text-20 py-16 px-20">
        <div>
          <button
            className={
              isLimit ? '' : 'text-blue-4 font-semibold dark:text-grey-0'
            }
            onClick={() => setIsLimit(false)}
          >
            Market
          </button>
          <span className="mx-20">|</span>
          <button
            onClick={() => setIsLimit(true)}
            className={
              isLimit ? 'text-blue-4 font-semibold dark:text-grey-0' : ''
            }
          >
            Limit
          </button>
        </div>
        <div>
          <FontAwesomeIcon icon={faCog} />
        </div>
      </div>
    </div>
  );
};
