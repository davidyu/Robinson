@if not exist %DIST%\test mkdir %DIST%\test
xcopy %SRC%\renderer\shaders/* %DIST%\shaders
xcopy %SRC%\test\* %DIST%\test\
call pushd %DIST%\test && call npm install --python=C:\Python27 && popd
call pushd %DIST% && call node test\compileshader.js && popd
