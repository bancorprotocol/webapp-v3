import { Switch } from 'components/switch/Switch';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'store';
import { setEnableDeposit, setForceV3Routing } from 'store/user/user';

export const AdminControls = () => {
  const dispatch = useDispatch();
  const forceV3Routing = useAppSelector((state) => state.user.forceV3Routing);
  const enableDeposit = useAppSelector((state) => state.user.enableDeposit);

  return (
    <div className="flex items-center justify-center gap-30 mx-10">
      <div className="flex items-center gap-10">
        Force V3
        <Switch
          selected={forceV3Routing}
          onChange={() => dispatch(setForceV3Routing(!forceV3Routing))}
        />
      </div>
      <div className="flex items-center gap-10">
        Enable Deposit
        <Switch
          selected={enableDeposit}
          onChange={() => dispatch(setEnableDeposit(!enableDeposit))}
        />
      </div>
    </div>
  );
};
