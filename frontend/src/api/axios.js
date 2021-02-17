import axios from 'axios';
import { setupCache } from 'axios-cache-adapter';
import Cookies from 'js-cookie';

// Create `axios-cache-adapter` instance
const cache = setupCache({
  maxAge: 24 * 60 * 60 * 1000,
});

const baseURL = '/api/v1';

const Axios = axios.create({
  baseURL,
  timeout: 80000,
  adapter: cache.adapter,
  headers: {
    'X-CSRFToken': Cookies.get('csrftoken'),
  },
});

Axios.interceptors.request.use(
  async (config) => {
    // set token from localStorage.
    // const tokenHeader = token;
    // config.headers.Authorization = tokenHeader;
    // config.headers.Cache-Control =

    return config;
  },
  (error) => Promise.reject(error),
);

Axios.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error && error.response && error.response.status === 401) {
      console.error('ERR', error);
      // handle status
    }
    return Promise.reject(error);
  },
);

export { Axios };
