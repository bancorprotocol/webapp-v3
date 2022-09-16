import { createSelector, createSlice } from '@reduxjs/toolkit';
import { ModalNames } from 'modals';
import { RootState } from 'store';

export interface ModalsState {
  openModals: { modal: ModalNames; data: any }[];
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
        modal: action.payload.modal,
        data: action.payload.data,
      });
    },
    popModal: (state, _) => {
      state.openModals.pop();
    },
  },
});

export const getModalOpen = createSelector(
  [
    (state: RootState) => state.modals.openModals,
    (_: any, modal: ModalNames) => modal,
  ],
  (openModals: { modal: ModalNames; data: any }[], modal: ModalNames) => {
    return openModals.some((x) => x.modal === modal);
  }
);

export const getModalData = createSelector(
  [
    (state: RootState) => state.modals.openModals,
    (_: any, modal: ModalNames) => modal,
  ],
  (openModals: { modal: ModalNames; data: any }[], modal: ModalNames) => {
    return openModals.find((x) => x.modal === modal)?.data;
  }
);

export const { pushModal, popModal } = modalsSlice.actions;

export const modals = modalsSlice.reducer;
