import AlertModel from '../models/AlertModel'
import CreateAlertDataModel from '../models/CreateAlertDataModel'

import { CONSTANTS } from '../constants/Constants'
import CortellisService from '../utils/Networking/CortellisService'
import { Database } from '../utils/DatabaseHelper'
import { getCurrentDate } from '../utils/Date'
import  AsyncStorage  from "@react-native-community/async-storage";
// defines action types
export const GET_ALERTS = 'GET_ALERTS';
export const GET_ALERTS_FULFILLED = 'GET_ALERTS_FULFILLED';
export const GET_ALERTS_REJECTED = 'GET_ALERTS_REJECTED';


export const CREATE_ALERT = 'CREATE_ALERT';
export const CREATE_ALERT_FULFILLED = 'CREATE_ALERT_FULFILLED';
export const CREATE_ALERT_REJECTED = 'CREATE_ALERT_REJECTED';


export const EDIT_ALERT = 'EDIT_ALERT';
export const EDIT_ALERT_FULFILLED = 'EDIT_ALERT_FULFILLED';
export const EDIT_ALERT_REJECTED = 'EDIT_ALERT_REJECTED';

export const DELETE_ALERT = 'DELETE_ALERT';
export const DELETE_ALERT_FULFILLED = 'DELETE_ALERT_FULFILLED';
export const DELETE_ALERT_REJECTED = 'DELETE_ALERT_REJECTED';

export const ADD_DOC_TO_FAVOURITE = 'ADD_DOC_TO_FAVOURITE';
export const ADD_DOC_TO_FAVOURITE_FULFILLED = 'ADD_DOC_TO_FAVOURITE_FULFILLED';
export const ADD_DOC_TO_FAVOURITE_REJECTED = 'ADD_DOC_TO_FAVOURITE_REJECTED';

export const fetchAlerts = (token, USER_ID, pullToRefreshFlag) => {

  pullToRefreshFlag = typeof pullToRefreshFlag == 'undefined' ? false : pullToRefreshFlag
  const authToken = token

  return (dispatch, getState) => {
    //find out the connected state
    let isConnected = getState().offlineReducer.isConnected
    //if true call api
    if (isConnected) {
      //first check if alert table is already populated??
      //if it is call the api the with date param to check for updates
      if (!pullToRefreshFlag) {
        dispatch(createAlertStarted());
      }

      Database.checkAlertTableData(USER_ID).then(async (res) => {
        if (res) {
          //check for time stamp if available
          let lastUpdated = await getLastUpdatedTimestamp()
          if (lastUpdated !== null) {
            //User comes back after closing the application
            retrieveAlertAfterClosingApplication(authToken, lastUpdated, USER_ID).then((result) => {
              dispatch(getAlertsFulfilled(result));
            })

          } else {
            // User logged into again after logout 
            retrieveAlertAfterLogOut(authToken, USER_ID).then((result) => {
              dispatch(getAlertsFulfilled(result));
            })
          }

        } else {
          //first time user
          retrieveAlertFirstTime(authToken, USER_ID).then((result) => {
            dispatch(getAlertsFulfilled(result));
          })
        }
      })

    } else {
      //user offline get from db
      Database.getAlertItems(USER_ID).then((res) => {
        console.log("returned promise ", res)
        let localResponse = new AlertModel(res)
        dispatch(getAlertsFulfilled(localResponse));
      })
    }
  }
}


const callFetchAlertsWithTimeStamp = (authToken, timestamp) => {
  return new Promise((resolve, reject) => {
    //api with date param
    CortellisService.getUserPreferences(authToken, CONSTANTS.API.RETRIEVE_ALERT(true, timestamp)).then(
      (response) => {
        resolve(response)
      }
    ).catch((error) => {
      reject(error)
    });
  })
}


const callFetchAlerts = (authToken) => {
  return new Promise((resolve, reject) => {
    //api with date param
    CortellisService.getUserPreferences(authToken, CONSTANTS.API.RETRIEVE_ALERT(false, "")).then(
      (response) => {
        resolve(response)
      }
    ).catch((error) => {
      reject(error)
    });
  })
}

