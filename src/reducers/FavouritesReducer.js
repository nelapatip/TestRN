// import all possible action types
import { GET_FAVOURITES, GET_FAVOURITES_FULFILLED, GET_FAVOURITES_REJECTED, DELETE_FAVOURITES, DELETE_FAVOURITES_FULFILLED, DELETE_FAVOURITES_REJECTED } from '../actions/FavouriteActions'

// define initial state
const INITIAL_STATE = {
    favouriteDocuments: [],
    deleteData: null,
    loading: true,
    errorMessage: null,
    success: false
};

const favouriteReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case GET_FAVOURITES:
            {
                return { ...state, loading: true, deleteData: null }
            }
        case GET_FAVOURITES_FULFILLED:
            {
                return { ...state, loading: false, favouriteDocuments: action.payload }
            }
        case GET_FAVOURITES_REJECTED:
            {
                return { ...state, loading: false, errorMessage: action.payload }
            }
        case DELETE_FAVOURITES:
            {
                return { ...state, loading: true }
            }
        case DELETE_FAVOURITES_FULFILLED:
            {
                return { ...state, deleteData: action.payload }
            }
        case DELETE_FAVOURITES_REJECTED:
            {
                return { ...state, loading: false, deleteData: action.payload }
            }
        case 'RESET_FAV':
            {
                return { ...state, loading: false, deleteData: null }
            }
        default:
            return state
    }
};


export default favouriteReducer;