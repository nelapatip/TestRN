import { Linking } from 'react-native';
import AsyncStorage from "@react-native-community/async-storage";
import countryCodes from './CountriesMapping'
import qs from 'qs';
import { CONSTANTS } from '../constants/Constants'



export const mapCodeToCountry = async (email, data, callback) => {
    let codeArr = data.includes(',') ? data.split(",") : [data]
    let appendedString = ""

    try {
        const result = await AsyncStorage.getItem(email);
        if (result !== null) {
            prefData = JSON.parse(result)
            CountryData = prefData.filter.find((o => o.title === 'Country/Region'))

            if (CountryData !== null) {
                if (codeArr.length == CountryData.member.length) {
                    callback('All Countries')
                    return
                }
                if (codeArr.length > 3) {
                    for (let i = 0; i < codeArr.length; i++) {
                        CountryData.member.map((item) => {
                            if (item.countryId === codeArr[i]) {
                                if (i < 2) {
                                    appendedString += item.title + ", "
                                } else if (i == 3) {
                                    appendedString += item.title + " and " + (codeArr.length - i) + " more."
                                }
                            }
                        })
                    }
                    console.log(appendedString)
                    callback(appendedString)
                } else if (codeArr.length < 4) {
                    let appendedArr= []
                    for (let i = 0; i < codeArr.length; i++) {
                    CountryData.member.map((item) => {
                        if (item.countryId === codeArr[i]) {
                            appendedArr.push(item.title) 
                        }
                    })
                }
                    callback(appendedArr.join(','))
                }
            }


        }
    } catch (error) {

    }
}

export const mapTopicsIfExists = async (email, data, callback) => {
    let codeArr = data.includes(',') ? data.split(",") : [data]
    let appendedString = ""
    try {
        const result = await AsyncStorage.getItem(email);
        if (result !== null) {
            prefData = JSON.parse(result)
            DocumentData = prefData.filter.find((o => o.title === "Document Type"))

            if (codeArr.length == DocumentData.member.length) {
                callback('All Document Types')
                return
            }

            if (codeArr.length > 3) {
                for (let i = 0; i < codeArr.length; i++) {
                    if (i < 3) {
                        appendedString += codeArr[i] + ", "
                    } else if (i == 3) {
                        appendedString += codeArr[i] + " and " + (codeArr.length - i) + " more."
                    }

                }
                console.log(appendedString)
                callback(appendedString)
            } else if (codeArr.length < 4) {
                callback(codeArr.join(','))
            } else {
                callback('')
            }
        }
    } catch (error) {

    }
}

export const getCountryCode = (name) => {
    var countryItem = countryCodes.find((item) => {
        return item.name == name
    })

    return (countryItem && countryItem.code != undefined) ? countryItem.code : ''
}

export const mapCountrytoCode = async (data, callback) => {
    let codeArr = data
    let appendedString = ""

    countryCodes.map((item) => {
        if (item.name === codeArr) {
            appendedString += item.code
        }
    })
    callback(appendedString)
}

export async function sendEmail(subject, body, options = {}) {
    const { cc, bcc } = options;
    let url = `mailto:${''}`;

    // Create email link query
    const query = qs.stringify({
        subject: subject,
        body: body,
    });

    if (query.length) {
        url += `?${query}`;
    }

    // check if we can use this link
    const canOpen = await Linking.canOpenURL(url);

    if (!canOpen) {
        throw new Error('Provided URL can not be handled');
    }

    Linking.canOpenURL(url)
        .then((supported) => {
            if (!supported) {
                alert(CONSTANTS.FavouriteScreen.EmailClientNAError)
            } else {
                return Linking.openURL(url);
            }
        })
        .catch((err) => console.error('An error occurred', err));

}

export const getDateFromTimestamp = (timestamp) => {
    let spaceIndex = timestamp.indexOf(' ')
    if (spaceIndex != -1) {
        timestamp = timestamp.substring(0, spaceIndex)
    }
    return timestamp
}


export const sendAnalytics = (screenName, platform) => {
    Analytics.logEvent(screenName, { "platform": platform, "userId": global.userID })
}