const fetchNotificationDetails = (authToken, uuid) => {
  return new Promise((resolve, reject) => {
    //api with date param
    CortellisService.getRequest(authToken, CONSTANTS.API.RETRIEVE_NOTIFICATION_DETAILS(uuid)).then(
      (response) => {
        resolve(response)
      }
    ).catch((error) => {
      reject(error)
    });
  })
}

export const updateAndFetchNotificationFromDB = (authToken, uuid, USER_ID) => {
  return new Promise((resolve ,reject) => { 
    fetchNotificationDetails(authToken, uuid).then((response) => {
      if (response.AlertOutput.Alerts !== null && response.AlertOutput.Alerts.length > 0) {
        let AlertID = response.AlertOutput.Alerts[0].alert_id
        Database.UpdateAlert(response.AlertOutput.Alerts, USER_ID).then(() => {
          Database.getAlertItemUsingAlertId(AlertID,USER_ID).then((res) => {
            let localResponse = new AlertModel(res)
            resolve(localResponse["alerts"][0])
          })
        }
        )
      }
    }).catch((err) => {
      reject(err)
    })
  })
}


const getLastUpdatedTimestamp = async () => {
  try {
    let lastUpdatedTimeStamp = await AsyncStorage.getItem('LastUpdatedDate')
    return lastUpdatedTimeStamp
  } catch{
    console.log("Error while fetchign the last updated timestamp from async storage.")
  }
}


const retrieveAlertAfterClosingApplication = (authToken, lastUpdated, USER_ID) => {
  return new Promise((resolve) => {

    callFetchAlertsWithTimeStamp(authToken, lastUpdated).then(
      (response) => {
        if (response.AlertOutput.Alerts !== null) {
          if (response.AlertOutput.Alerts.length > 0) {
            //TODO: write db update/insert query 
            Database.UpdateAlert(response.AlertOutput.Alerts, USER_ID).then(() => {
              Database.getAlertItems(USER_ID).then((res) => {
                console.log("returned promise ", res)
                let localResponse = new AlertModel(res)
                let date = (response.AlertOutput.timestamp !== null) ? response.AlertOutput.timestamp : lastUpdated
                AsyncStorage.setItem('LastUpdatedDate', date, (err, result) => {
                  console.log("error", err, "result", result);
                })
                resolve(localResponse)
              })
            }
            )
          } else {
            //got nothing from api get from db
            Database.getAlertItems(USER_ID).then((res) => {
              console.log("returned promise ", res)
              let localResponse = new AlertModel(res)
              resolve(localResponse)
            })
          }
        } else {
          //got nothing from api get from db
          Database.getAlertItems(USER_ID).then((res) => {
            console.log("returned promise ", res)
            let localResponse = new AlertModel(res)
            resolve(localResponse)
          })
        }
      }
    ).catch((error) => {
      console.log('Received error: ' + error)
      Database.getAlertItems(USER_ID).then((res) => {
        console.log("returned promise ", res)
        let localResponse = new AlertModel(res)
        resolve(localResponse)
      })
    });
  })
}


const retrieveAlertAfterLogOut = (authToken, USER_ID) => {
  return new Promise((resolve) => {

    let currentDate = getCurrentDate()

    callFetchAlerts(authToken).then((response) => {
      if (response.AlertOutput.Alerts !== null && response.AlertOutput.Alerts.length > 0) {
        let date = (response.AlertOutput.timestamp !== null) ? response.AlertOutput.timestamp : currentDate
        AsyncStorage.setItem('LastUpdatedDate', date, (err, result) => {
          console.log("error", err, "result", result);
        })
        Database.updateAlertOnLogout(response.AlertOutput.Alerts, USER_ID).then(() => {
          Database.getAlertItems(USER_ID).then((res) => {
            console.log("returned promise ", res)
            let localResponse = new AlertModel(res)
            resolve(localResponse)
            // dispatch(getAlertsFulfilled(localResponse));
          })
        }
        )
      } else {
        //got nothing from api get from db
        Database.getAlertItems(USER_ID).then((res) => {
          console.log("returned promise ", res)
          let localResponse = new AlertModel(res)
          resolve(localResponse)
        })
      }
    })
      .catch((error) => { //this catch is used to handle the failure of api w/o timestamp
        console.log('Received error: ' + error)
        Database.getAlertItems(USER_ID).then((res) => {
          console.log("returned promise ", res)
          let localResponse = new AlertModel(res)
          resolve(localResponse)
        })
      });
  });
}


