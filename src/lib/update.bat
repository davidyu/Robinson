@echo updating libraries...

@call powershell -command "start-bitstransfer -source https://raw.githubusercontent.com/ajaxorg/ace-builds/master/src-min-noconflict/ace.js -destination ace.js"
@call powershell -command "start-bitstransfer -source https://raw.githubusercontent.com/ajaxorg/ace-builds/master/src-min-noconflict/mode-glsl.js -destination mode-glsl.js"
@call powershell -command "start-bitstransfer -source https://raw.githubusercontent.com/ajaxorg/ace-builds/master/src-min-noconflict/theme-solarized_light.js -destination theme-solarized_light.js"
@call powershell -command "start-bitstransfer -source https://raw.githubusercontent.com/ajaxorg/ace-builds/master/src-min-noconflict/theme-monokai.js -destination theme-monokai.js"

@echo updating typescript definition files...

@call npm install @types/webgl2 --save
@call npm install @types/ace --save

@echo all done.
