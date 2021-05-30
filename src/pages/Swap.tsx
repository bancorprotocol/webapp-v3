import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BaseModal } from 'components/base/BaseModal';
import { Dropdown } from 'components/Dropdown';

export const Swap = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="grid justify-center space-y-5">
      <h1>Samples</h1>
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
      <div className="h-20">
        <Dropdown
          title={'Dropdown'}
          items={[
            { id: '1', title: 'item1' },
            { id: '2', title: 'item2' },
            { id: '3', title: 'item3' },
            { id: '4', title: 'item4' },
            { id: '5', title: 'item5' },
            { id: '6', title: 'item6' },
            { id: '7', title: 'item7' },
            { id: '8', title: 'item8' },
            { id: '9', title: 'item9' },
            { id: '10', title: 'item10' },
            { id: '11', title: 'item11' },
            { id: '12', title: 'item12' },
          ]}
        />
      </div>
    </div>
  );
};
