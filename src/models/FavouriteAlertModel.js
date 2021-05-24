
export default class FavouriteAlertModel {

    alertId = ''
    message = ""
    status = ""

    constructor(jsonObject) {
        this.alertId = jsonObject.alertId
        this.message = jsonObject.message
        this.status = jsonObject.status

    }

}




