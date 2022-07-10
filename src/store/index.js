import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import logger from "redux-logger";
import rootReducer from '../reducers';

let middlerware = [];
// if(process.env.NODE_ENV === 'development'){
//     middlerware = applyMiddleware(thunkMiddleware, logger);
// }else{
    middlerware = applyMiddleware(thunkMiddleware);
// }

const store = createStore(rootReducer, middlerware);

export default store;