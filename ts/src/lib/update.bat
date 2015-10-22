@echo updating libraries...
@call curl -O https://raw.githubusercontent.com/vexator/TSM/master/TSM/tsm-0.7.js
@call curl -k -O https://raw.githubusercontent.com/ccampbell/mousetrap/master/mousetrap.js

@echo updating typescript definition files...
@call curl -O https://raw.githubusercontent.com/vexator/TSM/master/TSM/tsm-0.7.d.ts
@call curl -k -O https://raw.githubusercontent.com/borisyankov/DefinitelyTyped/master/mousetrap/mousetrap.d.ts

@echo all done.
