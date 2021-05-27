import { Link } from 'react-router-dom';
import { BaseModal } from '../components/base/BaseModal';

export const Swap = () => {
  return (
    <div className="space-y-5">
      <h1>Swap</h1>
      <h2>hi</h2>
      <div>
        <BaseModal />
      </div>
      <Link to="/buttons">
        <button className="btn-pink">Button Samples</button>
      </Link>
    </div>
  );
};
