#!/bin/bash

# usage: download url target
# where target is the name of the local file target
download() {
    local url="$1"
    local target="$2"
    [ -f "$target" ] || curl -k "$url" -o "$target"
}

echo "updating vendor code..."

download https://raw.githubusercontent.com/ccampbell/mousetrap/master/mousetrap.js mousetrap.js
download https://raw.githubusercontent.com/borisyankov/DefinitelyTyped/master/mousetrap/mousetrap.d.ts mousetrap.d.ts
