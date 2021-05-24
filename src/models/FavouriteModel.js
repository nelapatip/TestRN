export class Favourite {
    constructor(jsonObject) {

    }
}

export class RegulatorySnapshotOutput {
    title = ''
    comments = ''
    dateDisplay = ''
    docCategory = ''
    prodCategory = ''
    docForm = ''
    docType = ''
    languages = ''
    region = ''
    regulatoryAbstract = ''
    source = ''
    status = ''
    version = ''
    addedDate = ''
    updatedDate = ''
    regulatoryDateForceDisplay = ''
    isFavourite = ''
    isRead = ''
    topic = ''
    medicalDeviceSpecialty = ''

    constructor(jsonObject) {
        this.title = jsonObject.title
        this.comments = jsonObject.comments
        this.dateDisplay = jsonObject.dateDisplay
        this.docCategory = jsonObject.docCategory
        this.prodCategory = jsonObject.prodCategory
        this.docForm = jsonObject.docForm
        this.docType = jsonObject.docType
        this.languages = jsonObject.languages
        this.region = jsonObject.region
        this.regulatoryAbstract = jsonObject.regulatoryAbstract
        this.source = jsonObject.source
        this.status = jsonObject.status
        this.version = jsonObject.version
        this.addedDate = jsonObject.addedDate
        this.updatedDate = jsonObject.updatedDate
        this.regulatoryDateForceDisplay = jsonObject.regulatoryDateForceDisplay
        this.isFavourite = jsonObject.isFavourite
        this.isRead = jsonObject.isRead
        this.topic = jsonObject.topic
        this.medicalDeviceSpecialty = jsonObject.medicalDeviceSpecialty
    }
}

export class Document {
    idrac = 0
    regulatorySnapshotOutput = ''

    constructor(jsonObject , isResponseForDocumentReference = false) { 
        var responseToParse = jsonObject    
        if(isResponseForDocumentReference) {
            responseToParse = this.mapCitedByResponseFieldsWithRetreiveAlertFields(jsonObject)   
        }        
        this.idrac = Number(responseToParse.idrac)
        this.regulatorySnapshotOutput = new RegulatorySnapshotOutput(responseToParse.regulatorySnapshotOutput)
    }

    mapCitedByResponseFieldsWithRetreiveAlertFields(jsonObject) {  
        var convertedJson = {}      
        convertedJson.idrac = jsonObject.getRegulatorySnapshotOutput["@id"]

        var snapShotObject = {}
        snapShotObject.title = (this.checkIfKeyExists(jsonObject.getRegulatorySnapshotOutput,'Title')) ?  jsonObject.getRegulatorySnapshotOutput.Title : ''
        snapShotObject.comments = (this.checkIfKeyExists(jsonObject.getRegulatorySnapshotOutput,'Comment')) ? jsonObject.getRegulatorySnapshotOutput.Comment : ''
        snapShotObject.regulatoryAbstract = (this.checkIfKeyExists(jsonObject.getRegulatorySnapshotOutput,'Abstract')) ? jsonObject.getRegulatorySnapshotOutput.Abstract : ''
        snapShotObject.version = (this.checkIfKeyExists(jsonObject.getRegulatorySnapshotOutput,'Versions')) ?  this.convertArrayToString(jsonObject.getRegulatorySnapshotOutput.Versions.Version) : ''
        snapShotObject.status = (this.checkIfKeyExists(jsonObject.getRegulatorySnapshotOutput,'Status')) ?  jsonObject.getRegulatorySnapshotOutput.Status : ''
        snapShotObject.region = (this.checkIfKeyExists(jsonObject.getRegulatorySnapshotOutput,'Region')) ? jsonObject.getRegulatorySnapshotOutput.Region : ''
        snapShotObject.languages = (this.checkIfKeyExists(jsonObject.getRegulatorySnapshotOutput,'Languages')) ?  this.convertArrayToString(jsonObject.getRegulatorySnapshotOutput.Languages.language) : ''
        snapShotObject.docCategory = (this.checkIfKeyExists(jsonObject.getRegulatorySnapshotOutput,'DocCategories')) ? this.convertArrayToString(jsonObject.getRegulatorySnapshotOutput.DocCategories.DocCategory)  : ''
        snapShotObject.prodCategory = (this.checkIfKeyExists(jsonObject.getRegulatorySnapshotOutput,'ProdCategories')) ? this.convertArrayToString(jsonObject.getRegulatorySnapshotOutput.ProdCategories.ProdCategory) : ''
        snapShotObject.docType = (this.checkIfKeyExists(jsonObject.getRegulatorySnapshotOutput,'DocTypes')) ? this.convertArrayToString(jsonObject.getRegulatorySnapshotOutput.DocTypes.DocType) : ''
        snapShotObject.source = (this.checkIfKeyExists(jsonObject.getRegulatorySnapshotOutput,'Source')) ? jsonObject.getRegulatorySnapshotOutput.Source : ''
        snapShotObject.dateDisplay = (this.checkIfKeyExists(jsonObject.getRegulatorySnapshotOutput,'DateDisplay')) ? jsonObject.getRegulatorySnapshotOutput.DateDisplay : ''
        snapShotObject.addedDate = (this.checkIfKeyExists(jsonObject.getRegulatorySnapshotOutput,'AddedDate')) ? jsonObject.getRegulatorySnapshotOutput.AddedDate : ''
        snapShotObject.updatedDate = (this.checkIfKeyExists(jsonObject.getRegulatorySnapshotOutput,'LastUpdatedDate')) ? jsonObject.getRegulatorySnapshotOutput.LastUpdatedDate :''
        snapShotObject.topic =(this.checkIfKeyExists(jsonObject.getRegulatorySnapshotOutput,'Topics')) ? this.convertArrayToString(jsonObject.getRegulatorySnapshotOutput.Topics.Topic) : ''
        snapShotObject.medicalDeviceSpecialty = (this.checkIfKeyExists(jsonObject.getRegulatorySnapshotOutput,'MedicalDeviceSpecialties')) ? this.convertArrayToString(jsonObject.getRegulatorySnapshotOutput.MedicalDeviceSpecialties.MedicalDeviceSpecialty) : ''
        snapShotObject.regulatoryDateForceDisplay = (this.checkIfKeyExists(jsonObject.getRegulatorySnapshotOutput,'regulatoryDateForceDisplay')) ? this.convertArrayToString(jsonObject.getRegulatorySnapshotOutput.regulatoryDateForceDisplay) : ''

        convertedJson.regulatorySnapshotOutput = snapShotObject
        return convertedJson;
    }

    checkForArray(item){
       return Array.isArray(item)
    }

    convertArrayToString(item){
        if(this.checkForArray(item)){
           return item.join(';')
        }else{
            return item
        }
    }

    checkIfKeyExists(object , key){
        return object.hasOwnProperty(key)
    }

}

export default class FavouriteModel {
    favouriteDocuments = []

    constructor(jsonObject) {
        jsonObject.map(item => {
            this.favouriteDocuments.push(new Document(item))
            return
        })
    }

}