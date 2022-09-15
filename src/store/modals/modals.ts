import { createSelector, createSlice } from '@reduxjs/toolkit';
import { ModalNames } from 'modals';
import { RootState } from 'store';

export interface ModalsState {
  openModals: Map<ModalNames, any>;
}

export const initialState: ModalsState = {
  openModals: new Map(),
};

const modalsSlice = createSlice({
  name: 'modals',
  initialState,
  reducers: {
    pushModal: (state, action) => {
      state.openModals.set(action.payload.modal, action.payload.data);
    },
    popModal: (state, action) => {
      state.openModals.delete(action.payload);
    },
  },
});

export const getModalOpen = createSelector(
  [
    (state: RootState) => state.modals.openModals,
    (_: any, modal: ModalNames) => modal,
  ],
  (openModals: Map<ModalNames, any>, modal: ModalNames) => {
    return openModals.has(modal);
  }
);

export const { pushModal, popModal } = modalsSlice.actions;

export const modals = modalsSlice.reducer;
