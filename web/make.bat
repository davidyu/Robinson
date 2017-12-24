@set SRC=src
@set DIST=dist
@set TEST=test

@if not exist %DIST% mkdir %DIST%
@if not exist %DIST%\lib mkdir %DIST%\lib
@if not exist %DIST%\shaders mkdir %DIST%\shaders

@rem build
@pushd %SRC%
@call dir /b /s *.ts > src.txt
@call tsc @src.txt --target ES5 --sourceMap --out ../dist/app.js
@call rm src.txt
@popd

@rem shaders test
@xcopy /eiy %SRC%\renderer\shaders\* %DIST%\shaders > NUL
@xcopy /eiy %TEST%\shaders\* %DIST%\test > NUL
@xcopy /y   %TEST%\package.json %DIST%\test > NUL
@xcopy /eiy %SRC%\renderer\shaders\* %DIST%\test > NUL
@pushd %DIST%\test
@call npm install
@popd

@pushd %DIST%\test
@call node compileshader.js
@popd
