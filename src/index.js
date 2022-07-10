import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './App';
import store from './store';
import * as serviceWorker from './serviceWorker';
import { IntlProvider } from "react-intl";
import messages_en from "./translations/en.json";
// import messages_ko from "./translations/ko.json";
// import messages_pt from "./translations/pt.json";
// import messages_es from "./translations/es.json";


const messages = {
    'en': messages_en
};

// ,
//     'es': messages_es,
//     'pt': messages_pt,
//     'ko': messages_ko

const search = window.location.search;
const params = new URLSearchParams(search);
var lang = params.get('language');



if (lang === null){
    lang = "en";
}
else{
    lang = lang.substring(0, 2);
}
    

const main = (
    <Provider store={store}>
        <IntlProvider locale={lang} messages={messages[lang]}>
            <App />
        </IntlProvider>
    </Provider>
);


ReactDOM.render(main, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();