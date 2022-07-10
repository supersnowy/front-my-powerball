import { LOADING, TABCHANGE } from '../actions/app';
/**
  * Initial state 
*/
const initialState = {    
    loading:false
};

/**
  * App reducer 
  * @param state / initialState 
  * @param action
  * @return updated state
*/
const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOADING:
      return { ...state, loading: action.payload};
     
      case TABCHANGE:
        return { ...state, activeTab: action.payload};
  
    default:
        return state;  
  }
}

export default appReducer;