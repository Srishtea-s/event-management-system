// LOADING STATES MANAGEMENT (B1 Role)
export const LoadingType = {
  DEFAULT: 'default',
  FORM_SUBMIT: 'form_submit',
  DATA_FETCH: 'data_fetch',
  PROFILE_UPDATE: 'profile_update',
  EVENT_CREATE: 'event_create',
  EVENT_DELETE: 'event_delete',
  REGISTRATION: 'registration'
};

export const loadingMessages = {
  [LoadingType.DEFAULT]: 'Loading...',
  [LoadingType.FORM_SUBMIT]: 'Submitting form...',
  [LoadingType.DATA_FETCH]: 'Fetching data...',
  [LoadingType.PROFILE_UPDATE]: 'Updating profile...',
  [LoadingType.EVENT_CREATE]: 'Creating event...',
  [LoadingType.EVENT_DELETE]: 'Deleting event...',
  [LoadingType.REGISTRATION]: 'Processing registration...'
};

export const getLoadingMessage = (type = LoadingType.DEFAULT) => {
  return loadingMessages[type] || loadingMessages[LoadingType.DEFAULT];
};

export const simulateDelay = (ms = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
