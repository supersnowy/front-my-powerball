export const LOADING = 'LOADING';
export const RESET_STATE = 'RESET_STATE';
export const TABCHANGE = 'TABCHANGE';

export const resetState = () => ({
  type: RESET_STATE,
});

export const loading = (value) => ({
  type: LOADING,
  payload: value
});

export const changeTab = (value) => ({
  type: TABCHANGE,
  payload: value
});