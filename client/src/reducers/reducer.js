const initialState = {
  items: [],
  notifications: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'INIT_URLS':
    {
      return Object.assign({}, state, {
        notifications: [
          ...state.notifications,
        ],
        items: action.items,
      });
    }
    case 'ADD_URL':
    {
      return Object.assign({}, state, {
        items: [
          ...state.items, action.item,
        ],
      });
    }
    case 'ADD_NOTIFICATION':
    {
      return Object.assign({}, state, {
        notifications: [
          ...state.notifications, action.item,
        ],
      });
    }
    case 'REMOVE_NOTIFICATION':
    {
      return Object.assign({}, state, {
        notifications: state.notifications.filter(item => item !== action.item),
      });
    }
    default:
      return state;
  }
};

export default reducer;
