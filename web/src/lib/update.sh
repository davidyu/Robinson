#!/bin/bash

# usage: download url target
# where target is the name of the local file target
download() {
    local url="$1"
    local target="$2"
    [ -f "$target" ] || curl -k "$url" -o "$target"
}

echo "updating vendor code..."

echo updating libraries...
download https://raw.githubusercontent.com/vexator/TSM/master/TSM/tsm-0.7.js tsm-0.7.js

echo updating typescript definition files...
download https://raw.githubusercontent.com/vexator/TSM/master/TSM/tsm-0.7.d.ts tsm-0.7.d.ts

echo all done.
