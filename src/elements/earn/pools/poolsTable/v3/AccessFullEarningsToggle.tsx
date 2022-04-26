import React, { useState } from 'react';
import { Switch } from 'components/switch/Switch';

export const AccessFullEarningsToggle = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  return (
    <div className="flex flex-col justify-between w-full">
      <div className="flex justify-between pr-10 mb-4">
        Access full earnings
        <Switch
          selected={isEnabled}
          onChange={() => setIsEnabled((prev) => !prev)}
        />
        {'40%'}
      </div>
      Additional gas ~$2
      Compounding rewards === $0.00
    </div>
  );
};
