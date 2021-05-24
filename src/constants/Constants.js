export const CONSTANTS = {
    DOCUMENT_VIEW: "Document",
    ALERT: "Alert",
    ALERTS_LABEL: "alerts",
    ALERT_LABEL_SINGLE: "alert",
    SELECT: "Select",
    DONE: "Done",
    ADD: "Add",
    NEW: "New",
    EDIT: "Edit",
    CREATE_ALERT:"Create Alert",
    EDIT_ALERT:"Edit Alert Name",
    BY_NAME: "By name",
    BY_DATE: "By most recently updated",
    APPLY: "Apply",
    VIEW_DOC: "View document",
    COMMENTS: "Reason for Update",
    YOUR_INTERESTS: "Your interests",
    UPDATE_INTERESTS: "Update interests",
    ACCOUNT_SETTINGS: "Account settings",
    SIGN_OUT: "Sign out",

    DOC_DESCRIPTION: "These supplementary guidelines are intended to highlight certain aspects that have a bearing on the manufacture of herbal medicinal products. Since medicinal plant materials are often obtained from varied geographical and commercial sources it may not always be possible to ascertain the conditions to which they may have been subjected. Criteria for their testing should take into consideration as many factors as possible based on experience with the material obtained from the source in quest.",

    RELATED: "Related",
    FAVOURITE: "Favorite",
    REMOVE: "Remove",
    DELETE: "Delete",
    SHARE: "Share",
    DOC_TITLE: "EU Parliament & Council Regulation 469/2009: Concerning the Supplementary Protection Certificate for Medicinal Products, 16-Jun-2009",
    INFORCE: "COMING INTO FORCE",
    STATUS: "STATUS",
    IDRAC: "NUMBER",
    REGION: "REGION",

    SORT: "Sort",
    NO_INTERNET: "Some features are unavailable due to internet connectivity issues.",

    DRUGS_AND_BIO: "Drugs and Biologics",
    MEDICAL: "Medical Devices and IVDs",
    PRODUCT_CATEGORY: "Product Category",
    TOPIC: "Topic",
    COUNTRY_REGION: "Country/Region",
    COUNTRY_REGION_MD: "MD Country/Region",
    COUNTRY_REGION_DB: "DB Country/Region",
    DOCUMENT_CATEGORY: "Document Category",
    DOCUMENT_TYPE: "Document Type",
    DOCUMENT_TYPE_DB: "DB Document Type",
    DOCUMENT_TYPE_MD: "MD Document Type",
    MORE_REGIONS: "More regions",
    MORE_TOPICS: "More topics",
    MORE_TYPES: "More types",
    MORE_CATEGORIES: "More categories",

    ACCESS_DECLINED_TITLE: "WE'RE SORRY",
    ACCESS_DECLINED_MESSAGE: "You do not currently have access to this content.\nPlease contact your account representative if you would like to access this content and add this country module to your subscription.",
    NAME:'NAME',

    TIME: "Time",

    ERROR_MESSAGE: 'Something went wrong.',

    MAX_DOWNLOAD_LIMIT: "6",

    NewAlert: {
        create_new: 'Create a new alert',
    },
    DocumentDetails: {
        cited_by: 'Cited by ',
        cited_documents: 'Cited documents',
        PermissionDeniedError: 'Permission Denied Error!',
        PermissionDeniedMessage: "We need to access your storage for document view.",
        EmailBody: '<b>I would like to share this document with you.</b></br></br></br></br><p>Sent via Cortellis Regulatory Intelligence Alerts.</p></br><p>A Cortellis account and access to Cortellis Regulatory Intelligence is required to access documents.</p>',
        DocNotValidError: "Document not valid",
        PDFAlreadyDownloaded: "Pdf is already downloaded"
    },

    SelectRegion: {
        select: 'Select regions',
        find: 'Find',
        done: 'Done',
        no_search: 'No results found for your search',
        text_length_limit:'Alert Name limit exceeds the 70 characters'
        
    },
    WelcomeScreen: {
        Cortellis_account: 'I have a Cortellis account',
        No_account: 'I do not have a Cortellis account',
        title: 'Regulatory Intelligence Alerts',
        swiper1_text: 'Get notified when mission critical regulatory information is released.',
        swiper2_text: 'Understand the impact of regulatory changes on the go.',
        swiper3_text: 'Build your own quick access library of regulatory content. Then get notified of updates.',
    },
    UserPreferencesScreen: {
        titleQues: 'What are you interested in?',
        bottomText1:'Selecting your default interests can help you create new alerts faster. This information is stored on your phone and used to provide a better experience. Clarivate does not access this information. You can update your interests from your Profile.',
        // bottomText1: 'Optional. We use this information to provide a',

        // bottomText1: 'Optional. We use this information to provide a',
        // bottomText2: 'better experience. This information is stored locally',
        // bottomText3: 'and Clarivate have no access to it.',
        buttonText: 'Continue',
        PRODUCT_CATEGORY: "PRODUCT CATEGORY",
        TOPIC: "Topic",
        COUNTRY_REGION: "Country/Region",
        DOCUMENT_CATEGORY: "Document Category",
        DOCUMENT_TYPE: "Document Type",
        MORE_REGIONS: "countries",
        MORE_TOPICS: "topics",
        MORE_TYPES: "types",
        MORE_CATEGORY: "categories"
    },
    LearnMoreScreen: {
        text: 'We use this information to provide you with sensible default settings should you wish to use the app to create an alert.'
    },
    FavouriteScreen: {
        EmptyFavListLabel1: 'Your favorite documents will appear on this screen',
        EmptyFavListLabel2: 'You will receive notifications when your favorite documents are updated',
        DeleteFavSuccessfull: 'Favorites Preferences Updated',
        DeleteFavFailure: 'Favorites Prefrences Updation Failed',
        MultipleDocPrintError: 'Can not print more than one Document',
        NotDownloadedError: "Document is not available for print",
        NotDownloadedErrorPrint: "Document is not available for print. Please try again when you are online",
        NotDownloadedErrorViewDoc: "Document is not available. Please try again when you are online",
        PrintPdfErrorForNonDownloadedDocs: 'To print, first tap “View Document”.',
        EmailClientNAError: 'Email client not availaible.',
        EmailSendingFailedError: 'Email sending failed.',
        EmailSent: 'Email sent.',
        LessThanSixError: "Please select 6 or less documents.",
        LessThanSixSizeError: "Selected documents exceed the 6MB limit.",
        SelectAnyOneDocument: 'Please select at least one document!',
        EmailSubject: 'Important regulatory information',
        EmailBody: '<b>I would like to share this document with you.</b>',
        ZipName: 'RegulatoryAlerts.zip',
        PdfName: 'RegulatoryAlerts.pdf',
        emailText:'I would like to share this document link with you.\n',
    },
    API: {
        RETRIEVE_NOTIFICATION_DETAILS: (uuid) => 'api-ws/ws/rs/alert-v1/alert/retrieveAlert?uuid='+uuid,
        RETRIEVE_ALERT: (isDateAvalaible, newDate) => isDateAvalaible ? 'api-ws/ws/rs/alert-v1/alert/retrieveAlert?date=' + newDate : 'api-ws/ws/rs/alert-v1/alert/retrieveAlert',
        GET_FAVOURITES: 'api-ws/ws/rs/alert-v1/alert/retrieveFavourite',
        GET_FAVOURITES_TIMESTAMP: (appendedString) => 'api-ws/ws/rs/alert-v1/alert/retrieveFavourite?timestamp='+ appendedString,
        CREATE_ALERT_URL: (appendedString) => 'api-ws/ws/rs/alert-v1/alert/createAlert?'+ appendedString,

        DELETE_ALERT_URL: 'api-ws/ws/rs/alert-v1/alert/deleteAlert',
        UPDATE_ALERT_URL: (appendedString) => 'api-ws/ws/rs/alert-v1/alert/updateAlert?'+ appendedString,
        USER_VALIDATION_URL: 'regulatorymobile/ws/rs/regulatory-v2/regulatory/user/valid?fmt=json',
        CITED_BY_URL: (idrac) => 'regulatorymobile/ws/rs/regulatory-v2/regulatory/citedBy/'+ idrac +'?fmt=json',
        CITED_DOCUMENTS_URL: (idrac) => 'regulatorymobile/ws/rs/regulatory-v2/regulatory/citedDocuments/'+ idrac +'?fmt=json',
        GET_SNAPSHOT: (idrac) => 'regulatorymobile/ws/rs/regulatory-v2/regulatory/' + idrac + '?fmt=json',
        GET_FAVOURITE_STATUS: (userID,idrac) => 'api-ws/ws/rs/alert-v1/alert/favourite/status?userId='+userID+'&idracNumbers='+idrac+'',


        DELETE_FAVOURITES: 'api-ws/ws/rs/alert-v1/alert/deleteFavourite',
        ADD_FAVOURITES: 'api-ws/ws/rs/alert-v1/alert/addFavourite',
        DOWNLOAD_DOCUMENT: (docId) => 'regulatorymobile/ws/rs/regulatory-v2/regulatory/' + docId + '?fmt=pdf',
        DEVICE_REGISTRATION:'api-ws/ws/rs/alert-v1/alert/device/registration',

        GET_PREFERENCES: 'regulatorymobile/ws/rs/regulatory-v2/regulatory/search?query=NOT%20qskdjkkdfak&filtersEnabled=true&fmt=json&hits=1&returnFilterCount=70000',
        GET_DB_COUNTRIES: 'regulatorymobile/ws/rs/regulatory-v2/regulatory/dbcountries?fmt=json',
        GET_MD_COUNTRIES: 'regulatorymobile/ws/rs/regulatory-v2/regulatory/mdcountries?fmt=json',

        TimeoutMessage: 'Something went wrong. Check your internet connection.'
    },

    FIREBASE_ANALYTICS: {
        EXIST_CORTELLIS_ACCOUNT:'EXIST_CORTELLIS_ACCOUNT',
        NON_EXIST_CORTELLIS_ACCOUNT:'NON_EXIST_CORTELLIS_ACCOUNT',
        SIGN_OUT:'SIGN_OUT',
        DOCUMENT_VIEW:'DOCUMENT_VIEW',
        DOCUMENT_VIEW_PDF:'DOCUMENT_VIEW_PDF',
        DOCUMENT_ITEM_VIEW:'DOCUMENT_ITEM_VIEW',
        CREATE_ALERT:'CREATE_ALERT',
        EDIT_ALERT:'EDIT_ALERT',
        SORTING_CHANGES_ALERT:'SORTING_CHANGES_ALERT',
        SHARE_CLICK_ALERT_DETAIL:'SHARE_CLICK_ALERT_DETAIL',
        FAVOURITE_CLICK_ALERT_DETAIL:'FAVOURITE_CLICK_ALERT_DETAIL',
        SHOW_MORE_TOPICS:'SHOW_MORE_TOPICS',
        SHOW_MORE_REGIONS: 'SHOW_MORE_REGIONS',
        SHOW_MORE_TYPES: 'SHOW_MORE_TYPES',
        SHOW_MORE_CATEGORIES:'SHOW_MORE_CATEGORIES',

        CITED_BY_VIEW:'CITED_BY_VIEW',
        CITED_BY_DOCUMENT:'CITED_BY_DOCUMENT',

        FAVOURITE_CLICK_ALERT_DETAIL:'FAVOURITE_CLICK_ALERT_DETAIL',
        UPDATE_INTEREST:'UPDATE_INTEREST',

        ALERT_TAB_CLICK:'ALERT_TAB_CLICK',
        FAVOURITE_TAB_CLICK:'FAVOURITE_TAB_CLICK',
        PROFILE_TAB_CLICK:'PROFILE_TAB_CLICK',

        REMOVE_FAVOURITE_SCREEN:'REMOVE_FAVOURITE_SCREEN',
        SHARE_CLICK_FAVOURITE:'SHARE_CLICK_FAVOURITE',
        SORTING_CHANGES_FAVOURITE:'SORTING_CHANGES_FAVOURITE',

        REMOVE_FAVOURITE_DOCUMENT:'REMOVE_FAVOURITE_DOCUMENT',
        SHARE_CLICK_DOCUMENT:'SHARE_CLICK_DOCUMENT',
        PRINT_DOCUMENT:'PRINT_DOCUMENT',
        EMAIL_DOCUMENT:'EMAIL_DOCUMENT',

        DELETE_ALERT:'DELETE_ALERT',
        ALERT_SCREEN:'ALERT_SCREEN',
        FAVORITE_SCREEN:'FAVORITE_SCREEN',
        DOCUMENT_SCREEN:'DOCUMENT_SCREEN',
        ALERT_DETAIL_SCREEN:'ALERT_DETAIL_SCREEN',
        WELCOME_SCREEN:'WELCOME_SCREEN',

        NET_CONNECTED:'NETWORK_CONNECTED',
        NET_DISCONNECTED:'NETWORK_DISCONNECTED',

        NOTIFICATION_CLICKED: 'NOTIFICATION_CLICKED',
        SORTED_BY_NAME: "Sorted_By_name",
        SORTED_BY_DATE: "Sorted_By_most_recently_updated",





    }


}
