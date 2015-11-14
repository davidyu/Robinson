# this Makefile is OSX-only

src = $(wildcard *.cpp)
obj = $(src:.cpp=.o)
VPATH = src src/platform obj

BIN = osx_main.app
BUNDLE_CONTENTS = $(BIN)/Contents
OBJ = obj

CC = gcc
LDFLAGS= -framework Metal

all: build shaders osx_main

osx_main: main.swift osx_main.swift renderer.swift
	mkdir -p $(BUNDLE_CONTENTS)
	mkdir -p $(BUNDLE_CONTENTS)/MacOS
	xcrun -sdk macosx swiftc -framework Metal -o $(BUNDLE_CONTENTS)/MacOS/$@ $^
	cp src/Info.plist $(BUNDLE_CONTENTS)/

shaders:
	@mkdir -p $(BIN)/shaders
	@cp src/test.vert src/test.frag $(BIN)/shaders/

build:
	@mkdir -p $(BIN)
	@mkdir -p $(OBJ)

clean:
	@rm -rf *.app
