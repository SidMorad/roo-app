#!/bin/sh

sh patch.sh ios
ionic cordova build ios --prod --release
