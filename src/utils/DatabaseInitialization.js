import SQLite from "react-native-sqlite-storage";

export class DatabaseInitialization {

    createTables = (tx) => {
        console.log("Executing DROP stmts");

        // tx.executeSql('DROP TABLE IF EXISTS ALERT_MASTER;');
        // tx.executeSql('DROP TABLE IF EXISTS NOTIFICATION_MASTER;');
        // tx.executeSql('DROP TABLE IF EXISTS DOCUMENT_MASTER;');

        console.log("Executing CREATE stmts");
        console.log("Executing ALERT_MASTER table");

        tx.executeSql('CREATE TABLE IF NOT EXISTS ALERT_MASTER( '
            + 'alertId TEXT , '
            + 'alertName TEXT, '
            + 'alertTimestamp TEXT, '
            + 'prodCategories TEXT, '
            + 'topics TEXT, '
            + 'regions TEXT, '
            + 'docCategories TEXT, '
            + 'docTypes TEXT, '
            + 'isNew TEXT, '
            + 'userID TEXT, '
            + 'LAST_UPDATED_DATETIME DATE);', []);

        console.log("Executing NOTIFICATION_MASTER table");

        tx.executeSql('CREATE TABLE IF NOT EXISTS NOTIFICATION_MASTER( '
            + 'notificationId TEXT , '
            + 'alertId TEXT, '
            + 'notificationName TEXT, '
            + 'notificationDate TEXT, '
            + 'LAST_UPDATED_DATETIME DATE, '
            + 'userID TEXT, '
            + 'FOREIGN KEY (alertId) REFERENCES ALERT_MASTER(alertId));', []);

        console.log("Executing DOCUMENT_MASTER table");

        
        tx.executeSql('CREATE TABLE IF NOT EXISTS DOCUMENT_MASTER( '
            + 'idrac TEXT , '
            + 'notificationId TEXT, '
            + 'title TEXT, '
            + 'comments TEXT, '
            + 'region TEXT, '
            + 'regulatoryAbstract TEXT, '
            + 'regulatoryDateForceDisplay TEXT, '
            + 'status TEXT, '
            + 'docType TEXT, '
            + 'LAST_UPDATED_DATETIME TEXT, '
            + 'FAVOURITE TEXT, '
            + 'IS_READ TEXT, '
            + 'PDF_LOCATION TEXT, '
            + 'topic TEXT, '
            + 'medicalDeviceSpecialty TEXT, '
            + 'version TEXT, '
            + 'languages TEXT, '
            + 'source TEXT, '
            + 'dateDisplay TEXT, '
            + 'userID TEXT, '
            + 'FOREIGN KEY (notificationId) REFERENCES NOTIFICATION_MASTER(notificationId ));', []);

        console.log("All tables are created !!!!!!");

    }
}