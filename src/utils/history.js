import { createBrowserHistory } from 'history';
import { configuration } from '../constants';
const { APP_URL } = configuration;
//create browser history
export const history = createBrowserHistory({
  basename: APP_URL,
});