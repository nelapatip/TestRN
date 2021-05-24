// import all possible action types
//mport { SET_LOGIN_PENDING, SET_LOGIN_SUCCESS, SET_LOGIN_ERROR } from '../actions/LoginActions'

// define initial state
const INITIAL_STATE = {
    token: {},
    loading: true,
    error: null,
    userObject: null
};

const loginReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'GET_TOKEN':
            return { ...state, token: action.token };
        case 'SAVE_TOKEN':
            return { ...state, token: action.token };
        case 'REMOVE_TOKEN':
            return { ...state, token: action.token };
        case 'LOADING':
            return { ...state, loading: action.isLoading };
        case 'ERROR':
            return { ...state, error: action.error };
        case 'SAVE_USER':
            return { ...state, userObject: action.data };
        case 'GET_USER':
            return { ...state, userObject: action.data };
        default:
            return state;
    }
}

export default loginReducer;

