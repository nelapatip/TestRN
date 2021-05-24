// import all possible action types
//mport { SET_LOGIN_PENDING, SET_LOGIN_SUCCESS, SET_LOGIN_ERROR } from '../actions/LoginActions'

// define initial state
const INITIAL_STATE = {
    isConnected: true,
};
const followingUsersReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'CHANGE_CONNECTION_STATUS':
        return Object.assign({}, state, {
          isConnected: action.isConnected,
        });
        default:
            return state;
    }
}

export default followingUsersReducer;
