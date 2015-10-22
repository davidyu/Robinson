echo updating libraries...
curl -O https://raw.githubusercontent.com/vexator/TSM/master/TSM/tsm-0.7.js
curl -k -O https://raw.githubusercontent.com/ccampbell/mousetrap/master/mousetrap.js

echo updating typescript definition files...
curl -O https://raw.githubusercontent.com/vexator/TSM/master/TSM/tsm-0.7.d.ts
curl -k -O https://raw.githubusercontent.com/borisyankov/DefinitelyTyped/master/mousetrap/mousetrap.d.ts

echo all done.
