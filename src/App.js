import React, { Component } from 'react';
//import external libraries
import { Router, Switch, Route } from 'react-router';
//import custom component
import Home from './containers/Home';
//import custom utilities
import { history } from './utils/history';
import { configuration } from './constants';
//import assets
import './App.css';
import { apiEndPoints } from './constants';
import ThemeLoader from './components/ThemeLoader'

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      customerSettings: {
        settings: {
          CssFile: "gamble-city"
        }
      },
      isValid: true,
      lang: 'en'
    }

    window.scrollTo(0, 1);

    const params = this.convertToObject(window.location.search)
    const { token, customerId, language } = params
    const custId = Number(customerId)
    if (token === '' || custId <= 0) {
      this.setState({ isValid: false })
      return;
    }

    var lang = language;
    if (typeof lang ===  "undefined") {
      lang = "en";
    }
    else {
      lang = lang.substring(0, 2);
    }

    /*
          fetch(
                  ProductActions.playerAuthenticate({
                      UserToken: token,
                      Domain: customerId
                  })
              ).then(result => {
                  console.log("App.js result" + result)
                  const cssFile = result.settings ? result.settings.keyValue.CssFile : undefined
                  console.log("cssFile" + cssFile)
              })
    */

    const productURL = `${apiEndPoints.SETTINGS_URL}?customerId=${custId}`
    console.log(productURL);
    fetch(productURL)
      .then(response => { return response.json() })
      .then(response => {
        this.setState({ customerSettings: response, lang: lang })
      })
    //console.log("finished")
  }

  convertToObject = url => {
    const arr = url.slice(1).split(/&|=/)
    let params = {}

    for (let i = 0; i < arr.length; i += 2) {
      const key = arr[i],
        value = arr[i + 1]
      params[key] = value
    }
    return params
  }
  /*
   <Route exact path="/" component={Home} />            
            <Route path="/home" component={Home} />   
            */

  render() {
    const APP_URL = configuration.BASE_URL;

    const theme = (this.state.customerSettings.settings && this.state.customerSettings.settings.CssFile) ? <ThemeLoader language={this.state.lang} fileName={this.state.customerSettings.settings.CssFile} /> : <ThemeLoader language={this.state.lang} fileName='default' />

    if (this.state.isValid)
      return (
        <Router basename={APP_URL} history={history}>
          <div>
            {theme}

            <Switch>
              <Route exact path="/" render={(props) => <Home {...props} customerSettings={this.state.customerSettings.settings} />} />
              <Route exact path="/v2" render={(props) => <Home {...props} customerSettings={this.state.customerSettings.settings} />} />

            </Switch>
          </div>
        </Router>
      );
  }
}

export default App;
