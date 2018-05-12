set DIST=dist
set SRC=src

@if not exist %DIST% mkdir %DIST%
@xcopy /eiy %SRC%\* %DIST%\ > NUL
@cd %DIST%
@call npm install
