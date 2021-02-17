import { Axios } from '../../api/axios';

export const SET_LOADING = 'SET_LOADING';
export const GET_NOTIFICATIONS = 'GET_NOTIFICATIONS';
export const GET_NOTIFICATIONS_TYPES = 'GET_NOTIFICATIONS_TYPES';
export const RESET = '[NOTIFICATION] RESET';
export const RESET_FORM = '[NOTIFICATION] RESET_FORM';
export const GET_ACCESS_TOKEN = '[NOTIFICATION] GET_ACCESS_TOKEN';
export const UPDATE_FORM = '[NOTIFICATION] UPDATE_FORM';

const signInUrl = '/accounts/amazon-cognito/login/';

export function reset() {
  return {
    type: RESET,
  };
}

export function updateForm(payload) {
  return {
    type: UPDATE_FORM,
    payload,
  };
}

export function resetForm() {
  return {
    type: RESET_FORM,
  };
}

export function setLoading(payload) {
  return {
    type: SET_LOADING,
    payload,
  };
}

export function fetch(email, access_token) {
  return (dispatch) =>
    Axios.get(`/notifications/of_user/${email}`, {
      params: { access_token },
    })
      .then((res) => {
        dispatch({ type: GET_NOTIFICATIONS, payload: res });
      })
      .catch((error) => {
        if (error.response.status === 400) {
          window.location.href = signInUrl;
        }
        dispatch({ type: GET_NOTIFICATIONS, payload: null });
        dispatch(setLoading(false));
      });
}

export function create(payload, userInfo) {
  return (dispatch) =>
    Axios.post('/notifications/add', payload)
      .then((res) => {
        dispatch(fetch(userInfo.email, userInfo.access_token));
      })
      .catch((error) => {
        if (error.response.status === 400) {
          window.location.href = signInUrl;
        }
        console.log(error);
      });
}

export function remove(id, userInfo) {
  return (dispatch) =>
    Axios.post(`/notifications/remove/${id}`, {
      access_token: userInfo.access_token,
    })
      .then((res) => {
        dispatch(fetch(userInfo.email, userInfo.access_token));
      })
      .catch((error) => {
        if (error.response.status === 400) {
          window.location.href = signInUrl;
        }
        console.log(error);
      });
}

export function getNotificationTypes() {
  return (dispatch) =>
    Axios.get('/notification_types')
      .then((res) => {
        dispatch({ type: GET_NOTIFICATIONS_TYPES, payload: res });
      })
      .catch((error) => {
        console.log(error);
      });
}

export function getAccessToken(type = null) {
  return (dispatch) =>
    Axios.get('/user/access-token')
      .then((res) => {
        if (type === 'notifications') {
          if (!res.is_authenticated) {
            window.location.href = signInUrl;
            return;
          }
        }

        dispatch({
          type: GET_ACCESS_TOKEN,
          payload: res,
        });
      })
      .catch((error) => {
        if (error.response.status === 400 && type === 'notifications') {
          window.location.href = signInUrl;
          return;
        }
        dispatch({
          type: GET_ACCESS_TOKEN,
          payload: {},
        });
      });
}
