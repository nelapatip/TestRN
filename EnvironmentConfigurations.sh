#!/usr/bin/env bash

echo "[CORTELLIS_CONFIGURATIONS] - Starting..."


GOOGLE_SERVICES_PROD_FILE='android/app/google-services.json'
GOOGLE_SERVICES_DEV_FILE='android/app/google-services-dev.json'
# GOOGLE_SERVICES_STG_FILE='android/app/google-services-prod.json'

GOOGLE_SERVICE_INFO_PROD_FILE='ios/GoogleService-Info.plist'
GOOGLE_SERVICES_INFO_DEV_FILE='ios/GoogleService-Info-dev.plist'
# GOOGLE_SERVICES_INFO_STG_FILE='ios/GoogleService-Info-prod.plist'

CONFIGURATIONS_FILE="./src/configurations/configurations.js"

#Clearing the content of file
> $CONFIGURATIONS_FILE
echo "[CORTELLIS_CONFIGURATIONS] - File contents cleared"


echo "[CORTELLIS_CONFIGURATIONS] - Setting up configurations for $1 environment"

# setup configurations for DEV
if [ "$1" == 'DEV' ]; then
cat >> $CONFIGURATIONS_FILE <<EOL  
export const LoginPageURL = 'https://snapshot.cortellis.int.clarivate.com/mobile-login/login.html'
export const BaseURL = 'https://stable-api.cortellis.int.clarivate.com/'
export const EnvironmentForPushNotification='DEV'
export const RequestDemoURL = 'https://clarivate.com/specialty/regulatory-affairs/contact-us'
EOL

# rename google-services-stg.json to google-services.json and vice versa
cat ${GOOGLE_SERVICES_DEV_FILE} >> ${GOOGLE_SERVICES_PROD_FILE}
cat ${GOOGLE_SERVICE_INFO_DEV_FILE} >> ${GOOGLE_SERVICE_INFO_PROD_FILE}

# setup configurations for QA
elif [ "$1" == 'STG' ]; then
cat >> $CONFIGURATIONS_FILE <<EOL  
export const LoginPageURL = 'https://stable.cortellis.int.clarivate.com/mobile-login/login.html'
export const BaseURL = 'https://api.cortellis.com/'
export const EnvironmentForPushNotification='QA'
export const RequestDemoURL = 'https://clarivate.com/specialty/regulatory-affairs/contact-us'
EOL
# mv  "${GOOGLE_SERVICES_PROD_FILE}" "${GOOGLE_SERVICES_STG_FILE}"

# setup configurations for PROD
else
cat >> $CONFIGURATIONS_FILE <<EOL  
export const LoginPageURL = 'https://stable.cortellis.int.clarivate.com/mobile-login/login1.html'
export const BaseURL = 'https://api.cortellis.com/'
export const EnvironmentForPushNotification='PROD'
export const RequestDemoURL = 'https://clarivate.com/specialty/regulatory-affairs/contact-us'

EOL

fi


# Change BundleID/PackageName for iOS/Android builds
# For Android, change the PackageName located in MainActivity.java, MainApplication.java, app/build.gradle, AndroidManifest.xml  
# For iOS, change the BundleID located in Info.plist.
# Use Environment Variable 'ENV' for the BundleID/PackageName
# DEV. Env.  | com.clarivate.cortellisrimobile.dev
# STG. Env.  | com.clarivate.cortellis.rimobileapp
# PROD. Env. | com.clarivate.cortellis.rimobileapp

if [ -n "$1" ] 
then
    # BUNDLE_IDENTIFIER='com.clarivate.cortellis.rimobileapp'
    BUNDLE_IDENTIFIER='com.clarivate.cortellisrimobile.dev'

    if [ "$1" != "PROD" ] 
    then
        # ENV_LOWERCASE=$(echo "$1" | tr '[:upper:]' '[:lower:]')
        BUNDLE_IDENTIFIER="$BUNDLE_IDENTIFIER"
    fi


    INFO_PLIST_FILE="./ios/cortellisMobile/Info.plist"
    BUILD_GRADLE_PATH='./android/app/build.gradle'
    MAIN_APPLICATION_FILE_PATH='./android/app/src/main/java/com/clarivate/cortellis/rimobileapp/MainApplication.java'
    MAIN_ACTIVITY_FILE_PATH='./android/app/src/main/java/com/clarivate/cortellis/rimobileapp/MainActivity.java'
    ANDROID_MANIFEST_FILE_PATH='./android/app/src/main/AndroidManifest.xml'

    if [ -e "$INFO_PLIST_FILE" ]
    then
        ######################## Changes on iOS
        echo "[ENV_CONFIG_SCRIPT] - Changing the Bundle ID on iOS to: $BUNDLE_IDENTIFIER"
        /usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier $BUNDLE_IDENTIFIER" $INFO_PLIST_FILE
    fi

    if [ -e "$ANDROID_MANIFEST_FILE_PATH" ]
    then
        ######################## Changes on Android
        echo "[ENV_CONFIG_SCRIPT] - Changing the Bundle ID on Android to: $BUNDLE_IDENTIFIER"
        sed -i '' 's/applicationId "[a-z.].*"/applicationId "'$BUNDLE_IDENTIFIER'"/' $BUILD_GRADLE_PATH                 
        sed -i '' 's/.*package [a-z.].*/package '$BUNDLE_IDENTIFIER';/' $MAIN_APPLICATION_FILE_PATH
        sed -i '' 's/.*package.*/package '$BUNDLE_IDENTIFIER';/' $MAIN_ACTIVITY_FILE_PATH               
        sed -i '' 's/.*package=.*/    package="'$BUNDLE_IDENTIFIER'">/' $ANDROID_MANIFEST_FILE_PATH
    fi
fi

  

echo "[CORTELLIS_CONFIGURATIONS] - Ended"

