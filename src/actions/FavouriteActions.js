import FavouriteModel from '../models/FavouriteModel'
import CortellisService from '../utils/Networking/CortellisService'
import { CONSTANTS } from '../constants/Constants'
import { Database } from '../utils/DatabaseHelper'
import FavAlertDataModel from '../models/FavouriteAlertModel'
import {Document} from '../models/FavouriteModel'
import AsyncStorage  from "@react-native-community/async-storage";
// defined action types
export const GET_FAVOURITES = 'GET_FAVOURITES';
export const GET_FAVOURITES_FULFILLED = 'GET_FAVOURITES_FULFILLED';
export const GET_FAVOURITES_REJECTED = 'GET_FAVOURITES_REJECTED';

export const DELETE_FAVOURITES = 'DELETE_FAVOURITES';
export const DELETE_FAVOURITES_FULFILLED = 'DELETE_FAVOURITES_FULFILLED';
export const DELETE_FAVOURITES_REJECTED = 'DELETE_FAVOURITES_REJECTED';

export const fetchFavourites = (token, USER_ID) => {
    const authToken = token

    return (dispatch, getState) => {
        //find out the connected state
        let isConnected = getState().offlineReducer.isConnected
        let lastUpdated = ''
        //if true call api
        if (isConnected) {
            AsyncStorage.getItem('LastUpdatedFavDate', (err, result) => {
                if (err) {
                } else {
                    if (result !== null) {
                        lastUpdated = result
                        //append date
                        console.log(CONSTANTS.API.GET_FAVOURITES_TIMESTAMP(lastUpdated))
                        // CortellisService.getRequest(authToken, CONSTANTS.API.GET_FAVOURITES_TIMESTAMP(lastUpdated)).then(
                        CortellisService.getRequest(authToken, CONSTANTS.API.GET_FAVOURITES).then(
                            (response) => {
                                if (response.DocumentOutput.documents !== null) {
                                    let date = (response.DocumentOutput.timestamp !== null) ? response.DocumentOutput.timestamp : lastUpdated
                                    AsyncStorage.setItem('LastUpdatedFavDate', date)
                                    var documentIds = response.DocumentOutput.documents.map(document => {
                                        return document.idrac;
                                    });
                                    Database.updateFavourites(response.DocumentOutput.documents, USER_ID).then((result) => {
                                        Database.retrieveFavourites(USER_ID).then((res) => {
                                            let localResponse = new FavouriteModel(res)
                                            dispatch(getFavouritesFulfilled(localResponse.favouriteDocuments));
                                        })
                                    })
                                } else {
                                    dispatch(getFavouritesRejected("Null Value Received"))
                                }
                            }
                        )
                            .catch((error) => {
                                console.log('Received error: ' + error)
                                dispatch(getFavouritesRejected("Something went wrong. Please try again later."));
                                // alert("in error")
                                // Database.retrieveFavourites((res) => {
                                //     let localResponse = new FavouriteModel(res)
                                //     dispatch(getFavouritesFulfilled(localResponse.favouriteDocuments));
                                // })
                                // //dispatch(getFavouritesRejected(error));
                            });
                    } else {
                        CortellisService.getRequest(authToken, CONSTANTS.API.GET_FAVOURITES).then(
                            (response) => {
                                if (response.DocumentOutput.documents !== null) {
                                    let date = (response.DocumentOutput.timestamp !== null) ? response.DocumentOutput.timestamp : lastUpdated
                                    AsyncStorage.setItem('LastUpdatedFavDate', date)
                                    var documentIds = response.DocumentOutput.documents.map(document => {
                                        return document.idrac;
                                    });
                                    Database.updateFavourites(response.DocumentOutput.documents, USER_ID).then((result) => {
                                        Database.retrieveFavourites(USER_ID).then((res) => {
                                            let localResponse = new FavouriteModel(res)
                                            dispatch(getFavouritesFulfilled(localResponse.favouriteDocuments));
                                        })
                                    })
                                } else {
                                    dispatch(getFavouritesRejected("Null Value Received"))
                                }
                            }
                        )
                            .catch((error) => {
                                console.log('Received error: ' + error)
                                dispatch(getFavouritesRejected("Something went wrong. Please try again later."));
                                // alert("in error")
                                // Database.retrieveFavourites((res) => {
                                //     let localResponse = new FavouriteModel(res)
                                //     dispatch(getFavouritesFulfilled(localResponse.favouriteDocuments));
                                // })
                                // //dispatch(getFavouritesRejected(error));
                            });
                    }
                }
            })
        } else {
            Database.retrieveFavourites(USER_ID).then((res) => {
                let localResponse = new FavouriteModel(res)
                dispatch(getFavouritesFulfilled(localResponse.favouriteDocuments));
            })
        }
    }

}

