import { Switch } from 'components/switch/Switch';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'store';
import { setForceV3Routing } from 'store/user/user';
import { setForceV2Routing } from 'store/user/user';

export const AdminControls = () => {
  const dispatch = useDispatch();
  const forceV3Routing = useAppSelector((state) => state.user.forceV3Routing);
  const forceV2Routing = useAppSelector((state) => state.user.forceV2Routing);

  return (
    <div className="flex flex-col items-center justify-center gap-10">
      <h2 className="pb-20 text-primary">Admin Controls</h2>

      <div className="flex items-center gap-10">
        Force V3
        <Switch
          selected={forceV3Routing}
          onChange={() => {
            dispatch(setForceV3Routing(!forceV3Routing));
            dispatch(setForceV2Routing(false));
          }}
        />
      </div>
      <div className="flex items-center gap-10">
        Force V2
        <Switch
          selected={forceV2Routing}
          onChange={() => {
            dispatch(setForceV2Routing(!forceV2Routing));
            dispatch(setForceV3Routing(false));
          }}
        />
      </div>
    </div>
  );
};
