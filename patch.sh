#!/bin/sh

cp patch/cordova-plugin-browsertab-plugin.xml plugins/cordova-plugin-browsertab/plugin.xml
cp patch/cordova-plugin-local-notification-plugin.xml plugins/cordova-plugin-local-notification/plugin.xml

if [ -z "$1" ]; then
  echo "No profile passed to $0, profile patch ignored!"
else
  cwd=$(pwd)
  if [ $1 = "play" ]; then
    ionic cordova platform rm android
    ionic cordova plugin rm com.smartmobilesoftware.androidinappbilling --varialbe BILLING_KEY="foo"
    cd /ws/javascript/AndroidInAppBilling
    git checkout -- .
    git checkout play
    cd "${cwd}"
    ionic cordova plugin add /ws/javascript/AndroidInAppBilling --variable BILLING_KEY="MIHNMA0GCSqGSIb3DQEBAQUAA4G7ADCBtwKBrwC+zFjRW1U4ZeQN6I3z3L5a5ormHIEa4Zfmz0zSaz4HeSJnbOqca6ybPXhqTmpRkR/Za2YgqH8q3gHUoE+3jTv9sw0/SM/yFO/iYJwCF3xHDR2GerOk6rjWbberP1HzAjhJa7JmwQWZ1YPlAZLKNfhZinGj7+qguHLqXMPKi5U2UumatC7P7Bnqqjh+Y1cb6IdfSfmCTxKxLt22etIM60EYeKy2YU3d7bmfbWQ9at0CAwEAAQ=="
    ionic cordova platform add android@7.1.0
    cp patch/cafe/billing_key_param.xml platforms/android/app/src/main/res/values/
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
    cp patch/cafe/billing_key_param.xml platforms/android/app/src/main/res/values/
  fi
fi