export const getFavouritesFromLocalDatabase = (USER_ID) => {
    return (dispatch, getState) => {
        Database.retrieveFavourites(USER_ID).then((res) => {
            let localResponse = new FavouriteModel(res)
            dispatch(getFavouritesFulfilled(localResponse.favouriteDocuments));
        })
    }
}


export const deleteFavouritesDispatch = (token, params , USER_ID) => {
    const authToken = token
    return (dispatch, getState) => {
        let isConnected = getState().offlineReducer.isConnected
        if (isConnected) {
            dispatch(getFavouritesStarted());
            CortellisService.postRequest(authToken, CONSTANTS.API.DELETE_FAVOURITES, params).then(
                (response) => {
                    console.log('Received response: ' + JSON.stringify(response))
                    let localResponse = response.data
                    let favDataModel = new FavAlertDataModel(localResponse)
                    if (favDataModel.status === 'success') {
                        let filteredItems= []
                        // //chenge
                        let favouriteData = getState().favouritesData.favouriteDocuments.data

                        if(typeof favouriteData !== 'undefined'){
                             filteredItems = favouriteData.filter(item => params.data.documentIds.includes(item.idrac));
                        }else{
                            let alertData = getState().alertsData.alerts.data
                            alertData.alerts.map(alert => {
                                alert.notifications.map(notification => {
                                  notification.documents.map(document => {
                                    if (params.data.documentIds.includes(document.idrac)) {
                                        filteredItems.push(document)
                                    }
                                  })
                                })
                              })
                        }

                        //  dispatch(deleteFavouritesFulfilled(favDataModel));
                        Database.updateDocuments(filteredItems, false, USER_ID).then((result) => {
                            Database.retrieveFavourites(USER_ID).then((res) => {
                                let localResponse = new FavouriteModel(res)
                                dispatch(getFavouritesFulfilled(localResponse.favouriteDocuments));
                                dispatch(deleteFavouritesFulfilled(favDataModel));
                            })
                        }).catch((err) => {
                            let obj = {
                                alertId: '',
                                message: "Unable to Delete",
                                status: "failure"
                            }
                            let favDataModel = new FavAlertDataModel(obj)
                            dispatch(deleteFavouritesRejected(favDataModel))
                        }
                        )
                    } else {
                        //chenge
                        dispatch(deleteFavouritesRejected(favDataModel));
                    }
                }
            ).catch((error) => {
                //change
                let obj = {
                    alertId: '',
                    message: "Something went wrong during deletion of favourites.",
                    status: "failure"
                }
                let favDataModel = new FavAlertDataModel(obj)
                dispatch(deleteFavouritesRejected(favDataModel))
            });
        } else {
            //change
            let obj = {
                alertId: '',
                message: "You are offline. Please check your internet connection.",
                status: "failure"
            }
            let favDataModel = new FavAlertDataModel(obj)
            dispatch(deleteFavouritesRejected(favDataModel))
        }
    }
}

const fetchNotificationDetails = (authToken, uuid) => {
    return new Promise((resolve, reject) => {
      CortellisService.getRequest(authToken, CONSTANTS.API.RETRIEVE_NOTIFICATION_DETAILS(uuid)).then(
        (response) => {
          resolve(response)
        }
      ).catch((error) => {
        reject(error)
      });
    })
  }

export const fetchFavouriteNotification = (authToken, uuid) => {
    return new Promise((resolve, reject) => { 
      fetchNotificationDetails(authToken, uuid).then((response) => {
        if (response.AlertOutput.Alerts !== null && response.AlertOutput.Alerts.length > 0) {
            let localResponse = new Document(response.AlertOutput.Alerts[0].notifications[0].documents[0])
            resolve(localResponse)
        }
      }).catch((err) => {
          reject(err)
      })
    })
  }


const getFavouritesStarted = () => (
    {
        type: GET_FAVOURITES
    }
);

const getFavouritesFulfilled = (data) => (
    {
        type: GET_FAVOURITES_FULFILLED,
        payload: { data }
    }
);

const getFavouritesRejected = (error) => (
    {
        type: GET_FAVOURITES_REJECTED,
        payload: { error }
    }
);

const deleteFavouritesStarted = () => (
    {
        type: DELETE_FAVOURITES
    }
);

const deleteFavouritesFulfilled = (error) => (
    {
        type: DELETE_FAVOURITES_FULFILLED,
        payload: { error }
    }
);

const deleteFavouritesRejected = (error) => (
    {
        type: DELETE_FAVOURITES_REJECTED,
        payload: { error }
    }
);