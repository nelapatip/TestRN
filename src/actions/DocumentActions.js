import { CONSTANTS } from '../constants/Constants'
import CortellisService from '../utils/Networking/CortellisService'
import {CitedDocuments, CitedBy} from '../models/DocumentModel'
import {Document} from '../models/FavouriteModel'
import { Database } from '../utils/DatabaseHelper';

// // defines action types

export const MARK_UNMARK_FAVORITE = 'MARK_UNMARK_FAVORITE';
export const MARK_UNMARK_FAVORITE_FULFILLED = 'MARK_UNMARK_FAVORITE_FULFILLED';
export const MARK_UNMARK_FAVORITE_REJECTED = 'MARK_UNMARK_FAVORITE_REJECTED';

export const GET_CITED_DOCUMENTS = 'GET_CITED_DOCUMENTS';
export const GET_CITED_DOCUMENTS_FULFILLED = 'GET_CITED_DOCUMENTS_FULFILLED';
export const GET_CITED_DOCUMENTS_REJECTED = 'GET_CITED_DOCUMENTS_REJECTED';

export const GET_CITED_BY = 'GET_CITED_BY';
export const GET_CITED_BY_FULFILLED = 'GET_CITED_BY_FULFILLED';
export const GET_CITED_BY_REJECTED = 'GET_CITED_BY_REJECTED';


export const getCitedDocuments = (token, idrac) => {
  return new Promise((resolve, reject) => {
    CortellisService.getRequest(token, CONSTANTS.API.CITED_DOCUMENTS_URL(idrac) ).then(
      (response) => {
        let localResponse = new CitedDocuments(response.CitedDocumentOutput)
        console.log(localResponse)
        resolve(localResponse);
      }
    )
    .catch((error) => {
      console.log('Received error: ' + error)
      reject(error);
    });
  })
}


export const getCitedBy = (token, idrac) => {
  return new Promise((resolve, reject) => {
    CortellisService.getRequest(token, CONSTANTS.API.CITED_BY_URL(idrac) ).then(
      (response) => {
        let localResponse = new CitedBy(response.CitedByOutput)
        console.log(localResponse)
        resolve(localResponse);
      }
    )
    .catch((error) => {
      console.log('Received error: ' + error)
      reject(error);
    });
  })
}

export const getSnapShotObject = (token, idrac) => {
  return new Promise((resolve, reject) => {
    CortellisService.getRequest(token, CONSTANTS.API.GET_SNAPSHOT(idrac)).then(
      (response) => {
        //sending true flag to map the response to the existing document model
        let localResponse = new Document(response , true)
        console.log(localResponse)
        resolve(localResponse)
      }
    )
    .catch((error) => {
      reject(error)
      console.log('Received error: ' + error)
    });
  })
}

export const getDocumentObject = (idrac) => {
  return dispatch => {

    Database.GetDocumentObject(idrac).then((res) => {
      dispatch(getDocumentFulfilled(res));
    })
    .catch((error) => {
      dispatch(getDocumentFailed(error))
      console.log('Received error: ' + error)
    });
  }
}


export const getDocumentFavouriteStatus = (token, idrac, userID) => {
  return new Promise((resolve, reject) => {
    CortellisService.getRequest(token, CONSTANTS.API.GET_FAVOURITE_STATUS(userID,idrac) ).then(
      (response) => {
        let localResponse = response[idrac]
        resolve(localResponse);
      }
    )
    .catch((error) => {
      console.log('Received error: ' + error)
      reject(error);
    });
  })
}


export const checkForFavDocument = (idrac ,userID) => {
  return new Promise((resolve, reject) => {
  Database.checkForFavDocument(idrac , userID).then((res) => {
    resolve(res)
  }).catch((err) => {
    reject()
  })
})
}


const getDocumentFulfilled = (data) => (
  {
    type: 'GET_DOCUMENT_FULFILLED',
    payload: {data}
  }
);

const markFavoriteStarted = () => (
  {
    type: MARK_UNMARK_FAVORITE
  }
);

const markFavoriteFulfilled = (data) => (
  {
    type: MARK_UNMARK_FAVORITE_FULFILLED,
    payload: { data }
  }
);

const markFavoriteRejected = (error) => (
  {
    type: MARK_UNMARK_FAVORITE_REJECTED,
    payload: { error }
  }
);


const getCitedDocumentsStarted = () => (
  {
    type: GET_CITED_DOCUMENTS
  }
);

const getCitedDocumentsFulfilled = (data) => (
  {
    type: GET_CITED_DOCUMENTS_FULFILLED,
    payload: { data }
  }
);

const getCitedDocumentsRejected = (error) => (
  {
    type: GET_CITED_DOCUMENTS_REJECTED,
    payload: { error }
  }
);


const getCitedByStarted = () => (
  {
    type: GET_CITED_BY
  }
);

const getCitedByFulfilled = (data) => (
  {
    type: GET_CITED_BY_FULFILLED,
    payload: { data }
  }
);

const getCitedByRejected = (error) => (
  {
    type: GET_CITED_BY_REJECTED,
    payload: { error }
  }
);