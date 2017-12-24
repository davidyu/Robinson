@set SRC=src
@set DIST=dist

@call dir /b /s "..\..\src\*.ts" | findstr /v /i ".*\dist\.* .*\2d\.*" > files.txt
@call dir /b /s "*.ts" >> files.txt

@tsc @files.txt --target ES5 --sourceMap --out %DIST%\app.js

@rm files.txt
