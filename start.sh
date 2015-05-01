#!/bin/bash


ABSPATH=$(cd "$(dirname "$0")"; pwd)
if [ "$(uname)" == "Darwin" ]; then
    BROWSER=open
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    BROWSER=xdg-open
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ]; then
    # Do something under Windows NT platform
    echo
fi

PORT=8080


echo "CTRL-C to quit!"

(sleep 1;
echo "Launching game on your default browser";
$BROWSER http://localhost:$PORT;
echo "CTRL-C to quit!")&

(npm start)
