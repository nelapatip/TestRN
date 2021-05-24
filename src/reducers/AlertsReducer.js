
// import all possible action types

import { GET_ALERTS, GET_ALERTS_FULFILLED, GET_ALERTS_REJECTED, EDIT_ALERT, EDIT_ALERT_FULFILLED, EDIT_ALERT_REJECTED, CREATE_ALERT, CREATE_ALERT_FULFILLED, CREATE_ALERT_REJECTED, DELETE_ALERT, DELETE_ALERT_FULFILLED, DELETE_ALERT_REJECTED, ADD_DOC_TO_FAVOURITE, ADD_DOC_TO_FAVOURITE_FULFILLED, ADD_DOC_TO_FAVOURITE_REJECTED } from '../actions/AlertActions'

// define initial state
const INITIAL_STATE = {
    alerts: [],
    addToFavouriteData: "",
    loading: true,
    errorMessage: null,
    success: false,
    deleteAlertRes: null
};

const alertReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case GET_ALERTS:
            {
                return { ...state, loading: true }
            }
        case GET_ALERTS_FULFILLED:
            {
                return { ...state, loading: false, alerts: action.payload }
            }
        case GET_ALERTS_REJECTED:
            {
                return { ...state, loading: false, errorMessage: action.payload }
            }
        case CREATE_ALERT:
            {
                return { ...state, ...INITIAL_STATE, loading: true }
            }
        case CREATE_ALERT_FULFILLED:
            {
                return { ...state, ...INITIAL_STATE, loading: false, success: action.payload }
            }
        case CREATE_ALERT_REJECTED:
            {
                return { ...state, ...INITIAL_STATE, loading: false, errorMessage: action.payload }
            }
        case EDIT_ALERT:
            {
                return { ...state, ...INITIAL_STATE, loading: true }
            }
        case EDIT_ALERT_FULFILLED:
            {
                return { ...state, ...INITIAL_STATE, loading: false, success: action.payload }
            }
        case EDIT_ALERT_REJECTED:
            {
                return { ...state, ...INITIAL_STATE, loading: false, errorMessage: action.payload }
            }
        case DELETE_ALERT:
            {
                return { ...state, loading: true }
            }
        case DELETE_ALERT_FULFILLED:
            {
                return { ...state, loading: false, errorMessage: null, deleteAlertRes:true }
            }
        case DELETE_ALERT_REJECTED:
            {
                return { ...state, loading: false, errorMessage: action.payload, deleteAlertRes:false }
            }
        case ADD_DOC_TO_FAVOURITE:
            {
                return { ...state, loading: true }
            }
        case ADD_DOC_TO_FAVOURITE_FULFILLED:
            {
                return { ...state, loading: false, addToFavouriteData: action.payload }
            }
        case ADD_DOC_TO_FAVOURITE_REJECTED:
            {
                return { ...state, loading: false, errorMessage: action.payload }
            }
        case 'RESET':
            {
                return { ...state, deleteAlertRes: null}
            }    
        default:
            return state
    }
};


export default alertReducer;