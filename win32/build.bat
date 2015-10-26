@echo off
@if not exist build mkdir build
pushd build
cl -Zi ..\src\win32_dots.cpp ..\src\shims\camera.cpp ..\src\shims\mat.cpp ..\src\shims\frustum.cpp ..\src\rasterizer.cpp user32.lib Gdi32.lib -I..\src\shims
popd
