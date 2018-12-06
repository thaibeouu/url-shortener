export const populateUrls = res => ({
  type: 'INIT_URLS',
  items: res,
});

export const addNotification = url => ({
  type: 'ADD_NOTIFICATION',
  item: url,
});

export const removeNotification = url => ({
  type: 'REMOVE_NOTIFICATION',
  item: url,
});

export const initUrls = () => (dispatch) => {
  setTimeout(() => {
    fetch('api')
      .then(response => response.json())
      .then((json) => {
        dispatch(populateUrls(json));
      });
  }, 500);
};

export const addNewUrl = item => (dispatch) => {
  fetch('api/new', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: item,
    }),
  })
    .then(() => {
      dispatch(initUrls());
    })
    .catch(error => console.log(error));
};
