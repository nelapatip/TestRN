
// import all possible action types
import { CLEAR_SCREEN, GET_PREFERENCE, GET_PREFERENCE_FULFILLED, GET_PREFERENCE_REJECTED} from '../actions/PreferenceActions'

// define initial state
const INITIAL_STATE = {
    preferences: [],
    loading: false,
    errorMessage: null
};

const preferencesReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case GET_PREFERENCE:
            {
                return { ...state, loading: true, errorMessage: null }
            }
        case GET_PREFERENCE_FULFILLED:
            {
                return { ...state, loading: false, preferences: action.payload, errorMessage: null }
            }
        case GET_PREFERENCE_REJECTED:
            {
                return { ...state, ...INITIAL_STATE, loading: false, errorMessage: action.payload }
            }        
        case CLEAR_SCREEN:
            {
                return { ...INITIAL_STATE }
            }

        default:
            return state
    }
};


export default preferencesReducer;