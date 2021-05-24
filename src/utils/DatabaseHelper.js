import SQLite from 'react-native-sqlite-storage'
SQLite.enablePromise(true);
import _ from 'lodash'
import { DatabaseInitialization } from './DatabaseInitialization'
import { Notification, RegulatorySnapshotOutput, documents, Alert } from '../models/AlertModel'
import { getDateFromTimestamp } from './Utility'
import Moment from 'moment'

const database_name = "Cortellis.db";
const database_version = "1.0";
const database_displayname = "Cortellis Database";
const database_size = 200000;
let db;
const CURRENT_SCHEMA_VERSION = 1

class DatabaseHelper {

    openDB = () => {
        return new Promise((resolve, reject) => {
            SQLite.echoTest().then(() => {
                SQLite.openDatabase(database_name, database_version, database_displayname, database_size).then((DB) => {
                    db = DB;
                    console.log("[db] Database open!");
                    //check if the table exists
                    this.checkIfTableExists(db, 'ALERT_MASTER').then((exists) => {
                        if (exists) {
                            this.getCurrentDbVersion(db).then((version) => {
                                if (version < CURRENT_SCHEMA_VERSION) {
                                    //do migration
                                    this.migrateDatabase(version, CURRENT_SCHEMA_VERSION)

                                    // Set Current Schema Version
                                    this.setCurrentDbVersion(CURRENT_SCHEMA_VERSION, db).then(() => {
                                        resolve(DB)
                                    })
                                }else{
                                    resolve(DB)
                                }
                            })
                        } else {
                            // Perform database initialization or updates
                            const databaseInitialization = new DatabaseInitialization();
                            databaseInitialization.createTables(DB);

                            // Set Current Schema Version
                            this.setCurrentDbVersion(CURRENT_SCHEMA_VERSION, db).then(() => {
                                resolve(DB)
                            })
                        }
                    })
                }).catch((error) => {
                    console.log(error);
                    reject(error)
                });
            }).catch(error => {
                console.log("echoTest failed - plugin not functional");
            });
        })
    };

    closeDatabase = () => {
        if (db) {
            console.log("Closing database ...");
            db.close().then((status) => {
                console.log("Database CLOSED");
                db = null
            }).catch((error) => {
                console.log(error);
            });
        } else {
            console.log("Database was not OPENED")
        }
    };

    getDatabase = () => {
        if (db) {
            return new Promise.resolve(db);
        } else {
            return this.openDB();
        }

    }

    //check the version of the database
    getCurrentDbVersion = (db) => {
        return new Promise((resolve, reject) => {
            let versionQuery = 'PRAGMA user_version'
            db.executeSql(versionQuery,
                []
            ).then(([results]) => {
                const length = results.rows.length;
                if (length > 0) {
                    resolve(results.rows.item(0).user_version)
                } else {
                    resolve(0)
                }
            }).catch((err) => {
                resolve(0)
            })
        })
    }

    setCurrentDbVersion = (version, db) => {
        return new Promise((resolve, reject) => {
            let versionQuery = 'PRAGMA user_version = ' + version

            db.executeSql(versionQuery,
                []
            ).then(([results]) => {
                console.log('Updated Database user_version.')
                resolve()
            }).catch((err) => {
                console.log('Error in updation, exception thrown.')
            })
        })
    }

    checkIfTableExists = (db, tableName) => {
        return new Promise((resolve, reject) => {
            let tableExists = "SELECT name FROM sqlite_master WHERE type='table' AND name='" + tableName + "'"
            db.executeSql(tableExists,
                []
            ).then(([results]) => {
                const length = results.rows.length;
                if (length == 0) {
                    resolve(false)
                } else {
                    resolve(true)
                }
            }).catch((err) => {
                resolve(false)
            })
        })
    }

    migrateDatabase = (oldVersion, currentSchemaVersion) => {
        console.log(oldVersion, currentSchemaVersion)
    }

    //check if data is present in the alerts table
    checkAlertTableData = (userID) => {
        return new Promise((resolve, reject) => {
            this.getDatabase().then((db) => {
                db.executeSql("SELECT * from ALERT_MASTER WHERE userID = '" + userID + "'",
                    []
                ).then(([results]) => {
                    const length = results.rows.length;
                    if (length > 0) {
                        resolve(true)
                    } else {
                        resolve(false)
                    }
                })
            })
        })
    }


    UpdateAlertSetQuery = (data, userID) => {
        return new Promise((resolve, reject) => {
            this.getDatabase().then((db) => {
                db.transaction((tx) => {
                    var len = data.length;
                    for (let i = 0; i < len; i++) {
                        alertData = data[i]
                        //update
                        let values = []
                        values.push(
                            alertData.alert_name,
                            alertData.alert_timestamp,
                            alertData.prodCategories.toString(),
                            alertData.topics,
                            alertData.regions,
                            alertData.docCategories,
                            alertData.docTypes,
                            alertData.alert_id,
                            userID
                        );
                        let updateQuery = "UPDATE ALERT_MASTER SET alertName=?, \
                                                                    alertTimestamp=?, \
                                                                    prodCategories=?, \
                                                                    topics=?, \
                                                                    regions=?, \
                                                                    docCategories=?, \
                                                                    docTypes=?  WHERE alertId = ? and userID=?;";

                        tx.executeSql(updateQuery, values)

                        //Notification data in the table
                        if (data[i].notifications.length > 0) {
                            var notificationObj = data[i].notifications
                            for (let j = 0; j < notificationObj.length; j++) {
                                let values2 = []
                                values2.push(
                                    notificationObj[j].notification_name,
                                    notificationObj[j].notification_date,
                                    notificationObj[j].notification_id,
                                    userID
                                );
                                let updateQuery2 = "UPDATE NOTIFICATION_MASTER SET notificationName=?, \
                                                               notificationDate=? WHERE notificationId = ? and userID=?;";

                                tx.executeSql(updateQuery2, values2)
                                //document data in the table

                                if (notificationObj[j].documents.length > 0) {
                                    var documentObj = notificationObj[j].documents
                                    for (let k = 0; k < documentObj.length; k++) {
                                        let values3 = []
                                        values3.push(
                                            documentObj[k].regulatorySnapshotOutput.title,
                                            documentObj[k].regulatorySnapshotOutput.comments,
                                            documentObj[k].regulatorySnapshotOutput.region,
                                            documentObj[k].regulatorySnapshotOutput.regulatoryAbstract,
                                            documentObj[k].regulatorySnapshotOutput.regulatoryDateForceDisplay,
                                            documentObj[k].regulatorySnapshotOutput.status,
                                            documentObj[k].regulatorySnapshotOutput.updatedDate,
                                            documentObj[k].regulatorySnapshotOutput.docType,
                                            documentObj[k].regulatorySnapshotOutput.topic,
                                            documentObj[k].regulatorySnapshotOutput.medicalDeviceSpecialty,
                                            documentObj[k].regulatorySnapshotOutput.version,
                                            documentObj[k].regulatorySnapshotOutput.languages,
                                            documentObj[k].regulatorySnapshotOutput.source,
                                            documentObj[k].regulatorySnapshotOutput.dateDisplay,
                                            '',
                                            documentObj[k].idrac,
                                            userID
                                        );
                                        let updateQuery3 = "UPDATE DOCUMENT_MASTER SET title=?, \
                                                                                comments=?, \
                                                                                region=?, \
                                                                                regulatoryAbstract=?, \
                                                                                regulatoryDateForceDisplay=?, \
                                                                                status=?, \
                                                                                LAST_UPDATED_DATETIME=?, \
                                                                                docType=?, \
                                                                                topic=?, \
                                                                                medicalDeviceSpecialty=?, \
                                                                                version=?, \
                                                                                languages=?, \
                                                                                source=?, \
                                                                                dateDisplay=?, \
                                                                                PDF_LOCATION = ? WHERE idrac = ? and userID=?;";

                                        tx.executeSql(updateQuery3, values3)
                                    }

                                }

                            }

                        }

                    }
                }).then(
                    () => {
                        resolve(true)
                    }
                )
            })
        })
    }

