#!/bin/bash

PYTHON_EXE=python
DEF_PORT=8080
SERV_DIR=game
PORT=$1

ABSPATH=$(cd "$(dirname "$0")"; pwd)
if [ "$(uname)" == "Darwin" ]; then
    BROWSER=open
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    BROWSER=xdg-open
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ]; then
    # Do something under Windows NT platform
    echo
fi

if [ "$PORT" == "" ]; then
    PORT=$DEF_PORT
fi

VERSION=`$PYTHON_EXE -c 'import sys; print(sys.version_info[0])'`

if [ "$VERSION" -eq "3" ]; then
    SERVER_MODULE="http.server"
elif [ "$VERSION" -eq "2" ]; then
    SERVER_MODULE="SimpleHTTPServer"
else
    echo "You don't have a recent version of python on your machine. Aborting."
    exit 1
fi

echo "CTRL-C to quit!"

(sleep 1;
echo "Launching game on your default browser";
$BROWSER http://localhost:$PORT;
echo "CTRL-C to quit!")&

(cd $ABSPATH/$SERV_DIR;
$PYTHON_EXE -m $SERVER_MODULE $PORT)
