import { productType, apiEndPoints } from "../constants";
import { loading, resetState } from "./app";

//get cart submit case for success & failure
export const playerAuthenticateSuccess = (value) => ({
  type: productType.PLAYER_AUTHENTICATE_SUCCESS,
  payload: value
});

export const playerAuthenticateFailure = (value) => ({
  type: productType.PLAYER_AUTHENTICATE_FAILURE,
  payload: value
});

//get product list cases for success & failure
export const getProductListSuccess = (value) => ({
  type: productType.GET_PRODUCT_LIST_SUCCESS,
  payload: JSON.stringify(value)
});

export const getProductListFailure = () => ({
  type: productType.GET_PRODUCT_LIST_FAILURE
});

//get cart submit case for success & failure
export const cartSubmitSuccess = (value) => ({
  type: productType.CART_SUBMIT_SUCCESS,
  payload: value
});

export const cartSubmitFailure = (value) => ({
  type: productType.CART_SUBMIT_FAILURE,
  payload: value
});

export const updateBalance = (value) => ({
  type: productType.UPDATE_BALANCE,
  payload: value
});

export const customerSettingsSuccess = (value) => ({
  type: productType.CUSTOMER_SETTINGS,
  payload: value
});

export const updateRecentResults = (value) => ({
  type: productType.RECENT_RESULTS,
  payload: value
});

export const customerSettings = ({ CustomerId }) => {
  return (dispatch) => {
    //console.log("fetch settings for customerId "+ CustomerId)
    dispatch(loading(true));
    //const productURL = `${apiEndPoints.SETTINGS_URL}?customerId=${CustomerId}`;
    // eslint-disable-next-line no-template-curly-in-string
    const productURL = `${apiEndPoints.SETTINGS_URL}?customerId=${CustomerId}`

    fetch(productURL)
      .then(response => { return response.json() })
      .then(response => {
        console.log("customerSettings response", response);
        if (response.settings.CssFile) {
          dispatch(customerSettingsSuccess(response));
        } else {
          return; //TODO:show message 
        }
        setTimeout(() => {
          dispatch(resetState());
        }, 3500);
      })
      .catch((error) => {
        console.log("customer settings error", error);
        dispatch(playerAuthenticateFailure("app.user-denied"));
        setTimeout(() => {
          dispatch(resetState());
        }, 3500);
      });
  }

}

export const updatePlayerBalance = ({ UserToken, CustomerId }) => {
  return async (dispatch) => {
    const balanceURL = `${apiEndPoints.BALANCE_URL}`;
    fetch(balanceURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ UserToken, CustomerId })
    })
      .then(response => {
        if (response.ok && response.status === 200) {
          return response.json()
        }
      })
      .then(response => {
        //console.log("balance response", response);
        dispatch(updateBalance(response.balance));
      })
      .catch((error) => {
        console.log("error", error);
      });
  }
}


export const playerAuthenticate = ({ UserToken, CustomerId }) => {
  return async (dispatch) => {
    if (UserToken !== undefined && UserToken.length > 0) {
      const authenticateURL = `${apiEndPoints.AUTHENTICATE_URL}`;
      fetch(authenticateURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ UserToken, CustomerId })
      })
        .then(response => response.json())
        .then(response => {
          //console.log("response", response);
          if (response.error && response.error.length > 0) {
            response.error = "app.user-denied";
            dispatch(playerAuthenticateFailure(response));
          } else {
            dispatch(playerAuthenticateSuccess(response));
          }
          setTimeout(() => {
            dispatch(resetState());
          }, 3500);
        })
        .catch((error) => {
          console.log("error", error);
          dispatch(playerAuthenticateFailure("app.user-denied"));
          setTimeout(() => {
            dispatch(resetState());
          }, 3500);
        });
    }
    else {
      setTimeout(() => {
        dispatch(resetState());
      }, 3500);
    }
  }
}

export const getProductList = ({ UserToken, CustomerId }) => {
  return async (dispatch) => {
    dispatch(loading(true));
    fetch(apiEndPoints.ROUND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ UserToken, CustomerId })
    })
      .then(response => response.json())
      .then(response => {
        dispatch(getProductListSuccess(response));
        dispatch(loading(false));
      })
      .catch((error) => {
        dispatch(getProductListFailure());
        dispatch(loading(false));
        console.log("error", error);
      });
  }
}

export const loadLastResults = ({ UserToken, CustomerId }) => {
  return async (dispatch) => {
    var count = 10

    fetch(apiEndPoints.RECENT_RESULTS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ UserToken, CustomerId, count })
    })
      .then((response) => response.json())
      .then(data => {
        dispatch(updateRecentResults(data))
        //this.setState({ recentResults: data })
      })
      .catch(err => {
        console.log("An error occurred while trying to get recent results", err);
      })
  }
}

export const sendCartToServer = (cart, userToken) => {
  return async (dispatch) => {
    dispatch(loading(true));
    if (cart.length === 0) {
      dispatch(cartSubmitFailure("Error : No games selected."));
      setTimeout(() => {
        dispatch(resetState());
        dispatch(loading(false));
      }, 3500);
    } else {
      if (userToken && userToken.length > 0) {
        const betsURL = `${apiEndPoints.BETS_URL}?token=${userToken}`;
        fetch(betsURL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cart)
        })
          .then(response => response.text())
          .then(response => {
            //console.log("response", response);
            if (response === "") {
              dispatch(cartSubmitSuccess("app.cart-sent"));


            }
            else {
              dispatch(cartSubmitFailure("app.transaction-" + response));
              setTimeout(() => {
                dispatch(resetState());
                dispatch(loading(false));
              }, 3500);
            }

          })
          .catch((error) => {
            console.log("error", error);
            dispatch(cartSubmitFailure("app.cart-bet-error"));
            setTimeout(() => {
              dispatch(resetState());
              dispatch(loading(false));
            }, 3500);
          });
      } else {
        dispatch(cartSubmitFailure("app.missing-token"));
        setTimeout(() => {
          dispatch(resetState());
          dispatch(loading(false));
        }, 3500);
      }
    }
  }
}