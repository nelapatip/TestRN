export class Notification {
    notificationId = ''
    notificationName = ''
    notificationDate = ''
    documents = []

    constructor(jsonObject) {
        this.notificationId = jsonObject.notificationId
        this.notificationName = jsonObject.notificationName
        this.notificationDate = jsonObject.notificationDate

        if (jsonObject.documents) {
            jsonObject.documents.map(item => {
                this.documents.push(new documents(item))
            })
        }
    }

}

export class RegulatorySnapshotOutput {
    title = ''
    comments = ''
    region = ''
    regulatoryAbstract = ''
    status = ''
    regulatoryDateForceDisplay = ''
    docType = ''
    updatedDate = ''
    isRead = ''
    pdfLocation = ''
    isFavourite = false
    topic=''
    medicalDeviceSpecialty = ''
    version = ''
    languages= ''
    source = ''
    dateDisplay = ''

    constructor(jsonObject) {
        this.title = jsonObject.title
        this.comments = jsonObject.comments
        this.region = jsonObject.region
        this.regulatoryAbstract = jsonObject.regulatoryAbstract
        this.status = jsonObject.status
        this.regulatoryDateForceDisplay = jsonObject.regulatoryDateForceDisplay
        this.docType = jsonObject.docType
        this.updatedDate = jsonObject.updatedDate
        this.isRead = jsonObject.isRead
        this.pdfLocation = jsonObject.pdfLocation 
        this.isFavourite = jsonObject.isFavourite
        this.topic = jsonObject.topic
        this.medicalDeviceSpecialty = jsonObject.medicalDeviceSpecialty
        this.version = jsonObject.version
        this.languages = jsonObject.languages
        this.source = jsonObject.source
        this.dateDisplay = jsonObject.dateDisplay

    }
}

export class documents {
    idrac = 0
    regulatorySnapshotOutput = ''

    constructor(jsonObject) {
        this.idrac = Number(jsonObject.idrac)
        this.regulatorySnapshotOutput = new RegulatorySnapshotOutput(jsonObject.regulatorySnapshotOutput)
    }

}


export class Alert {
    alertId = ''
    alertName = ''
    alertTimestamp = ''
    prodCategories = ''
    topics = ''
    regions = ''
    docCategories = '' 
    docTypes = ''
    isNew = ''
    notifications = []

    constructor(jsonObject) {
        this.alertId =  ( jsonObject.alertId !== null || jsonObject.alertId !== "") ? jsonObject.alertId: '' 
        this.alertName =  ( jsonObject.alertName !== null || jsonObject.alertName !== "") ? jsonObject.alertName: '' 
        this.alertTimestamp = ( jsonObject.alertTimestamp !== null || jsonObject.alertTimestamp !== "") ? jsonObject.alertTimestamp: '' 
        this.prodCategories = ( jsonObject.prodCategories !== null || jsonObject.prodCategories !== "") ? jsonObject.prodCategories: ''
        this.topics = ( jsonObject.topics !== null || jsonObject.topics !== "") ? jsonObject.topics : ''
        this.regions = ( jsonObject.regions !== null || jsonObject.regions !== "") ? jsonObject.regions : ''
        this.docCategories = ( jsonObject.docCategories !== null || jsonObject.docCategories !== "") ? jsonObject.docCategories : ''
        this.docTypes = ( jsonObject.docTypes !== null || jsonObject.docTypes !== "") ? jsonObject.docTypes : ''
        this.isNew = ( jsonObject.isNew !== null || jsonObject.isNew !== "") ? jsonObject.isNew : 'N'


        if (jsonObject.notifications) {
            jsonObject.notifications.map(item => {
                this.notifications.push(new Notification(item))
            })
        }
    } 
}


export default class AlertModel {
    alerts = []

    constructor(jsonObject) {
        if (Array.isArray(jsonObject)) {
            jsonObject.map(item => {
                this.alerts.push(new Alert(item))
            })
        }
    }
}


