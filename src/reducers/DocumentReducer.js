// import all possible action types
import {
    MARK_UNMARK_FAVORITE, MARK_UNMARK_FAVORITE_FULFILLED, MARK_UNMARK_FAVORITE_REJECTED,
    GET_CITED_DOCUMENTS, GET_CITED_DOCUMENTS_FULFILLED, GET_CITED_DOCUMENTS_REJECTED,
    GET_CITED_BY, GET_CITED_BY_FULFILLED, GET_CITED_BY_REJECTED,
} from '../actions/DocumentActions'

// define initial state
const INITIAL_STATE = {
    citedDocuments: '',
    citedBy: '',
    loading: true,
    errorMessage: null,
    successData: '',
    comments: [],
    favorite: [],
    documentObject: null
};

const documentReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case MARK_UNMARK_FAVORITE:
            {
                return { ...state, loading: true }
            }
        case MARK_UNMARK_FAVORITE_FULFILLED:
            {
                return { ...state, loading: false, successData: action.payload }
            }
        case MARK_UNMARK_FAVORITE_REJECTED:
            {
                return { ...state, loading: false, errorMessage: action.payload }
            }


        case GET_CITED_DOCUMENTS:
            {
                return { ...state, loading: true }
            }
        case GET_CITED_DOCUMENTS_FULFILLED:
            {
                return { ...state, loading: false, citedDocuments: action.payload }
            }
        case GET_CITED_DOCUMENTS_REJECTED:
            {
                return { ...state, loading: false, errorMessage: action.payload }
            }


        case GET_CITED_BY:
            {
                return { ...state, loading: true }
            }
        case GET_CITED_BY_FULFILLED:
            {
                return { ...state, loading: false, citedBy: action.payload }
            }
        case GET_CITED_BY_REJECTED:
            {
                return { ...state, loading: false, errorMessage: action.payload }
            }

        case 'GET_DOCUMENT_FULFILLED':
            {
                return { ...state, loading: false, documentObject: action.payload}
            }
        default:
            return state
    }
};


export default documentReducer;