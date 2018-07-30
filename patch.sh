#!/bin/sh

cp patch/cordova-plugin-browsertab-plugin.xml plugins/cordova-plugin-browsertab/plugin.xml
cp patch/cordova-plugin-local-notification-plugin.xml plugins/cordova-plugin-local-notification/plugin.xml
cp patch/cordova-plugin-adad-plugin.xml plugins/cordova-plugin-adad/plugin.xml
# cp patch/AdadAd.java plugins/cordova-plugin-adad/src/android/
# rm plugins/cordova-plugin-adad/src/android/MilaDesignAdad.jar
cp patch/cordova-plugin-x-socialsharing-plugin.xml plugins/cordova-plugin-x-socialsharing/plugin.xml

if [ -z "$1" ]; then
  echo "No profile passed to $0, profile patch ignored!"
else
  cwd=$(pwd)
  if [ $1 = "play" ]; then
    ionic cordova platform rm android
    ionic cordova plugin rm com.smartmobilesoftware.androidinappbilling --varialbe BILLING_KEY="foo"
    # ionic cordova plugin add /ws/javascript/AndroidInAppBilling --variable BILLING_KEY="MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAj0ygf0Jqwof/R6EvAvA34A0egz43RLfeT+gEGMy+M2+blYey8qYQn5xm8RlIMj153tKHDjeZU3TWHhKFk3P8wy1V1AA7A+wQenQ7iPb1v5gxYOh3V1WkKbHvBbRK85Bx/vyBJC9ETntu8p0FgYGU2LKzZ0AY9LtHXXf4Sf5UdmzuYfSKnca8V2b3tQMXK0jcL5BaewzkwvQT5kpdLMycqR6t+mpHw3rhdaZbS1sX0uMLe6DWs4iC0s1sVU7x8nBXMJR3YMPhr2E9UXyNkHve5kcN3Ahu1l9WM7xsDt/HmfzYYn9zUpB3a3dTGcZTZYxZeSFRXIMSULPKiyC6Fy9uyQIDAQAB"
    ionic cordova platform add android@7.1.0
  fi
  if [ $1 = "ios" ]; then
    ionic cordova platform rm ios
    ionic cordova platform rm android
    ionic cordova plugin rm cordova-plugin-adad
    ionic cordova plugin rm cordova-plugin-local-notification
    ionic cordova plugin rm cordova-plugin-device
    ionic cordova platform add ios
  fi
  if [ $1 = "cafe" ]; then
    ionic cordova platform rm android
    ionic cordova plugin rm com.smartmobilesoftware.androidinappbilling --variable BILLING_KEY="foo"
    cd /ws/javascript/AndroidInAppBilling
    git checkout -- .
    git checkout cafebazaar
    cd "${cwd}"
    ionic cordova plugin add /ws/javascript/AndroidInAppBilling --variable BILLING_KEY="MIHNMA0GCSqGSIb3DQEBAQUAA4G7ADCBtwKBrwC+zFjRW1U4ZeQN6I3z3L5a5ormHIEa4Zfmz0zSaz4HeSJnbOqca6ybPXhqTmpRkR/Za2YgqH8q3gHUoE+3jTv9sw0/SM/yFO/iYJwCF3xHDR2GerOk6rjWbberP1HzAjhJa7JmwQWZ1YPlAZLKNfhZinGj7+qguHLqXMPKi5U2UumatC7P7Bnqqjh+Y1cb6IdfSfmCTxKxLt22etIM60EYeKy2YU3d7bmfbWQ9at0CAwEAAQ=="
    ionic cordova platform add android@7.1.0
  fi
fi
