#!/bin/sh

ionic cordova build ios
sh patch.sh
ionic cordova build ios --prod --release --buildConfig
