@set SRC=src
@set DIST=dist

@call dir /b /s "..\..\src\*.ts" | findstr /v /i ".*\dist\.* .*\2d\.*" > files.txt
@call dir /b /s "*.ts" >> files.txt

@call tsc @files.txt --target ES5 --sourceMap --out %DIST%\app.js

@call rm files.txt

xcopy /iy ..\..\dist\shaders %DIST%\shaders\ > NUL
xcopy /y app.html %DIST%\ > NUL
