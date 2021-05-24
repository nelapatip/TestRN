import { combineReducers } from 'redux';
import AlertsReducer from './AlertsReducer'
import AuthenticationReducer from './LoginReducer'
import PreferencesReducer from './PreferencesReducer'
import FavouritesReducer from './FavouritesReducer'
import DocumentsReducer from './DocumentReducer'

//offline reducer
import followingUsersReducer from './OfflineReducer'


// all other reducers should be combined in this root reducer
const appReducer =  combineReducers({
    documentsData: DocumentsReducer,
    favouritesData: FavouritesReducer,
    alertsData: AlertsReducer,
    loginData: AuthenticationReducer,
    preferencesData: PreferencesReducer,
    offlineReducer: followingUsersReducer
})

const rootReducer = (state, action) => {
    if (action.type === 'USER_LOGOUT') {
        state = undefined
      }
    return appReducer(state, action)
  }

export default rootReducer  