// import { tsUndefinedKeyword } from "@babel/types";

export class filterOptions {
    title = ''
    isSelected = ''
    constructor(jsonObj) {
        this.title = jsonObj['@label']
        this.isSelected = false
    }
}

export class filter {
    label = ''
    filterOptions = []

    constructor(jsonObj) {
        this.label = jsonObj['@label']

        jsonObj.FilterOption.map(item => {
            var a = {}
            this.filterOptions.push(new filterOptions(item))
        })
    }
}

export default class UserPreferencesModel {
    filter = []

    constructor(jsonObj, isLocalJson) {
        if (!isLocalJson) {
            this.initializeWithServerResponse(jsonObj)
        }
        else {
            this.initializeWithLocalStorage(jsonObj)
        }
    }

    initializeWithLocalStorage(jsonObj) {
        this.filter = jsonObj
    }

    initializeWithServerResponse(jsonObj) {
        jsonObj.Filter.map(item => {
            var b = []

            if (item['@label'] === "Country/Region" || item['@label'] === "DB Country/Region" || item['@label'] === "MD Country/Region") {
                if (!Array.isArray(item.FilterOption)) { //Check if the FilterOption is array or not
                    const local = { title: item.FilterOption['@label'], isSelected: false, countryId: item.FilterOption['@id'] }
                    b.push(local)
                } else {
                    item.FilterOption.map(item2 => {
                        var local = { title: item2['@label'], isSelected: false, countryId: item2['@id'] }
                        b.push(local)
                    })
                }
            } else {
                item.FilterOption.map(item2 => {
                    var local = { title: item2['@label'], isSelected: false }
                    b.push(local)
                })
            }

            this.filter.push({ title: item['@label'], member: this.sortRow(b), position: this.getIndexForPreference(item['@label']) })
        })
        var isDualUser = this.filter.find(element => {
            return element.title == "Product Category"
        })
        if (isDualUser == undefined) {
            var isMDUser = this.filter.find(element => {
                return element.title == "MD Country/Region"
            })
            if (isMDUser) {
                this.filter.push({ title: 'Product Category', member: [{ title: 'Medical Devices and IVDs', isSelected: true }], position: this.getIndexForPreference('Product Category') })
            }
            else {
                this.filter.push({ title: 'Product Category', member: [{ title: 'Drugs and Biologics', isSelected: true }], position: this.getIndexForPreference('Product Category') })
            }
        }
        this.filter.sort(function (a, b) {
            return a.position - b.position
        })
    }

    isDualUser() {
        var element = this.filter.find(element => {
            return element.title == "Product Category"
        })
        return (element.member.length > 1)
    }

    getOptionsForDisplay() {
        var options = [...this.filter];
        var optionsToDisplay = []

        // add everything except Topics
        let shouldDisplayTopics = true;
        let shouldDisplayMDCountries = false;
        let shouldDisplayDBCountries = false;

        var newOptions = options.sort(function (a, b) {
            return a.position - b.position
        });
        newOptions.forEach(item => {
            if (item.title == 'Product Category') {
                item.member.map(element => {
                    if (element.title == 'Drugs and Biologics' && element.isSelected) {
                        shouldDisplayDBCountries = true
                    }
                    else if (element.title == 'Medical Devices and IVDs' && element.isSelected) {
                        shouldDisplayMDCountries = true
                    }
                })
                optionsToDisplay.push(item)
            }

            else if (item.title == 'MD Country/Region' && shouldDisplayMDCountries && !shouldDisplayDBCountries) {
                optionsToDisplay.push(item)
            }
            else if (item.title == 'DB Country/Region' && !shouldDisplayMDCountries && shouldDisplayDBCountries) {
                optionsToDisplay.push(item)
            }
            else if (item.title == 'Country/Region' && ((shouldDisplayMDCountries && shouldDisplayDBCountries) ||
                (!shouldDisplayMDCountries && !shouldDisplayDBCountries))) {
                optionsToDisplay.push(item)
            }
            else if (item.title == 'MD Document Type' && shouldDisplayMDCountries && !shouldDisplayDBCountries) {                               
                optionsToDisplay.push(item)
            }
            else if (item.title == 'DB Document Type'  && !shouldDisplayMDCountries && shouldDisplayDBCountries) {                               
                optionsToDisplay.push(item)
            }
            else if (item.title == 'Document Type' && ((shouldDisplayMDCountries && shouldDisplayDBCountries) || 
                                                        (!shouldDisplayMDCountries && !shouldDisplayDBCountries))){
                optionsToDisplay.push(item)
            }
            else if (item.title == 'Document Category') {
                optionsToDisplay.push(item)
            }
            else if (item.title == 'Topic') {
                optionsToDisplay.push(item)
            }

        })
        return optionsToDisplay.sort(function (a, b) {
            return a.position - b.position
        });
    }

