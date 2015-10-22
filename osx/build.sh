BIN=build
OBJ=obj

mkdir -p $BIN
mkdir -p $OBJ

xcrun -sdk macosx swiftc src/platform/osx_main.swift -o $BIN/osx_main
