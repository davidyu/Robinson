@echo off
@if not exist build mkdir build
pushd build
cl -Zi ..\src\win32\win32_dots.cpp ..\src\win32\shims\camera.cpp ..\src\win32\shims\mat.cpp ..\src\win32\shims\frustum.cpp ..\src\win32\rasterizer.cpp user32.lib Gdi32.lib -I..\src\win32\shims
popd
