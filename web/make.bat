@set SRC=src
@set DIST=dist
@set TEST=test

@if not exist %DIST% mkdir %DIST%
@if not exist %DIST%\lib mkdir %DIST%\lib
@if not exist %DIST%\shaders mkdir %DIST%\shaders

@rem renderer build
@pushd %SRC%
@call dir /b /s *.ts > src.txt
@call tsc @src.txt --target ES5 --sourceMap --out ../dist/app.js
@call rm src.txt
@popd

@rem copy libraries
@call xcopy /iy %SRC%\lib\*.js %DIST%\lib > NUL

@rem shaders test
@call make_shaders
