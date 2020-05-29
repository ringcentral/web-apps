export const addHash = state => '#' + state;

export const removeHash = state => (state.substr(0, 1) === '#' ? state.substr(1) : state);
