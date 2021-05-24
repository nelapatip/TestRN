import AsyncStorage  from "@react-native-community/async-storage";
import CortellisService from '../utils/Networking/CortellisService'
import { CONSTANTS } from '../constants/Constants';


// defines action types
// export const SAVE_DEVICE_TOKEN = 'SAVE_DEVICE_TOKEN';
// export const SAVE_DEVICE_TOKEN_FULFILLED = 'SAVE_DEVICE_TOKEN_FULFILLED';
// export const SAVE_DEVICE_TOKEN_REJECTED = 'SAVE_DEVICE_TOKEN_REJECTED';

export const SEND_DEVICE_TOKEN = 'SEND_DEVICE_TOKEN';
export const SEND_DEVICE_TOKEN_FULFILLED = 'SEND_DEVICE_TOKEN_FULFILLED';
export const SEND_DEVICE_TOKEN_REJECTED = 'SEND_DEVICE_TOKEN_REJECTED';

export const GET_DEVICE_TOKEN = 'GET_DEVICE_TOKEN'



const getDeviceToken = () => (
    {
        type: GET_DEVICE_TOKEN
    }
);


const saveDeviceTokenStarted = () => (
    {
        type: SAVE_DEVICE_TOKEN
    }
);

const saveDeviceTokenFulfilled = (data) => (
    {
        type: SAVE_DEVICE_TOKEN_FULFILLED,
        payload: { data }
    }
);

const saveDeviceTokenRejected = (error) => (
    {
        type: SAVE_DEVICE_TOKEN_REJECTED,
        payload: { error }
    }
);



const sendDeviceTokenStarted = () => (
    {
        type: SEND_DEVICE_TOKEN
    }
);

const sendDeviceTokenFulfilled = (data) => (
    {
        type: SEND_DEVICE_TOKEN_FULFILLED,
        payload: { data }
    }
);

const sendDeviceTokenRejected = (error) => (
    {
        type: SEND_DEVICE_TOKEN_REJECTED,
        payload: { error }
    }
);


// export const fetchDeviceToken = () => dispatch =>{

//     AsyncStorage.getItem('deviceToken')
//         .then((data) => {
//             return data
//         })
//         .catch((err) => {
//             dispatch(error(err.message || 'ERROR'));
//         })

//     }




// export const saveDeviceToken = (data) => dispatch =>{
//     AsyncStorage.setItem('deviceToken', data)
//     .then((data) => {
//         console.log("Save Device Token in Device Ref screen:: " + data);
//         dispatch(saveDeviceTokenFulfilled(data));
//     })
//     .catch((err) => {
//         console.log("Error save Device Token in Device Ref screen:: " + err);
//         dispatch(saveDeviceTokenRejected(err.message || 'ERROR'));
//     }
//     )
// }

    //dispatch(saveDeviceTokenStarted());


export const sendDeviceToken = (token, params) => {
    console.log("Device Token API started")
    return dispatch => {
        dispatch(sendDeviceTokenStarted());
        CortellisService.postRequest(token, CONSTANTS.API.DEVICE_REGISTRATION, params).then(
            (response) => {
                console.log('Received response Device Token: ' + JSON.stringify(response))
                let localResponse = response
                console.log(localResponse)
                AsyncStorage.setItem('isTokenUpdate',JSON.stringify(false))
                dispatch(sendDeviceTokenFulfilled(localResponse));
            }
        )
            .catch((error) => {
                console.log('Received error Device Token: ' + error)
                AsyncStorage.setItem('isTokenUpdate',JSON.stringify(true))
                dispatch(sendDeviceTokenRejected(error));
            });
    }
}

/*export const sendDeviceToken = (token, params) => {

    return new Promise((resolve, reject) => {
        CortellisService.postRequest(token, CONSTANTS.API.DEVICE_REGISTRATION, params).then(res => {
            resolve(res)
            // if (res.user.isValidUser) {
            //     resolve(true);
            // } else {
            //     resolve(false);
            // }
        }).catch(err => reject(err));
    });
};*/