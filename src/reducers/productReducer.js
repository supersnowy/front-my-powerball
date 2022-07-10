import { productType } from '../constants';
import { RESET_STATE } from '../actions/app';
/**
  * Initial state 
*/
const initialState = {
  isAuthenticated : false,
  userSettings: {},
  productList: '',
  success: '',
  error: '',  
  totalBalance: 0,
  customerSettings: {}
};

/**
  * Product reducer 
  * @param state / initialState 
  * @param action
  * @return updated state
*/
const productReducer = (state = initialState, action) => {
  switch (action.type) {
    case productType.PLAYER_AUTHENTICATE_SUCCESS:
      return { ...state, isAuthenticated: true, userSettings: action.payload, totalBalance: action.payload.totalBalance };

    case productType.PLAYER_AUTHENTICATE_FAILURE:
      return { ...state, isAuthenticated: false, userSettings: {}, error: "app.user-denied" };

    case productType.GET_PRODUCT_LIST_SUCCESS:
      return { ...state, productList: action.payload };

    case productType.GET_PRODUCT_LIST_FAILURE:
      return state;

    case productType.CART_SUBMIT_SUCCESS:
      return { ...state, success: action.payload };

    case productType.CART_SUBMIT_FAILURE:
      return { ...state, error: action.payload };

    case RESET_STATE:
      return { ...state, error: '', success: '' };

      case productType.UPDATE_BALANCE:
        return{...state, totalBalance: action.payload};

      case productType.CUSTOMER_SETTINGS:
        return{ ...state, customerSettings: action.payload };

        case productType.RECENT_RESULTS:
          return{ ...state, recentResults: action.payload};
          
    default:
      return state;
  }
}

export default productReducer;