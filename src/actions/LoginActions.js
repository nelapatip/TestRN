import AsyncStorage  from "@react-native-community/async-storage";
import CortellisService from '../utils/Networking/CortellisService'
import { CONSTANTS } from '../constants/Constants'

export const getToken = (token) => ({
    type: 'GET_TOKEN',
    token,
});

export const saveToken = token => ({
    type: 'SAVE_TOKEN',
    token
});

export const saveUser = data => ({
    type: 'SAVE_USER',
    data
});

export const getUser = data => ({
    type: 'GET_USER',
    data
});

export const removeToken = () => ({
    type: 'REMOVE_TOKEN',
});

export const loading = bool => ({
    type: 'LOADING',
    isLoading: bool,
});

export const error = error => ({
    type: 'ERROR',
    error,
});



export const getUserToken = () => dispatch =>

    AsyncStorage.getItem('userToken')
        .then((data) => {
            return data
        })
        .catch((err) => {
            dispatch(loading(false));
            dispatch(error(err.message || 'ERROR'));
        })



export const saveUserToken = (data) => dispatch =>
    AsyncStorage.setItem('userToken', data)
        .then((data) => {
            dispatch(loading(false));
            dispatch(saveToken(data));
        })
        .catch((err) => {
            dispatch(loading(false));
            dispatch(error(err.message || 'ERROR'));
        })

export const removeUserToken = () => dispatch =>
    AsyncStorage.removeItem('userToken')
        .then((data) => {
            dispatch(loading(false));
            dispatch(removeToken(data));
        })
        .catch((err) => {
            dispatch(loading(false));
            dispatch(error(err.message || 'ERROR'));
        })

export const isSignedIn = () => {
    return new Promise((resolve, reject) => {
        AsyncStorage.getItem('userToken')
            .then(res => {
                if (res) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            })
            .catch(err => reject(err));
    });
};

export const saveUserDetails = (data) => dispatch =>
    AsyncStorage.setItem('userObject', data)
        .then((data) => {
            dispatch(saveUser(data));
        })
        .catch((err) => {
            dispatch(error(err.message || 'ERROR'));
        })

export const getUserDetails = () => dispatch =>

    AsyncStorage.getItem('userObject')
        .then((data) => {

            dispatch(getUser(data));
        })
        .catch((err) => {

            dispatch(error(err.message || 'ERROR'));
        })



export const checkUserValidity = (token) => {
    return new Promise((resolve, reject) => {
        CortellisService.getRequest(token,CONSTANTS.API.USER_VALIDATION_URL ).then(res => {
            if (res.user.isValidUser) {
                resolve(true);
            } else {
                resolve(false);
            }
        }).catch(err => reject(err));
    });
};
