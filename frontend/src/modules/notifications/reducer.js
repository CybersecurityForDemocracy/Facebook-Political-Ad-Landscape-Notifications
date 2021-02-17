import * as Actions from './actions';

const initialState = {
  loading: false,
  notifications: [],
  form: {
    email: null,
    page_id: null,
    topic: null,
    region: null,
    count: null,
    type_id: '',
    time_window: null,
    fire_frequency: null,
    race: null,
  },
  notificationTypes: [],
  topics: [],
  userInfo: {},
};

function notifications(state = initialState, action) {
  switch (action.type) {
    case Actions.RESET: {
      return {
        ...state,
        loading: false,
        notifications: [],
        form: {
          email: null,
          page_id: null,
          topic: null,
          region: null,
          count: null,
          type_id: '',
          time_window: null,
          fire_frequency: null,
        },
        topics: [],
      };
    }
    case Actions.SET_LOADING: {
      return {
        ...state,
        loading: action.payload,
      };
    }
    case Actions.GET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload ? action.payload.notifications : [],
        loading: false,
      };
    case Actions.GET_NOTIFICATIONS_TYPES:
      return {
        ...state,
        notificationTypes: action.payload.notification_types,
        topics: action.payload.topics,
      };
    case Actions.RESET_FORM: {
      return {
        ...state,
        form: {
          email: null,
          page_id: null,
          topic: null,
          region: null,
          count: null,
          type_id: '',
          time_window: null,
          fire_frequency: null,
          race: null,
        },
      };
    }
    case Actions.GET_ACCESS_TOKEN: {
      return {
        ...state,
        userInfo: action.payload,
      };
    }
    case Actions.UPDATE_FORM: {
      return {
        ...state,
        form: action.payload,
      };
    }
    default:
      return state;
  }
}

export default notifications;
