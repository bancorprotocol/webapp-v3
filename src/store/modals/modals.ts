import { createSelector, createSlice } from '@reduxjs/toolkit';
import { ModalNames } from 'modals';
import { RootState } from 'store';

export interface ModalsState {
  openModals: ModalNames[];
}

export const initialState: ModalsState = {
  openModals: [],
};

const modalsSlice = createSlice({
  name: 'modals',
  initialState,
  reducers: {
    pushModal: (state, action) => {
      state.openModals.push(action.payload);
    },
    popModal: (state) => {
      state.openModals.pop();
    },
    replaceModal: (state, action) => {
      state.openModals.pop();
      state.openModals.push(action.payload);
    },
  },
});

export const getModalOpen = createSelector(
  [
    (state: RootState) => state.modals.openModals,
    (_: any, modal: ModalNames) => modal,
  ],
  (openModals: ModalNames[], modal: ModalNames) => {
    return openModals.some((x) => x === modal);
  }
);

export const { pushModal, popModal, replaceModal } = modalsSlice.actions;

export const modals = modalsSlice.reducer;