    //update the alert if there is new alerts present
    updateOrInsertDocument = (documentItem, userID, notificationId, db) => {
        return new Promise((resolve, reject) => {
            db.executeSql('SELECT * FROM DOCUMENT_MASTER WHERE idrac=? and userID=? and notificationId=?;',
                [documentItem.idrac, userID, notificationId]).then(async ([results]) => {
                    const length = results.rows.length;
                    if (length > 0) {
                        //update
                        let values = []
                        values.push(
                            documentItem.regulatorySnapshotOutput.title,
                            documentItem.regulatorySnapshotOutput.comments,
                            documentItem.regulatorySnapshotOutput.region,
                            documentItem.regulatorySnapshotOutput.regulatoryAbstract,
                            documentItem.regulatorySnapshotOutput.regulatoryDateForceDisplay,
                            documentItem.regulatorySnapshotOutput.status,
                            documentItem.regulatorySnapshotOutput.updatedDate,
                            documentItem.regulatorySnapshotOutput.docType,
                            documentItem.regulatorySnapshotOutput.topic,
                            documentItem.regulatorySnapshotOutput.medicalDeviceSpecialty,
                            documentItem.regulatorySnapshotOutput.version,
                            documentItem.regulatorySnapshotOutput.languages,
                            documentItem.regulatorySnapshotOutput.source,
                            documentItem.regulatorySnapshotOutput.dateDisplay,
                            '',
                            documentItem.idrac,
                            userID
                        );
                        let updateQuery = "UPDATE DOCUMENT_MASTER SET title=?, \
                                                            comments=?, \
                                                            region=?, \
                                                            regulatoryAbstract=?, \
                                                            regulatoryDateForceDisplay=?, \
                                                            status=?, \
                                                            LAST_UPDATED_DATETIME=?, \
                                                            docType=?, \
                                                            topic=?, \
                                                            medicalDeviceSpecialty=?, \
                                                            version=?, \
                                                            languages=?, \
                                                            source=?, \
                                                            dateDisplay=?, \
                                                            PDF_LOCATION = ? WHERE idrac = ? and userID=?;";

                        await db.executeSql(updateQuery, values).then(([results]) => resolve())
                    } else {
                        //insert
                        //TODO : change the below data[i] to the NOTIFICATION_MASTER
                        await db.executeSql('INSERT INTO DOCUMENT_MASTER (idrac, notificationId, title, comments, region, regulatoryAbstract, regulatoryDateForceDisplay, status, docType, LAST_UPDATED_DATETIME,topic,medicalDeviceSpecialty , version, languages, source , dateDisplay, FAVOURITE, IS_READ, PDF_LOCATION, userID) VALUES (?,?,?,?,?,?,?,?,?, ?, ?,? , ?,?,?, ?, ? , ?,?, ?);',
                            [documentItem.idrac,
                                notificationId,
                            documentItem.regulatorySnapshotOutput.title,
                            documentItem.regulatorySnapshotOutput.comments,
                            documentItem.regulatorySnapshotOutput.region,
                            documentItem.regulatorySnapshotOutput.regulatoryAbstract,
                            documentItem.regulatorySnapshotOutput.regulatoryDateForceDisplay,
                            documentItem.regulatorySnapshotOutput.status,
                            documentItem.regulatorySnapshotOutput.docType,
                            documentItem.regulatorySnapshotOutput.updatedDate,
                            documentItem.regulatorySnapshotOutput.topic,
                            documentItem.regulatorySnapshotOutput.medicalDeviceSpecialty,
                            documentItem.regulatorySnapshotOutput.version,
                            documentItem.regulatorySnapshotOutput.languages,
                            documentItem.regulatorySnapshotOutput.source,
                            documentItem.regulatorySnapshotOutput.dateDisplay,
                                'N', 'N', '', userID]).then(([results]) => resolve())

                    }

                })
        })

    }


