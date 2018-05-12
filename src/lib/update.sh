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

download https://raw.githubusercontent.com/ajaxorg/ace-builds/master/src-min-noconflict/ace.js ace.js
download https://raw.githubusercontent.com/ajaxorg/ace-builds/master/src-min-noconflict/mode-glsl.js mode-glsl.js
download https://raw.githubusercontent.com/ajaxorg/ace-builds/master/src-min-noconflict/theme-solarized_light.js theme-solarized_light.js
download https://raw.githubusercontent.com/ajaxorg/ace-builds/master/src-min-noconflict/theme-monokai.js theme-monokai.js

echo updating typescript definition files...

npm install @types/webgl2 --save
npm install @types/ace --save

echo all done.
