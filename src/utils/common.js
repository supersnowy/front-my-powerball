export const defaultProductList = (products) => {  
  products.isSelected = false;
  let markets = products.markets;
  for (let j = 0; j < markets.length; j++) {
    let selection = markets[j].bets;
    for (let k = 0; k < selection.length; k++) {
      selection[k].isChecked = false;
    }
  }
  let productList = products;
  return productList;
}