    updateOrInsertNotification = (notificationItem, userID, alertID, db) => {
        return new Promise((resolve, reject) => {
            db.executeSql('SELECT * FROM NOTIFICATION_MASTER WHERE notificationId=? and userID=? and alertId=?;',
                [notificationItem.notification_id, userID, alertID]).then(async ([results]) => {
                    const length = results.rows.length;
                    if (length > 0) {
                        //update
                        let values = []
                        values.push(
                            notificationItem.notification_name,
                            notificationItem.notification_date,
                            notificationItem.notification_id,
                            userID
                        );
                        let updateQuery = "UPDATE NOTIFICATION_MASTER SET notificationName=?, notificationDate=? WHERE notificationId = ? and userID=?;";
                        await db.executeSql(updateQuery, values).then(([results]) => resolve())
                    } else {
                        //insert
                        //TODO : change the below data[i] to the NOTIFICATION_MASTER
                        await db.executeSql('INSERT INTO NOTIFICATION_MASTER (notificationId, alertId, notificationName, notificationDate, LAST_UPDATED_DATETIME , userID) VALUES (?,?, ?, ? , ?, ?);',
                            [notificationItem.notification_id,
                                alertID,
                            notificationItem.notification_name,
                            notificationItem.notification_date,
                                '', userID]).then(([results]) => resolve())

                    }
                })
        })
    }

    UpdateAlert = (data, userID) => {
        return new Promise((resolve, reject) => {
            this.getDatabase().then((db) => {
                db.transaction(async (tx) => {
                    for (const item of data) {
                        alertData = item
                        await db.executeSql('SELECT * FROM ALERT_MASTER WHERE alertId=? and userID=?;',
                            [item.alert_id, userID]).then(async ([results]) => {

                                const length = results.rows.length;
                                if (length > 0) {
                                    //update
                                    let values = []
                                    values.push(
                                        alertData.alert_name,
                                        alertData.alert_timestamp,
                                        alertData.prodCategories.toString(),
                                        alertData.topics,
                                        alertData.regions,
                                        alertData.docCategories,
                                        alertData.docTypes,
                                        alertData.alert_id,
                                        userID
                                    );
                                    let updateQuery = "UPDATE ALERT_MASTER SET alertName=?, \
                                                                              alertTimestamp=?, \
                                                                              prodCategories=?, \
                                                                              topics=?, \
                                                                              regions=?, \
                                                                              docCategories=?, \
                                                                              docTypes=?  WHERE alertId = ? and userID=?;";

                                    await db.executeSql(updateQuery, values)
                                } else {
                                    //insert
                                    //TODO : change the below data[i] to the alertdata
                                    await db.executeSql('INSERT INTO ALERT_MASTER (alertId, alertName, alertTimestamp, prodCategories, topics, regions,docCategories , docTypes, isNew, LAST_UPDATED_DATETIME, userID) VALUES (?,?,?, ?, ? , ?, ? , ? , ?, ?, ?);',
                                        [alertData.alert_id,
                                        alertData.alert_name,
                                        alertData.alert_timestamp,
                                        alertData.prodCategories.toString(),
                                        alertData.topics,
                                        alertData.regions,
                                        alertData.docCategories,
                                        alertData.docTypes,
                                            'Y', '', userID]);

                                }

                                if (alertData.notifications.length > 0) {
                                    var notificationObj = alertData.notifications
                                    for (const notificationItem of notificationObj) {

                                        await this.updateOrInsertNotification(notificationItem, userID, alertData.alert_id, db)

                                        //document data in the table
                                        if (notificationItem.documents.length > 0) {
                                            var documentObj = notificationItem.documents
                                            for (const documentItem of documentObj) {
                                                await this.updateOrInsertDocument(documentItem, userID, notificationItem.notification_id, db)
                                            }

                                        }

                                    }

                                }

                            }

                            )

                        //Notification data in the table
                    }
                }).then(
                    () => {
                        resolve(true)
                    }
                )
            })
        })
    }


    //insert the alerts in the db

    insertAlert = (data, userID) => {
        return new Promise((resolve, reject) => {
            this.getDatabase().then((db) => {
                db.transaction((tx) => {
                    var len = data.length;
                    for (let i = 0; i < len; i++) {
                        tx.executeSql('INSERT INTO ALERT_MASTER (alertId, alertName, alertTimestamp, prodCategories, topics, regions,docCategories , docTypes, isNew, LAST_UPDATED_DATETIME, userID) VALUES (?,?,?, ?, ? , ?, ? , ? , ?, ?,?);',
                            [data[i].alert_id,
                            data[i].alert_name,
                            data[i].alert_timestamp,
                            data[i].prodCategories.toString(),
                            data[i].topics,
                            data[i].regions,
                            data[i].docCategories,
                            data[i].docTypes,
                                'Y', '', userID], () => { console.log("insert" + i) });

                        if (data[i].notifications.length > 0) {
                            var notificationObj = data[i].notifications
                            for (let j = 0; j < notificationObj.length; j++) {
                                tx.executeSql('INSERT INTO NOTIFICATION_MASTER (notificationId, alertId, notificationName, notificationDate, LAST_UPDATED_DATETIME, userID) VALUES (?,?, ?, ? , ?, ?);',
                                    [notificationObj[j].notification_id,
                                    data[i].alert_id,
                                    notificationObj[j].notification_name,
                                    notificationObj[j].notification_date,
                                        '', userID], () => { console.log("insert" + j) });

                                if (notificationObj[j].documents.length > 0) {
                                    var documentObj = notificationObj[j].documents
                                    for (let k = 0; k < documentObj.length; k++) {
                                        tx.executeSql('INSERT INTO DOCUMENT_MASTER (idrac, notificationId, title, comments, region, regulatoryAbstract, regulatoryDateForceDisplay, status, docType, LAST_UPDATED_DATETIME,topic,medicalDeviceSpecialty , version, languages, source , dateDisplay, FAVOURITE, IS_READ, PDF_LOCATION, userID) VALUES (?,?,?,?,?,?,?,?,?,?, ?, ?,? , ?,?,?, ?, ? ,?, ?);',
                                            [documentObj[k].idrac,
                                            notificationObj[j].notification_id,
                                            documentObj[k].regulatorySnapshotOutput.title,
                                            documentObj[k].regulatorySnapshotOutput.comments,
                                            documentObj[k].regulatorySnapshotOutput.region,
                                            documentObj[k].regulatorySnapshotOutput.regulatoryAbstract,
                                            documentObj[k].regulatorySnapshotOutput.regulatoryDateForceDisplay,
                                            documentObj[k].regulatorySnapshotOutput.status,
                                            documentObj[k].regulatorySnapshotOutput.docType,
                                            documentObj[k].regulatorySnapshotOutput.updatedDate,
                                            documentObj[k].regulatorySnapshotOutput.topic,
                                            documentObj[k].regulatorySnapshotOutput.medicalDeviceSpecialty,
                                            documentObj[k].regulatorySnapshotOutput.version,
                                            documentObj[k].regulatorySnapshotOutput.languages,
                                            documentObj[k].regulatorySnapshotOutput.source,
                                            documentObj[k].regulatorySnapshotOutput.dateDisplay,
                                                'N', 'N', '', userID], () => { console.log("insert" + k) });
                                    }

                                }

                            }

                        }
                    }
                }).then(
                    () => {
                        resolve(true)
                    }
                )
            })
        })
    }


