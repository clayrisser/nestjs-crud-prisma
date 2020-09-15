#!/bin/sh

ENV_PATH=$([ -z $1 ] && echo .env|| echo $1/.env)

_IFS="$IFS"
IFS=$'\n'
for line in $(cat $ENV_PATH)
do
  key=$(echo $line | sed "s/=.*$//" | sed "s/.*\(\s\|#\).*//")
  if [ -n "$key" ]; then
    value=$(eval echo \$$key)
    if [[ -z "$value" && -z "$(echo $line | grep -E "[^=]*=\"\"")" ]]; then
      export $line
    fi
  fi
done
IFS="$_IFS"