    updatePreferencesOnUserSelection(title, value) {
        this.filter.map(element => {
            if (element.title == title) {
                element.member.map(member => {
                    if (member.title == value) {
                        member.isSelected = !member.isSelected
                    }
                })
            }
        })
    }

    getOptionsForDisplayOnCreateAlert(isDBCategorySelected, isMDCategorySelected) {
        var options = [...this.filter];
        var optionsToDisplay = []

        // add everything except Topics
        let shouldDisplayMDCountries = false;
        let shouldDisplayDBCountries = false;

        var newOptions = options.sort(function (a, b) {
            return a.position - b.position
        });
        newOptions.forEach(item => {
            if (item.title == 'Product Category') {
                item.member.map(element => {
                    if (element.title == 'Drugs and Biologics' && isDBCategorySelected) {
                        shouldDisplayDBCountries = true
                    }
                    else if (element.title == 'Medical Devices and IVDs' && isMDCategorySelected) {
                        shouldDisplayMDCountries = true
                    }
                })
                optionsToDisplay.push(item)
            }

            else if (item.title == 'MD Country/Region' && shouldDisplayMDCountries && !shouldDisplayDBCountries) {
                optionsToDisplay.push(item)
            }
            else if (item.title == 'DB Country/Region' && !shouldDisplayMDCountries && shouldDisplayDBCountries) {
                optionsToDisplay.push(item)
            }
            else if (item.title == 'Country/Region' && ((shouldDisplayMDCountries && shouldDisplayDBCountries) ||
                (!shouldDisplayMDCountries && !shouldDisplayDBCountries))) {
                optionsToDisplay.push(item)
            }
            else if (item.title == 'MD Document Type' && shouldDisplayMDCountries && !shouldDisplayDBCountries) {                               
                optionsToDisplay.push(item)
            }
            else if (item.title == 'DB Document Type'  && !shouldDisplayMDCountries && shouldDisplayDBCountries) {                               
                optionsToDisplay.push(item)
            }
            else if (item.title == 'Document Type' && ((shouldDisplayMDCountries && shouldDisplayDBCountries) || 
                                                        (!shouldDisplayMDCountries && !shouldDisplayDBCountries))){
                optionsToDisplay.push(item)
            }
            else if (item.title == 'Document Category') {
                optionsToDisplay.push(item)
            }
           // else if (item.title == 'Topic' && (shouldDisplayMDCountries || (!shouldDisplayMDCountries && !shouldDisplayDBCountries)))
            else if (item.title == 'Topic')
            {
                optionsToDisplay.push(item)
            }
        })
        return optionsToDisplay.sort(function (a, b) {
            return a.position - b.position
        });
    }


    getIndexForPreference(title) {
        if (title == 'Product Category') {
            return 0
        }
        else if (title == 'Document Type') {
            return 5
        }
        else if (title == 'Topic') {
            return 1
        }
        else if (title == 'Country/Region') {
            return 2
        }
        else if (title == 'Document Category') {
            return 6
        }
        else if (title == 'DB Country/Region') {
            return 3
        }
        else if (title == 'MD Country/Region') {
            return 3
        }
        else if (title == 'MD Document Type') {
            return 4
        }
        else if (title == 'DB Document Type') {
            return 4
        }
    }

    getCountriesForProductCategory(category) {
        var countryTitle = 'Country/Region'
        if (category == 'Medical Devices and IVDs') {
            countryTitle = "MD Country/Region"
        }
        else if (category == 'Drugs and Biologics') {
            countryTitle = "DB Country/Region"
        }
        return this.filter.find(element => {
            return (element.title == countryTitle)
        })
    }


    getDocumentTypForProductCategory(category) {
        var documentType = 'Document Type'
        if (category == 'Medical Devices and IVDs') {
            documentType = "MD Document Type"
        }
        else if (category == 'Drugs and Biologics') {
            documentType = "DB Document Type"
        }
        return this.filter.find(element => {
            return (element.title == documentType)
        })
    }

    sortRow(data) {
        data.sort(function (a, b) {
            const A = a.title.toUpperCase();
            const B = b.title.toUpperCase();
            let comparison = 0;
            if (A > B) {
                comparison = 1;
            } else if (A < B) {
                comparison = -1;
            }
            return comparison;
        })
        var item = data.find(o => o.title.includes('Other'))
        var i = data.indexOf(item);
        if (i != -1) {
            data.splice(i, 1);
            data.push(item)
        }
        console.log("FDSF", data.find(o => o.title.includes('Other')))
        return data

    }



}