const retrieveAlertFirstTime = (authToken, USER_ID) => {
  return new Promise((resolve) => {
    let currentDate = getCurrentDate()

    callFetchAlerts(authToken).then((response) => {
      if (response.AlertOutput.Alerts !== null && response.AlertOutput.Alerts.length > 0) {
        let date = (response.AlertOutput.timestamp !== null) ? response.AlertOutput.timestamp : currentDate
        AsyncStorage.setItem('LastUpdatedDate', date, (err, result) => {
          console.log("error", err, "result", result);
        })
        Database.insertAlert(response.AlertOutput.Alerts, USER_ID).then(() => {
          Database.getAlertItems(USER_ID).then((res) => {
            console.log("returned promise ", res)
            let localResponse = new AlertModel(res)
            resolve(localResponse)
          })
        }
        )
      }
      else {
        let localResponse = new AlertModel(response)
        resolve(localResponse)
      }
    })
      .catch((error) => { //this catch is used to handle the failure of api w/o timestamp for first time user login
        console.log('Received error: ' + error)
        Database.getAlertItems(USER_ID).then((res) => {
          console.log("returned promise ", res)
          let localResponse = new AlertModel(res)
          resolve(localResponse)
        })
      });
  })
}


export const createAlert = (authToken, appendedString) => {
  return dispatch => {
    //Dispatch the fetchData action creator before retrieving to set our loading state to true.
    dispatch(createAlertStarted());
    CortellisService.postRequest(authToken, CONSTANTS.API.CREATE_ALERT_URL(appendedString), null).then(
      (response) => {
        //alert(JSON.stringify(response))
        console.log('Received response: ' + JSON.stringify(response))
        let localResponse = new CreateAlertDataModel(response.data)

        dispatch(createAlertFulfilled(localResponse));
      }).catch((error) => {
        console.log('Received error: ' + error)
        dispatch(createAlertRejected(CONSTANTS.API.TimeoutMessage));
      });
  }
}

export const editAlert = (authToken, appendedString, alertId, updatedAlertName, USER_ID) => {
  return (dispatch, getState) => {
    let isConnected = getState().offlineReducer.isConnected
    //if true call api
    if (isConnected) {
      Database.checkAlertTableData(USER_ID).then((res) => {
        if (res) {
          //Dispatch the fetchData action creator before retrieving to set our loading state to true.
          dispatch(editAlertStarted());
          CortellisService.postRequest(authToken, CONSTANTS.API.UPDATE_ALERT_URL(appendedString), null).then(
            (response) => {
              console.log('Received response: ' + JSON.stringify(response))
              let localResponse = new CreateAlertDataModel(response.data)
              if (localResponse.status == 'success') {
                Database.updateAlertDB(alertId, updatedAlertName, USER_ID).then((res) => {
                  if (res) {
                    dispatch(editAlertFulfilled(localResponse));
                  }
                })
              }
              else {
                dispatch(editAlertFulfilled(localResponse));
              }
            }).catch((error) => {
              console.log('Received error: ' + error)
              dispatch(editAlertRejected(CONSTANTS.API.TimeoutMessage));
            });
        }
      })
    } else {
      //user offline get from db
    }
  }
}

export const deleteAlert = (token, alertID, USER_ID) => {
  const authToken = token
  return (dispatch, getState) => {
    let isConnected = getState().offlineReducer.isConnected
    if (isConnected) {
      dispatch(deleteAlertStarted())
      let url = CONSTANTS.API.DELETE_ALERT_URL + '?alertId=' + alertID.toString()
      CortellisService.deleteAlert(authToken, url).then(
        (response) => {
          let localResponse = response.data
          console.log(localResponse.status)
          if (localResponse.status == 'success') {
            dispatch(deleteAlertFulfilled())
            dispatch(deleteAlertsFromDB(alertID, USER_ID))
          }
        }
      ).catch((error) => {
        console.log('Received error: ' + error)
        dispatch(deleteAlertRejected(error))
      });
    } else {
      alert("No Internet Connection Available.")
    }
  }
}


