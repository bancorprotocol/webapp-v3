import { Link } from 'react-router-dom';
import { BaseModal } from 'components/base/BaseModal';
import { useState } from 'react';

export const Swap = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-5">
      <h1>Swap</h1>
      <h2>hi</h2>
      <div>
        <BaseModal setIsOpen={setIsOpen} isOpen={isOpen} />
      </div>
      <div className="mb-10">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="btn-primary"
        >
          Open Modal
        </button>
      </div>
      <Link to="/buttons">
        <button className="btn-pink">Button Samples</button>
      </Link>
    </div>
  );
};