    //delete the alerts in the db

    deleteAlertDB = (id, userID) => {
        return new Promise((resolve, reject) => {
            this.getDatabase().then((db) => {
                db.transaction((tx) => {
                    var len = id.length
                    for (let i = 0; i < len; i++) {
                        tx.executeSql('DELETE FROM ALERT_MASTER WHERE alertId=? and userID=?;',
                            [id[i], userID], () => { console.log("deleted alert with id==" + id) });

                    }

                }).then(
                    () => {
                        resolve(true)
                    }
                ).catch(() => {
                    reject(false)
                })
            })
        })
    }

    updateAlertDB = (alertId, updatedName, userID) => {
        return new Promise((resolve, reject) => {
            this.getDatabase().then((db) => {
                db.transaction((tx) => {
                    let updateQuery = "UPDATE ALERT_MASTER SET alertName=? WHERE alertId=? and userID=?;";
                    tx.executeSql(updateQuery, [updatedName, alertId, userID],
                        () => { console.log("updated alert with id " + alertId) }
                    )
                }).then(
                    () => {
                        resolve(true)
                    }
                ).catch(() => {
                    reject(false)
                })
            })
        })
    }
    //retrieve alerts from db
    getAlertItems = (userID) => {
        return new Promise((resolve, reject) => {

            this.getDatabase().then((db) => {
                db.executeSql('SELECT '
                    + 'ALERT_MASTER.alertId AS alertId, '
                    + 'ALERT_MASTER.alertName AS alertName, '
                    + 'ALERT_MASTER.alertTimestamp AS alertTimestamp, '
                    + 'ALERT_MASTER.prodCategories AS prodCategories, '
                    + 'ALERT_MASTER.topics AS topics, '
                    + 'ALERT_MASTER.regions AS regions, '
                    + 'ALERT_MASTER.docCategories AS docCategories, '
                    + 'ALERT_MASTER.docTypes AS docTypes, '
                    + 'ALERT_MASTER.isNew AS isNew '
                    + 'FROM '
                    + 'ALERT_MASTER where userID=?;',
                    [userID]
                ).then(async ([results]) => {
                    let alertArr = []

                    if (results === undefined) {
                        return [];
                    }
                    const count = results.rows.length;

                    for (let i = 0; i < count; i++) {
                        let notificationArr = []
                        const row = results.rows.item(i);

                        await db.executeSql('SELECT '
                            + 'NOTIFICATION_MASTER.notificationId AS notificationId, '
                            + 'NOTIFICATION_MASTER.alertId AS alertId, '
                            + 'NOTIFICATION_MASTER.notificationName AS notificationName, '
                            + 'NOTIFICATION_MASTER.notificationDate AS notificationDate '
                            + 'FROM '
                            + 'NOTIFICATION_MASTER where alertId=? and userID=?;',
                            [row.alertId, userID]
                        ).then(async ([results]) => {

                            if (results === undefined) {
                                return [];
                            }
                            const len = results.rows.length;

                            for (let j = 0; j < len; j++) {
                                let documentArr = []
                                const row1 = results.rows.item(j);

                                await db.executeSql('SELECT '
                                    + 'DOCUMENT_MASTER.idrac AS idrac, '
                                    + 'DOCUMENT_MASTER.title AS title, '
                                    + 'DOCUMENT_MASTER.comments AS comments, '
                                    + 'DOCUMENT_MASTER.region AS region, '
                                    + 'DOCUMENT_MASTER.regulatoryAbstract AS regulatoryAbstract, '
                                    + 'DOCUMENT_MASTER.regulatoryDateForceDisplay AS regulatoryDateForceDisplay, '
                                    + 'DOCUMENT_MASTER.status AS status, '
                                    + 'DOCUMENT_MASTER.docType AS docType, '
                                    + 'DOCUMENT_MASTER.LAST_UPDATED_DATETIME AS updatedDate, '
                                    + 'DOCUMENT_MASTER.IS_READ AS isRead, '
                                    + 'DOCUMENT_MASTER.PDF_LOCATION AS pdfLocation, '
                                    + 'DOCUMENT_MASTER.topic AS topic, '
                                    + 'DOCUMENT_MASTER.medicalDeviceSpecialty AS medicalDeviceSpecialty, '
                                    + 'DOCUMENT_MASTER.version AS version, '
                                    + 'DOCUMENT_MASTER.languages AS languages, '
                                    + 'DOCUMENT_MASTER.source AS source, '
                                    + 'DOCUMENT_MASTER.dateDisplay AS dateDisplay '
                                    + 'FROM '
                                    + 'DOCUMENT_MASTER where notificationId=? and userID=?;',
                                    [row1.notificationId, userID]
                                ).then(([results]) => {

                                    const length = results.rows.length;

                                    for (let k = 0; k < length; k++) {

                                        const row2 = results.rows.item(k);
                                        const regSnapshot = new RegulatorySnapshotOutput(row2)
                                        row2.regulatorySnapshotOutput = regSnapshot
                                        const docObj = new documents(row2)
                                        documentArr.push(docObj)
                                    }
                                    row1.documents = documentArr
                                    const notificationObj = new Notification(row1)
                                    notificationArr.push(notificationObj)
                                })
                            }
                        }).catch((err) => console.log(err))
                        notificationArr.sort((a, b) => new Moment(getDateFromTimestamp(b.notificationDate)).format('YYYYMMDD') - new Moment(getDateFromTimestamp(a.notificationDate)).format('YYYYMMDD'))
                        row.notifications = notificationArr
                        const alertObj = new Alert(row)
                        alertArr.push(alertObj)
                    }
                    alertArr.sort((a, b) => new Moment(b.alertTimestamp, 'DD-MMM-YY hh:mm:ss a') - new Moment(a.alertTimestamp, 'DD-MMM-YY hh:mm:ss a'))
                    resolve(alertArr)
                }).catch((err) => console.log(err))
            })
        })

    }

