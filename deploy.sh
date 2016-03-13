#!/bin/bash

if [ ! -n "$1" ]; then
  echo "required parameter missing."
  exit 1
fi

if [ ! -d "$1"]; then
    echo "$1 director is not exist"
    exit 1
fi

cd $0

if [ $? != 0 ]; then
    echo "$1 Permission denied"
    exit 1
fi

echo "start deploy..."

#git add . -A && git stash
git pull origin master

if [ $? != 0 ]; then
    echo "$1 git pull error"
    exit 1
fi

echo "deploy finished."
exit 0