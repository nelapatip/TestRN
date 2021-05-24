import firebase from 'react-native-firebase';

class EventManager {    
    
    // initial configurations for firebase setup should come in this initializer
    initialize() {        
        const userId = ''
        firebase.analytics().setUserId(userId)      // to relate event to a particular user
    }
    
    
    // logs an event with parameters
    logEvent = (eventName, params) => {        
        firebase.analytics().logEvent(eventName, params)
    }
} 

export default EventManager;