import AsyncStorage  from "@react-native-community/async-storage";
import {Database} from '../utils/DatabaseHelper'
import axios from "axios";
import { store } from '../store/configureStore'


export const InitializeDB = () => {
    return dispatch => {
        DatabaseHelper.initializeDatabase().then((db) => {
            console.log("the db created " + db)
            dispatch(successAction("success"))
            dispatch(dbInstance(db))
        }).catch((error) => {
            console.log(error)
            return dispatch(failureAction(error))
        })
    }
}



export const CloseDB = (db) => {
    return dispatch => {
        DatabaseHelper.closeDatabase(db).then((msg) => {
            console.log(msg)
            return dispatch(successAction(msg))
        }).catch((error) => {
            console.log(error)
        })
    }
}

export const dbInstance = (data) => {
    return ({
        type: 'DBINSTANCE',
        data: data,
    })
}

export const successAction = (data) => {
    return ({
        type: 'SUCCESS',
        data: data,
    })
}

export const failureAction = (error, data) => {
    return ({
        type: 'FAILURE',
        data: data
    })
}

export const connectionState = ({ status }) => {
    return { type: 'CHANGE_CONNECTION_STATUS', isConnected: status };
};


export const requestPerson = (isConnected) => {
    return (dispatch) => {


        if (isConnected) {

            axios
                .get("http://localhost:3000/ALERTS")
                .then(response => {
                    console.log(response.data)
                    Database.insertAlert(response.data);
                })
                .catch(err => {

                    //dispatch({ type: "FETCH_REJECTED", payload: err });
                });

        } else {


            //DatabaseHelper.queryEmployees()


        }
    }
}

