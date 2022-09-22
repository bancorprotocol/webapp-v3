import { createSelector, createSlice } from '@reduxjs/toolkit';
import { ModalNames } from 'modals';
import { RootState } from 'store';

export type ModalObj = { modalName: ModalNames; data?: any };

export interface ModalsState {
  openModals: ModalObj[];
}

export const initialState: ModalsState = {
  openModals: [],
};

const modalsSlice = createSlice({
  name: 'modals',
  initialState,
  reducers: {
    pushModal: (state, action) => {
      state.openModals.push({
        modalName: action.payload.modal,
        data: action.payload.data,
      });
    },
    popModal: (state) => {
      state.openModals.pop();
    },
  },
});

export const getIsModalOpen = createSelector(
  [
    (state: RootState) => state.modals.openModals,
    (_: any, modal: ModalNames) => modal,
  ],
  (openModals: ModalObj[], modalName: ModalNames) => {
    return openModals.some((x) => x.modalName === modalName);
  }
);

export const getModalData = createSelector(
  [
    (state: RootState) => state.modals.openModals,
    (_: any, modal: ModalNames) => modal,
  ],
  (openModals: ModalObj[], modalName: ModalNames) => {
    return openModals.find((x) => x.modalName === modalName)?.data;
  }
);

export const { pushModal, popModal } = modalsSlice.actions;

export const modals = modalsSlice.reducer;
