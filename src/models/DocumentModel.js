export class Document {
    documentCategory = ''
    title = ''
    abstract = ''
    date = ''
    region = ''
    idracNumber = ''

    constructor(jsonObject) {
        this.title = jsonObject.Title
        this.documentCategory = jsonObject.DocumentCategory
        this.abstract = jsonObject.Abstract
        this.date = jsonObject.Date
        this.region = jsonObject.Region
        this.idracNumber = jsonObject.IDRACNumber
    }
}

export class CitedDocuments {
    id = 0
    Documents = []

    constructor(jsonObject) {
        this.id = Number(jsonObject.id)
        if(jsonObject.Documents){
            jsonObject.Documents.map(item => {
                this.Documents.push(new Document(item))
                return
            })
        }
    }
}

export class CitedBy {
    id = 0
    Documents = []

    constructor(jsonObject) {
        this.id = Number(jsonObject.id)
        if(jsonObject.Documents){
            jsonObject.Documents.map(item => {
                this.Documents.push(new Document(item))
                return
            })
        }
    }
}

// export default class CitedModel {
//     citedDocuments = {}
//     citedBy = {}

//     constructor(jsonObject) {
//         if (jsonObject.CitedDocumentOutput) {
//             this.citedDocuments = new CitedDocuments(jsonObject.CitedDocumentOutput)
//         }
//         else if (jsonObject.CitedByOutput) {
//             this.citedBy = new CitedBy(jsonObject.CitedByOutput)
//         }

//     }
// }