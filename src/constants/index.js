const appUrl =  '';
// const apiUrl = process.env.REACT_APP_API_URL || '';
const apiUrl = 'https://api.mandogames.com';
export const configuration = {
    BASE_URL : 'live',
    APP_URL : appUrl,
};

export const productType = {
    PLAYER_AUTHENTICATE_SUCCESS : 'PLAYER/PLAYER_AUTHENTICATE_SUCCESS',
    PLAYER_AUTHENTICATE_FAILURE : 'PLAYER/PLAYER_AUTHENTICATE_FAILURE',
    GET_PRODUCT_LIST_SUCCESS : 'PRODUCTS/GET_PRODUCT_LIST_SUCCESS',
    GET_PRODUCT_LIST_FAILURE : 'PRODUCTS/GET_PRODUCT_LIST_FAILURE',
    CART_SUBMIT_SUCCESS : 'CART/CART_SUBMIT_SUCCESS',
    CART_SUBMIT_FAILURE : 'CART/CART_SUBMIT_FAILURE',
    UPDATE_BALANCE : 'CART/UPDATE_BALANCE',
    CUSTOMER_SETTINGS: 'CUSTOMER/SETTINGS',
    RECENT_RESULTS: 'PRODUCTS/RECENT_REUSLTS'
}

export const apiEndPoints = {
    ROUND_URL : `${apiUrl}/rounds/GetRoundsByDomain`,
    AUTHENTICATE_URL : `${apiUrl}/players/AuthenticatePlayer`,
    BALANCE_URL : `${apiUrl}/players/GetPlayerBalance`,
    SETTINGS_URL : `${apiUrl}/customers/GetSettings`,
    UPDATE_HUB_URL : `${apiUrl}/updateHub`,
    BETS_URL : `${apiUrl}/bets`,
    RECENT_RESULTS: `${apiUrl}/rounds/LatestRounds`
}