    // ************* new update ********************

    //update favourites
    updateAlertOnLogout = (alerts, userID) => {
        return new Promise((resolve, reject) => {
            this.getDatabase().then((db) => {
                db.transaction((tx) => {
                    let alertIDsetAPI = []
                    for (var k = 0; k < alerts.length; k++) {
                        let alert = alerts[k];
                        alertIDsetAPI.push(alert.alert_id)
                    }

                    let selectQuery = "SELECT alertId FROM ALERT_MASTER WHERE userID='" + userID + "'";
                    tx.executeSql(selectQuery, []).then(async (results) => {
                        // idetify exising alerts in alert master
                        var alertIDsetDB = []
                        const length = results[1].rows.length;
                        for (var i = 0; i < length; i++) {
                            alertIDsetDB.push(results[1].rows.item(i).alertId)
                        }

                        var updateAlertSet = []
                        var insertAlertSet = []
                        var deleteAlertSet = []
                        //first check if the set2 items are inside the alert
                        updateAlertSet = alertIDsetDB.filter(item => alertIDsetAPI.includes(item))
                        deleteAlertSet = alertIDsetDB.filter(item => !alertIDsetAPI.includes(item))
                        insertAlertSet = alertIDsetAPI.filter(item => !updateAlertSet.includes(item));

                        let updateFinalSet = alerts.filter(item => updateAlertSet.includes(item.alert_id))
                        let insertFinalSet = alerts.filter(item => insertAlertSet.includes(item.alert_id))

                        // now call insertion and updation 
                        this.UpdateAlert(updateFinalSet, userID).then((res) => {
                            if (res) {
                                this.insertAlert(insertFinalSet, userID).then((result) => {
                                    if (result) {
                                        this.deleteAlertDB(deleteAlertSet, userID).then((finalRes) => {
                                            if (finalRes) {
                                                resolve()
                                            } else {
                                                reject()
                                            }
                                        })
                                    } else {
                                        reject()
                                    }
                                })
                            } else {
                                reject()
                            }
                        })
                    })
                })
            })
        })
    }

    // ************************************************

    //update Document read/unread status
    markRead = (idrac, userID, NotificationID) => {
        return new Promise((resolve, reject) => {
            this.getDatabase().then((db) => {
                db.transaction((tx) => {
                    if (typeof NotificationID == 'undefined') {
                        let updateQuery = "UPDATE DOCUMENT_MASTER SET IS_READ='Y' WHERE idrac = '" + idrac + "' and userID='" + userID + "' ;";
                        tx.executeSql(updateQuery, [])

                    } else {
                        let updateQuery = "UPDATE DOCUMENT_MASTER SET IS_READ='Y' WHERE idrac = '" + idrac + "' and notificationId='" + NotificationID + "' and userID='" + userID + "' ;";
                        tx.executeSql(updateQuery, [])

                    }
                }).then(() => resolve(true))
            })
        })
    }

    //update alert read/unread status
    markAlertRead = (alertID, userID) => {
        return new Promise((resolve, reject) => {
            this.getDatabase().then((db) => {
                db.transaction((tx) => {
                    let updateQuery = "UPDATE ALERT_MASTER SET isNew='N' WHERE alertId = ? and userID=?";
                    tx.executeSql(updateQuery, [alertID, userID],
                        () => { console.log("alert id " + alertID + "is read Now") }
                    ).then(() => { resolve(true) })
                })
            })
        })
    }

    //update Document pdf location
    addPdfLocation = (idrac, location, userID) => {
        return new Promise((resolve, reject) => {
            this.getDatabase().then((db) => {
                db.transaction((tx) => {
                    let updateQuery = "UPDATE DOCUMENT_MASTER SET PDF_LOCATION = '" + location + "' WHERE IDRAC = '" + idrac + "' and userID = '" + userID + "'";
                    // let updateQuery = "UPDATE DOCUMENT_MASTER SET PDF_LOCATION=? WHERE idrac = ?";
                    tx.executeSql(updateQuery, [])
                }).then(() => resolve(true))
            })
        })
    }

    // get pdf location
    retreivePDFLocation = (idrac, userID) => {
        return new Promise((resolve, reject) => {
            this.getDatabase().then((db) => {
                let query = "SELECT DISTINCT DOCUMENT_MASTER.PDF_LOCATION AS PDF_LOCATION FROM DOCUMENT_MASTER where IDRAC = '" + idrac + "' and userID ='" + userID + "'";
                db.executeSql(query,
                    []
                ).then(([results]) => {
                    const length = results.rows.length;
                    if (length > 0) {
                        if (results.rows.item(0).PDF_LOCATION !== "") {
                            resolve(results.rows.item(0).PDF_LOCATION)
                        } else {
                            reject(false)
                        }
                    } else {
                        reject()
                    }
                })
            })
        })
    }