export const addDocToFavourites = (token, targetDocuments, USER_ID, updateOrInsertFlag) => {
  const authToken = token
  updateOrInsertFlag = typeof updateOrInsertFlag == 'undefined' ? false : updateOrInsertFlag;
  console.log(authToken)
  return new Promise((resolve, reject) => {

    var documentIDs = []
    var uniqueTargetDocuments = []
    targetDocuments.map(document => {
      let documentId = document.idrac
      if (!documentIDs.includes(documentId)) {
        documentIDs.push(documentId)
        uniqueTargetDocuments.push(document)
      }
    })

    let params = {
      data: {
        userId: USER_ID,
        documentIds: documentIDs,
        createdDate: getCurrentDate()
      }
    }
    CortellisService.postRequest(authToken, CONSTANTS.API.ADD_FAVOURITES, params).then(
      (response) => {
        let localResponse = new CreateAlertDataModel(response.data)
        if (localResponse.status === 'success') {
          if (updateOrInsertFlag) {
            Database.updateInsertCitedByDocuments(uniqueTargetDocuments, true, USER_ID).then(() => {
              resolve(localResponse)
            })
          } else {
            Database.updateDocuments(uniqueTargetDocuments, true, USER_ID).then(() => {
              resolve(localResponse)
            })
          }
        } else {
          resolve(localResponse);
        }
      }
    ).catch((error) => {
      console.log('Received error: ' + error)
      reject(error);
      //dispatch(deleteFavouritesRejected(error));
    });
  })
}

export const refreshAlertsFromDB = (USER_ID) => {
  return dispatch => {
    dispatch(createAlertStarted());
    Database.getAlertItems(USER_ID).then((res) => {
      console.log("returned promise from db", res)
      let localResponse = new AlertModel(res)
      dispatch(getAlertsFulfilled(localResponse));
    })
  }
}

export const deleteAlertsFromDB = (alertID, USER_ID) => {
  return (dispatch, getState) => {
    let alertData = getState().alertsData.alerts.data
    Database.deleteAlertDB(alertID, USER_ID).then((res) => {
      let allItems = [...alertData.alerts];
      let filteredItems = allItems.filter(item => !alertID.includes(item.alertId));
      let localResponse = new AlertModel(filteredItems)
      dispatch(getAlertsFulfilled(localResponse));
    })
  }
}


const getAlertsStarted = () => (
  {
    type: GET_ALERTS
  }
);

const getAlertsFulfilled = (data) => (
  {
    type: GET_ALERTS_FULFILLED,
    payload: { data }
  }
);

const getAlertsRejected = (error) => (
  {
    type: GET_ALERTS_REJECTED,
    payload: { error }
  }
);

const createAlertStarted = () => (
  {
    type: CREATE_ALERT
  }
);

const createAlertFulfilled = (data) => (
  {
    type: CREATE_ALERT_FULFILLED,
    payload: { data }
  }
);

const createAlertRejected = (error) => (
  {
    type: CREATE_ALERT_REJECTED,
    payload: { error }
  }
);


const editAlertStarted = () => (
  {
    type: EDIT_ALERT
  }
);

const editAlertFulfilled = (data) => (
  {
    type: EDIT_ALERT_FULFILLED,
    payload: { data }
  }
);

const editAlertRejected = (error) => (
  {
    type: EDIT_ALERT_REJECTED,
    payload: { error }
  }
);

const addDocToFavouritesStarted = () => (
  {
    type: ADD_DOC_TO_FAVOURITE
  }
);

const addDocToFavouritesFulfilled = (data) => (
  {
    type: ADD_DOC_TO_FAVOURITE_FULFILLED,
    payload: { data }
  }
);

const addDocToFavouritesRejected = (error) => (
  {
    type: ADD_DOC_TO_FAVOURITE_REJECTED,
    payload: { error }
  }
);


const deleteAlertStarted = () => (
  {
    type: DELETE_ALERT
  }
);

const deleteAlertFulfilled = () => (
  {
    type: DELETE_ALERT_FULFILLED,
  }
);

const deleteAlertRejected = (error) => (
  {
    type: DELETE_ALERT_REJECTED,
    payload: { error }
  }
);