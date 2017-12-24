@if not exist %DIST%\test mkdir %DIST%\test

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