    insertDocuments = (documents, userID) => {
        return new Promise((resolve, reject) => {
            if (documents.length == 0) {
                resolve(true)
            } else {

                this.getDatabase().then((db) => {
                    db.transaction((tx) => {
                        var bigQuery = ''
                        var parameters = []
                        var batchInsertQuery = "INSERT INTO DOCUMENT_MASTER VALUES "
                        for (i = 0; i < documents.length; i++) {
                            bigQuery += "(?,?,?,?,?,?,?,?,?, ?, ?,? , ?,?,?, ?, ? , ?,?,?)"
                            parameters.push(
                                documents[i].idrac,
                                '',
                                documents[i].regulatorySnapshotOutput.title,
                                documents[i].regulatorySnapshotOutput.comments,
                                documents[i].regulatorySnapshotOutput.region,
                                documents[i].regulatorySnapshotOutput.regulatoryAbstract,
                                documents[i].regulatorySnapshotOutput.regulatoryDateForceDisplay,
                                documents[i].regulatorySnapshotOutput.status,
                                documents[i].regulatorySnapshotOutput.docType,
                                documents[i].regulatorySnapshotOutput.updatedDate,
                                'Y',
                                'N',
                                '',
                                documents[i].regulatorySnapshotOutput.topic,
                                documents[i].regulatorySnapshotOutput.medicalDeviceSpecialty,
                                documents[i].regulatorySnapshotOutput.version,
                                documents[i].regulatorySnapshotOutput.languages,
                                documents[i].regulatorySnapshotOutput.source,
                                documents[i].regulatorySnapshotOutput.dateDisplay,
                                userID
                            )

                            // insert the batch
                            if (parameters.length == 500) {
                                tx.executeSql(batchInsertQuery + bigQuery + ';', parameters);
                                parameters = [];
                                bigQuery = '';
                            } else {
                                bigQuery += ",";
                            }
                        }
                        // send the rest of it
                        if (bigQuery != "") {
                            var slicedbigQuery = bigQuery.slice(0, -1)
                            tx.executeSql(batchInsertQuery + slicedbigQuery + ";", parameters,
                                (tx, resultSet) => {
                                    resolve(true)
                                },
                                (tx, error) => {
                                    console.log(error)
                                    reject(false)
                                }
                            );
                        }
                        else {
                            resolve(true)
                        }
                    })
                })
            }

        });
    }

    updateDocuments = (documents, updateFlag, userID) => {
        return new Promise((resolve, reject) => {
            this.getDatabase().then((db) => {
                let flag = updateFlag == true ? 'Y' : 'N'
                db.transaction((tx) => {
                    for (i = 0; i < documents.length; i++) {
                        let document = documents[i]
                        let updateQuery = "UPDATE DOCUMENT_MASTER SET FAVOURITE = '" + flag + "' WHERE IDRAC = '" + document.idrac + "' and userID = '" + userID + "' and LAST_UPDATED_DATETIME = '" + document.regulatorySnapshotOutput.updatedDate + "'";
                        tx.executeSql(updateQuery, [])
                    }
                }).then(() => {
                    resolve(true)
                }).catch(error => {
                    resolve(false)
                })
            })
        })
    }

    updateInsertCitedByDocuments = (documents, updateFlag, userID) => {
        return new Promise((resolve, reject) => {
            this.getDatabase().then((db) => {
                for (i = 0; i < documents.length; i++) {
                    let document = documents[i]
                    db.executeSql('SELECT * FROM DOCUMENT_MASTER WHERE idrac=? and userID=?;',
                        [document.idrac, userID]).then(async ([results]) => {
                            const length = results.rows.length;
                            if (length > 0) {
                                await this.updateDocuments(documents, updateFlag, userID)
                                resolve(true)
                            } else {
                                await this.insertSingleDocument(documents, userID, db)
                                resolve(true)
                            }
                        })
                }
            })
        })
    }

    insertSingleDocument = (documents, userID, db) => {
        return new Promise((resolve, reject) => {
            for (i = 0; i < documents.length; i++) {
                let documentItem = documents[i]
                db.executeSql('INSERT INTO DOCUMENT_MASTER (idrac, notificationId, title, comments, region, regulatoryAbstract, regulatoryDateForceDisplay, status, docType, LAST_UPDATED_DATETIME,topic,medicalDeviceSpecialty , version, languages, source , dateDisplay, FAVOURITE, IS_READ, PDF_LOCATION, userID) VALUES (?,?,?,?,?,?,?,?,?, ?, ?,? , ?,?,?, ?, ? , ?,?, ?);',
                    [documentItem.idrac,
                        '',
                    documentItem.regulatorySnapshotOutput.title,
                    documentItem.regulatorySnapshotOutput.comments,
                    documentItem.regulatorySnapshotOutput.region,
                    documentItem.regulatorySnapshotOutput.regulatoryAbstract,
                    documentItem.regulatorySnapshotOutput.regulatoryDateForceDisplay,
                    documentItem.regulatorySnapshotOutput.status,
                    documentItem.regulatorySnapshotOutput.docType,
                    documentItem.regulatorySnapshotOutput.updatedDate,
                    documentItem.regulatorySnapshotOutput.topic,
                    documentItem.regulatorySnapshotOutput.medicalDeviceSpecialty,
                    documentItem.regulatorySnapshotOutput.version,
                    documentItem.regulatorySnapshotOutput.languages,
                    documentItem.regulatorySnapshotOutput.source,
                    documentItem.regulatorySnapshotOutput.dateDisplay,
                        'Y', 'Y', '', userID]).then(([results]) => resolve())

            }
        })
    }

    removeFavouritesIfAny = (documents, userID) => {
        return new Promise((resolve, reject) => {
            this.getDatabase().then((db) => {
                db.transaction((tx) => {
                    let updateQuery = "UPDATE DOCUMENT_MASTER SET FAVOURITE = 'N' WHERE userID='" + userID + "' AND IDRAC IN (SELECT IDRAC FROM DOCUMENT_MASTER WHERE IDRAC NOT IN (" + documents + ") and userID='" + userID + "')"
                    tx.executeSql(updateQuery, [])

                }).then(() => {
                    resolve(true)
                }).catch(error => {
                    resolve(false)
                })
            })
        })
    }

