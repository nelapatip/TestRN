import UserPreferencesModel from '../models/UserPreferencesModel'
import CortellisService from '../utils/Networking/CortellisService'
import { CONSTANTS } from '../constants/Constants'


// defines action types
export const GET_PREFERENCE = 'GET_PREFERENCE';
export const GET_PREFERENCE_FULFILLED = 'GET_PREFERENCE_FULFILLED';
export const GET_PREFERENCE_REJECTED = 'GET_PREFERENCE_REJECTED';
export const GET_MDCOUNTRIES_FULFILLED = 'GET_MDCOUNTRIES_FULFILLED';
export const GET_DBCOUNTRIES_FULFILLED = 'GET_DBCOUNTRIES_FULFILLED';
export const CLEAR_SCREEN = 'CLEAR_SCREEN';


export const updatePreferencesOnUserSelection = (section, value) => {
  return (dispatch, getState) => {
    let preferenceModel = getState().preferencesData.preferences
    preferenceModel.data.updatePreferencesOnUserSelection(section, value)
    dispatch(getUserPreferencesFulfilled(preferenceModel.data))
  }
}

export const setUserPreferencesInGlobalState = (json) => {
  return dispatch => {
    let userPreference = new UserPreferencesModel(json.filter, true)
    dispatch(getUserPreferencesFulfilled(userPreference))
  }
}


/* Get All preferences  */

export const fetchAllPreferences = (token) => {
  const authToken = token
  console.log(authToken)
  return dispatch => {
    dispatch(getUserPreferencesStarted());
    CortellisService.getUserPreferences(authToken, CONSTANTS.API.GET_PREFERENCES).then(
      (response) => {
        console.log('Received response: ' + JSON.stringify(response))
        let localResponse = new UserPreferencesModel(response.regulatoryResultsOutput.Filters, false)
        // localObj = localResponse.filter.find((o => o.title === 'Product Category'))
        dispatch(getUserPreferencesFulfilled(localResponse))
        // if(localObj.member.length === 2){
        //   Promise.all([
        //     CortellisService.getUserPreferences(authToken,CONSTANTS.API.GET_MD_COUNTRIES),
        //     CortellisService.getUserPreferences(authToken,CONSTANTS.API.GET_DB_COUNTRIES)
        // ]).then(([response1, response2]) => {
        //   dispatch(getMDCountriesPreferencesFulfilled(response1.regulatoryRegionOutput.Regions));
        //   dispatch(getDBCountriesPreferencesFulfilled(response2.regulatoryRegionOutput.Regions));
        //   dispatch(getUserPreferencesFulfilled(localResponse.getInitialOptionsForDisplay()))
        // }).catch((err) => {
        //   dispatch(getUserPreferencesRejected(err));
        // });
        // }else{
        //   dispatch(getUserPreferencesFulfilled(localResponse.filter))
        // }
      }
    )
      .catch((error) => {
        console.log('Received error: ' + error)
        //alert('Something went wrong.')
        dispatch(getUserPreferencesRejected(error));
      });
  }
}



/* Get user preferences action method */
const getUserPreferencesStarted = () => (
  {
    type: GET_PREFERENCE
  }
);

const getUserPreferencesFulfilled = (data) => (
  {
    type: GET_PREFERENCE_FULFILLED,
    payload: { data }
  }
);

const getMDCountriesPreferencesFulfilled = (data) => (
  {
    type: GET_MDCOUNTRIES_FULFILLED,
    payload: { data }
  }
);

const getDBCountriesPreferencesFulfilled = (data) => (
  {
    type: GET_DBCOUNTRIES_FULFILLED,
    payload: { data }
  }
);

const getUserPreferencesRejected = (error) => (
  {
    type: GET_PREFERENCE_REJECTED,
    payload: { error }
  }
);

export const clearUserPrefs = () => (
  {
    type: CLEAR_SCREEN,
  }
);

