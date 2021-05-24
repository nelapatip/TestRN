import request from './Request'
import axios from 'axios'

function getUserPreferences(userToken, url) {
    axios.defaults.headers.common['ca-token'] = userToken
    
    return request({
        url: url,
        method: 'GET'
    })
}

function getRequest(userToken, url) {
    axios.defaults.headers.common['ca-token'] = userToken
    axios.defaults.headers.get['Content-Type'] = 'application/json'

    return request({
        url: url,
        method: 'GET'
    })
}

function postRequest(userToken, url, params) {
    axios.defaults.headers.common['ca-token'] = userToken
    axios.defaults.headers.post['Content-Type'] = 'application/json';

    return request({
        url: url,
        method: 'POST',
        data: params
    })
}

function deleteAlert(userToken, url) {
    axios.defaults.headers.common['ca-token'] = userToken

    return request({
        url: url,
        method: 'POST'
    })
}

// function postRequest(userToken, url,appendedString) {
//     axios.defaults.data
//     axios.defaults.headers.common['ca-token'] = userToken
// alert("url="+url+appendedString)
    
//     return request({
//         url: url+appendedString,
//         method: 'POST'
//     })
// }
// function fetchPdf(userToken, url, signal) {
//     return  fetch(url, {
//         method: "GET",
//         headers: {
//             'ca-token': userToken,
//             'Content-Type': 'application/pdf'
//         },
//         signal : signal
//     })
// }
//

const CortellisService = {
    getUserPreferences, getRequest, postRequest, deleteAlert
}

export default CortellisService;