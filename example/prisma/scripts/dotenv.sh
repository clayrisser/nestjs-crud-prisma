#!/bin/sh

_IFS="$IFS"
IFS=$'\n'
for line in $(cat .env)
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
