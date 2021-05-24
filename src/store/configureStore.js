// redux specific imports
import { Provider, connect } from 'react-redux';
import { applyMiddleware, createStore, compose } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from '../reducers/RootReducer'

// out default store
export const store = createStore(rootReducer, applyMiddleware(thunk));