    //update favourites
    updateFavourites = (documents, userID) => {
        return new Promise((resolve, reject) => {
            this.getDatabase().then((db) => {
                db.transaction((tx) => {
                    let documentIdSet1 = ''
                    for (var k = 0; k < documents.length; k++) {
                        let document = documents[k];
                        documentIdSet1 += "'" + document.idrac + "'";
                        if (k != documents.length - 1) {
                            documentIdSet1 += ",";
                        }
                    }

                    let selectQuery = 'SELECT * FROM DOCUMENT_MASTER WHERE IDRAC IN (' + documentIdSet1 + ') and userID=' + "'" + userID + "'";
                    tx.executeSql(selectQuery, []).then(async (results) => {
                        // idetify exising documents in document master
                        var documentIdSet2 = []
                        const length = results[1].rows.length;
                        for (var i = 0; i < length; i++) {
                            var element = results[1].rows.item(i);
                            documentIdSet2.push({
                                documentId: element.idrac,
                                lastUpdatedDateTime: element.LAST_UPDATED_DATETIME
                            })
                        }

                        var updateDocumentSet = []
                        var insertDocumentSet = []
                        // identify documents for insertion and updation
                        for (var j = 0; j < documents.length; j++) {
                            let targetDocument = documents[j]
                            const objectToCompare = {
                                documentId: targetDocument.idrac,
                                lastUpdatedDateTime: targetDocument.regulatorySnapshotOutput.updatedDate
                            }
                            var matchesIdRac = documentIdSet2.find(function (currentDocument) {
                                return (currentDocument.documentId == objectToCompare.documentId) &&
                                    (currentDocument.lastUpdatedDateTime == objectToCompare.lastUpdatedDateTime)
                            })

                            if (matchesIdRac != undefined) {
                                // mark for updation                                    
                                updateDocumentSet.push(targetDocument);
                            }
                            else {
                                // mark for insertion
                                insertDocumentSet.push(targetDocument);
                            }
                        }

                        // now call insertion and updation 
                        this.updateDocuments(updateDocumentSet, true, userID).then((res) => {
                            if (res) {
                                this.insertDocuments(insertDocumentSet, userID).then((result) => {
                                    if (result) {
                                        this.removeFavouritesIfAny(documentIdSet1, userID).then((finalRes) => {
                                            if (finalRes) {
                                                resolve()
                                            } else {
                                                reject()
                                            }
                                        })
                                    } else {
                                        reject()
                                    }
                                })
                            } else {
                                reject()
                            }
                        })
                    })
                })
            })
        })
    }

    //delete favourites
    deleteFavourites = (data, userID) => {
        return new Promise((resolve, reject) => {
            this.getDatabase().then((db) => {
                db.transaction((tx) => {
                    var len = data.length;
                    for (let i = 0; i < len; i++) {
                        let idrac = data[i]
                        let updateQuery = "UPDATE DOCUMENT_MASTER SET FAVOURITE='N' WHERE idrac = ? and userID=?";
                        tx.executeSql(updateQuery, [idrac, userID],
                            () => { console.log("idrac number " + idrac + "is Not Fav Now") }
                        )
                    }
                }).then(
                    () => {
                        resolve(true)
                    }
                ).catch((err) => {
                    reject(err)
                })
            })
        })
    }

    //Retreive Favourites
    retrieveFavourites = (userID) => {
        return new Promise((resolve, reject) => {
            this.getDatabase().then((db) => {
                db.executeSql('SELECT DISTINCT '
                    + 'DOCUMENT_MASTER.idrac AS idrac, '
                    + 'DOCUMENT_MASTER.title AS title, '
                    + 'DOCUMENT_MASTER.comments AS comments, '
                    + 'DOCUMENT_MASTER.region AS region, '
                    + 'DOCUMENT_MASTER.regulatoryAbstract AS regulatoryAbstract, '
                    + 'DOCUMENT_MASTER.regulatoryDateForceDisplay AS regulatoryDateForceDisplay, '
                    + 'DOCUMENT_MASTER.status AS status, '
                    + 'DOCUMENT_MASTER.docType AS docType, '
                    + 'DOCUMENT_MASTER.LAST_UPDATED_DATETIME AS updatedDate, '
                    + 'DOCUMENT_MASTER.FAVOURITE AS isFavourite, '
                    + 'DOCUMENT_MASTER.topic AS topic, '
                    + 'DOCUMENT_MASTER.medicalDeviceSpecialty AS medicalDeviceSpecialty, '
                    + 'DOCUMENT_MASTER.version AS version, '
                    + 'DOCUMENT_MASTER.languages AS languages, '
                    + 'DOCUMENT_MASTER.source AS source, '
                    + 'DOCUMENT_MASTER.IS_READ AS isRead, '
                    + 'DOCUMENT_MASTER.dateDisplay AS dateDisplay '
                    + 'FROM '
                    + 'DOCUMENT_MASTER where FAVOURITE=? and userID=?;',
                    ['Y', userID]
                ).then(([results]) => {
                    const length = results.rows.length;
                    let documentArr = []
                    for (let k = 0; k < length; k++) {
                        const row = results.rows.item(k);
                        const regSnapshot = new RegulatorySnapshotOutput(row)
                        row.regulatorySnapshotOutput = regSnapshot
                        const docObj = new documents(row)
                        documentArr.push(docObj)
                    }

                    uniqueDocuments = _.uniqBy(documentArr, function (e) {
                        return e.idrac;
                    });


                    resolve(uniqueDocuments)
                })
            })
        })
    }

    GetDocumentObject = (documentID, userID) => {
        return new Promise((resolve, reject) => {
            this.getDatabase().then((db) => {
                db.executeSql('SELECT DISTINCT '
                    + 'DOCUMENT_MASTER.idrac AS idrac, '
                    + 'DOCUMENT_MASTER.title AS title, '
                    + 'DOCUMENT_MASTER.comments AS comments, '
                    + 'DOCUMENT_MASTER.region AS region, '
                    + 'DOCUMENT_MASTER.regulatoryAbstract AS regulatoryAbstract, '
                    + 'DOCUMENT_MASTER.regulatoryDateForceDisplay AS regulatoryDateForceDisplay, '
                    + 'DOCUMENT_MASTER.status AS status, '
                    + 'DOCUMENT_MASTER.docType AS docType, '
                    + 'DOCUMENT_MASTER.LAST_UPDATED_DATETIME AS updatedDate, '
                    + 'DOCUMENT_MASTER.FAVOURITE AS isFavourite, '
                    + 'DOCUMENT_MASTER.topic AS topic, '
                    + 'DOCUMENT_MASTER.medicalDeviceSpecialty AS medicalDeviceSpecialty, '
                    + 'DOCUMENT_MASTER.version AS version, '
                    + 'DOCUMENT_MASTER.languages AS languages, '
                    + 'DOCUMENT_MASTER.source AS source, '
                    + 'DOCUMENT_MASTER.IS_READ AS isRead, '
                    + 'DOCUMENT_MASTER.dateDisplay AS dateDisplay '
                    + 'FROM '
                    + 'DOCUMENT_MASTER where idrac = "' + documentID + ' and userID = "' + userID + '"',
                    []
                ).then(([results]) => {
                    const length = results.rows.length;
                    if (length > 0) {
                        const row = results.rows.item(0);
                        const regSnapshot = new RegulatorySnapshotOutput(row)
                        row.regulatorySnapshotOutput = regSnapshot
                        const docObj = new documents(row)
                        resolve(docObj)
                    } else {
                        reject("Unable to find the document")
                    }
                })
            })
        })
    }

