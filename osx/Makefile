# this Makefile is OSX-only

src = $(wildcard *.cpp)
obj = $(src:.cpp=.o)
VPATH = src src/platform obj

BIN = osx_main.app
OBJ = obj

CC = gcc
LDFLAGS= -framework Metal

all: build shaders osx_main

osx_main: main.swift osx_main.swift renderer.swift
	xcrun -sdk macosx swiftc -framework Metal -o $(BIN)/$@ $^
	cp src/Info.plist $(BIN)/

shaders:
	@mkdir -p $(BIN)/shaders
	@cp src/test.vert src/test.frag $(BIN)/shaders/

build:
	@mkdir -p $(BIN)
	@mkdir -p $(OBJ)
