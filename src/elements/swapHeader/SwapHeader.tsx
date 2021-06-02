import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons/faCog';
import { Link, useRouteMatch } from 'react-router-dom';

export const SwapHeader = () => {
  let { url } = useRouteMatch();

  return (
    <div>
      <div className="flex justify-between text-grey-3 text-20 py-16 px-20">
        <div>
          <Link to={`/swap/market`}>Market</Link>
          <Link to={`/swap/limit`}>Limit</Link>

          <span className="text-blue-4 font-semibold dark:text-grey-0">
            Market
          </span>
          <span className="mx-20">|</span>
          <span>Limit</span>
        </div>
        <div>
          <FontAwesomeIcon icon={faCog} />
        </div>
      </div>
    </div>
  );
};
