import { Switch } from 'components/switch/Switch';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'store';
import { setForceV3Routing } from 'store/user/user';

export const AdminControls = () => {
  const dispatch = useDispatch();
  const forceV3Routing = useAppSelector((state) => state.user.forceV3Routing);

  return (
    <div className="flex items-center justify-center gap-30 mx-10">
      <div className="flex items-center gap-10">
        Force V3
        <Switch
          selected={forceV3Routing}
          onChange={() => dispatch(setForceV3Routing(!forceV3Routing))}
        />
      </div>
    </div>
  );
};
