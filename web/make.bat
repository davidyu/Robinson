@set SRC=src
@set DIST=dist

@if not exist %DIST% mkdir %DIST%
@if not exist %DIST%\lib mkdir %DIST%\lib
@if not exist %DIST%\shaders mkdir %DIST%\shaders

@rem build
@pushd %SRC%
@call tsc
@popd

@rem copy web client files

@call cp water.html %DIST%\index.html > nul
@call cp %SRC%\lib\*.js %DIST%\lib\ > nul
@call cp %SRC%\renderer\shaders\* %DIST%\shaders\ > nul

@rem copy server files
@call echo a | xcopy server\* %DIST%\ > nul
@pushd %DIST% && npm install && @popd
