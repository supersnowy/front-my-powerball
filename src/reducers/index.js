import { combineReducers } from 'redux';
import appReducer from './appReducer';
import productReducer from './productReducer';

const rootReducer = combineReducers({
  appReducer,
  productReducer,
});

export default rootReducer;