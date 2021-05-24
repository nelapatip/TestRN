import React from 'react'
import { Alert, Linking } from 'react-native'
import AsyncStorage from "@react-native-community/async-storage";
import request from './Networking/Request'
import axios from 'axios'
import { version as app_version } from '../../package.json';
import { Update } from "./AppConfigJson"



const fetchAppInfo = (url = `https://itunes.apple.com/lookup?id=${Update.AppId}`) => {
  axios.defaults.headers.get['Content-Type'] = 'application/json'

  return request({
    url: url,
    method: 'GET'
  })
}

const performCheck = () => {
  let updateIsAvailable = false

  // Call API
  return fetchAppInfo().then(response => {
    let latestInfo = null
    if (response && response.resultCount === 1) {
      latestInfo = response.results[0]
      // check for version difference
      updateIsAvailable = latestInfo.version !== app_version
    }

    return { updateIsAvailable, ...latestInfo }
  })
}

const attemptUpgrade = (appId) => {

  const appStoreURI = `itms-apps://apps.apple.com/app/id${appId}?mt=8`
  const appStoreURL = `https://apps.apple.com/app/id${appId}?mt=8`

  Linking.canOpenURL(appStoreURI).then(supported => {
    if (supported) {
      Linking.openURL(appStoreURI)
    } else {
      Linking.openURL(appStoreURL)
    }
  })
}

const cancelAction = () => {
  AsyncStorage.setItem('LastUpdatePrompt', Date.now().toString())
}

const showUpgradePrompt = (appId, {
  title = 'New version available',
  message = 'Looks like you have an older version of the app. Please update to get latest features and best experience.',
  buttonUpgradeText = 'Update now',
  buttonCancelText = 'Not now',
  forceUpgrade = false
}) => {
  const buttons = [
    { text: buttonCancelText, onPress: () => cancelAction() },
    {
      text: buttonUpgradeText, onPress: () => attemptUpgrade(appId)
    }]

  Alert.alert(
    title,
    message,
    buttons,
    { cancelable: !!forceUpgrade }
  )
}

const checkForPrompt = () => {
return new Promise((resolve, reject) => {
    AsyncStorage.getItem('LastUpdatePrompt').then((res) => {
      if (!res) {
        reject(null)
      }
      else
        if (((Date.now() - Number(res)) / (3.6e+6)) >= 24) {
          resolve(true)
        }
        else {
          resolve(false)
        }
    }).catch((err) => {
      reject(err)
    })
  })
}

const promptUser = (defaultOptions = {}, versionSpecificOptions = []) => {
  checkForPrompt().then(result => {
    if(result){
      performCheck().then(res => {
        if (res.updateIsAvailable) {
          const options =
            versionSpecificOptions.find(o => o.localVersion === app_version)
            || defaultOptions
    
          showUpgradePrompt(res.trackId, options)
        }
      })
    }
  }).catch(err => {
    performCheck().then(res => {
      if (res.updateIsAvailable) {
        const options =
          versionSpecificOptions.find(o => o.localVersion === app_version)
          || defaultOptions
  
        showUpgradePrompt(res.trackId, options)
      }
    })
    console.log("Error in checking the last date ", err)
  })
}

export default {
  performCheck,
  promptUser
}