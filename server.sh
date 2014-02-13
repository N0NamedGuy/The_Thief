#!/usr/bin/bash

PYTHON_EXE=python
DEF_PORT=8080
PORT=$1

if [ "$PORT" == "" ]; then
    PORT=$DEF_PORT
fi

VERSION=`$PYTHON_EXE -c 'import sys; print(sys.version_info[0])'`

if [ "$VERSION" -eq "3" ]; then
    SERVER_MODULE="http.server"
else
    SERVER_MODULE="SimpleHTTPServer"
fi

echo "CTRL-C to quit!"

cd game
$PYTHON_EXE -m $SERVER_MODULE $PORT
cd -
