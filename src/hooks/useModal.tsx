import { useDispatch } from 'react-redux';
import {
  ModalObj,
  pushModal as pushModalStore,
  popModal as popModalStore,
} from 'store/modals/modals';

export const useModal = () => {
  const dispatch = useDispatch();
  const pushModal = (payload: ModalObj) => dispatch(pushModalStore(payload));
  const popModal = () => dispatch(popModalStore());

  return { pushModal, popModal };
};
