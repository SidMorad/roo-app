#!/bin/sh

if [ -z "$1" ]
  then
    echo "Usage: $0 PROFILE_NAME e.g. $0 play or $0 cafe"
  else
    if [ $1 = "play" ]; then
      cp src/environments/environment.play.ts src/environments/environment.ts
    fi
    if [ $1 = "cafe" ]; then
      cp src/environments/environment.cafe.ts src/environments/environment.ts
    fi
    if [ $1 = "aval" ]; then
      cp src/environments/environment.aval.ts src/environments/environment.ts
    fi
    if [ $1 = "iaps" ]; then
      cp src/environments/environment.iaps.ts src/environments/environment.ts
    fi
    sh patch.sh $1
    ionic cordova build android --prod --release --buildConfig
fi
