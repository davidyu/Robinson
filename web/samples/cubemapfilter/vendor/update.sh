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
download http://hammerjs.github.io/dist/hammer.min.js hammer.min.js
download https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/hammerjs/hammerjs.d.ts hammerjs.d.ts
