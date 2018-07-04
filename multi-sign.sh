#!/bin/sh

if [ -z "$1" ]; then
  echo "Usage: $0 VERSION - e.g. $0 1.7.17"
else
  ./sign.sh cafe
  cp platforms/android/app/build/outputs/apk/release/app-release.apk ~/Desktop/temp/roo/apks/roo-$1-cafe.apk

  ./sign.sh play
  cp platforms/android/app/build/outputs/apk/release/app-release.apk ~/Desktop/temp/roo/apks/roo-$1.apk
fi