    checkForFavDocument = (idrac, userID) => {
        return new Promise((resolve, reject) => {
            this.getDatabase().then((db) => {
                favFlag = 'Y'
                let query = "SELECT IDRAC FROM DOCUMENT_MASTER WHERE IDRAC='" + idrac + "' AND userID ='" + userID + "' AND FAVOURITE='" + favFlag + "'"
                db.executeSql(query, []).then(([results]) => {
                    const length = results.rows.length;
                    if (length > 0) {
                        resolve(true)
                    } else {
                        resolve(false)
                    }
                })
            })
        })
    }

    getAlertItemUsingAlertId = (AlertID, userID) => {
        return new Promise((resolve, reject) => {

            this.getDatabase().then((db) => {
                db.executeSql('SELECT '
                    + 'ALERT_MASTER.alertId AS alertId, '
                    + 'ALERT_MASTER.alertName AS alertName, '
                    + 'ALERT_MASTER.alertTimestamp AS alertTimestamp, '
                    + 'ALERT_MASTER.prodCategories AS prodCategories, '
                    + 'ALERT_MASTER.topics AS topics, '
                    + 'ALERT_MASTER.regions AS regions, '
                    + 'ALERT_MASTER.docCategories AS docCategories, '
                    + 'ALERT_MASTER.docTypes AS docTypes, '
                    + 'ALERT_MASTER.isNew AS isNew '
                    + 'FROM '
                    + 'ALERT_MASTER where userID=? and alertId=?;',
                    [userID, AlertID]
                ).then(async ([results]) => {
                    let alertArr = []

                    if (results === undefined) {
                        return [];
                    }
                    const count = results.rows.length;

                    for (let i = 0; i < count; i++) {
                        let notificationArr = []
                        const row = results.rows.item(i);

                        await db.executeSql('SELECT '
                            + 'NOTIFICATION_MASTER.notificationId AS notificationId, '
                            + 'NOTIFICATION_MASTER.alertId AS alertId, '
                            + 'NOTIFICATION_MASTER.notificationName AS notificationName, '
                            + 'NOTIFICATION_MASTER.notificationDate AS notificationDate '
                            + 'FROM '
                            + 'NOTIFICATION_MASTER where alertId=? and userID=?;',
                            [row.alertId, userID]
                        ).then(async ([results]) => {

                            if (results === undefined) {
                                return [];
                            }
                            const len = results.rows.length;

                            for (let j = 0; j < len; j++) {
                                let documentArr = []
                                const row1 = results.rows.item(j);

                                await db.executeSql('SELECT '
                                    + 'DOCUMENT_MASTER.idrac AS idrac, '
                                    + 'DOCUMENT_MASTER.title AS title, '
                                    + 'DOCUMENT_MASTER.comments AS comments, '
                                    + 'DOCUMENT_MASTER.region AS region, '
                                    + 'DOCUMENT_MASTER.regulatoryAbstract AS regulatoryAbstract, '
                                    + 'DOCUMENT_MASTER.regulatoryDateForceDisplay AS regulatoryDateForceDisplay, '
                                    + 'DOCUMENT_MASTER.status AS status, '
                                    + 'DOCUMENT_MASTER.docType AS docType, '
                                    + 'DOCUMENT_MASTER.LAST_UPDATED_DATETIME AS updatedDate, '
                                    + 'DOCUMENT_MASTER.IS_READ AS isRead, '
                                    + 'DOCUMENT_MASTER.PDF_LOCATION AS pdfLocation, '
                                    + 'DOCUMENT_MASTER.topic AS topic, '
                                    + 'DOCUMENT_MASTER.medicalDeviceSpecialty AS medicalDeviceSpecialty, '
                                    + 'DOCUMENT_MASTER.version AS version, '
                                    + 'DOCUMENT_MASTER.languages AS languages, '
                                    + 'DOCUMENT_MASTER.source AS source, '
                                    + 'DOCUMENT_MASTER.dateDisplay AS dateDisplay '
                                    + 'FROM '
                                    + 'DOCUMENT_MASTER where notificationId=? and userID=?;',
                                    [row1.notificationId, userID]
                                ).then(([results]) => {

                                    const length = results.rows.length;

                                    for (let k = 0; k < length; k++) {

                                        const row2 = results.rows.item(k);
                                        const regSnapshot = new RegulatorySnapshotOutput(row2)
                                        row2.regulatorySnapshotOutput = regSnapshot
                                        const docObj = new documents(row2)
                                        documentArr.push(docObj)
                                    }
                                    row1.documents = documentArr
                                    const notificationObj = new Notification(row1)
                                    notificationArr.push(notificationObj)
                                })
                            }
                        }).catch((err) => console.log(err))
                        notificationArr.sort((a, b) => new Moment(getDateFromTimestamp(b.notificationDate)).format('YYYYMMDD') - new Moment(getDateFromTimestamp(a.notificationDate)).format('YYYYMMDD'))
                        row.notifications = notificationArr
                        const alertObj = new Alert(row)
                        alertArr.push(alertObj)
                    }
                    alertArr.sort((a, b) => new Moment(b.alertTimestamp, 'DD-MMM-YY hh:mm:ss a') - new Moment(a.alertTimestamp, 'DD-MMM-YY hh:mm:ss a'))
                    resolve(alertArr)
                }).catch((err) => console.log(err))
            })
        })

    }
    // clearDB = () => {
    //     this.getDatabase().then((db) => {
    //         db.transaction((tx) => {
    //             tx.executeSql('DELETE FROM ALERT_MASTER;').then(() => { console.log("deleted alert") })
    //             tx.executeSql('DELETE FROM NOTIFICATION_MASTER;').then(() => { console.log("deleted alert") })
    //             tx.executeSql('DELETE FROM DOCUMENT_MASTER;').then(() => { console.log("deleted alert") })

    //         }).catch((err) => alert(err))

    //     })
    // }

}

export const Database = new DatabaseHelper();