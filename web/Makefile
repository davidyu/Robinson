.PHONY: folders app server update
SHELL = /bin/bash

SRC=src
DIST=dist

app: folders vendor shaders
	pushd $(SRC); tsc; popd
	cp app.html $(DIST)/index.html

vendor: folders
	cp $(SRC)/lib/*.js $(DIST)/lib/

shaders: folders
	@cp $(SRC)/renderer/shaders/* $(DIST)/shaders 
	@cp $(SRC)/test/* $(DIST)/test/
	@( pushd $(DIST)/test && npm install && popd ) > /dev/null
	@pushd $(DIST) > /dev/null && node test/compileshader.js && popd > /dev/null

all: app server

server: folders
	cp server/* $(DIST)/

folders:
	@mkdir -p $(DIST)
	@mkdir -p $(DIST)/lib
	@mkdir -p $(DIST)/shaders
	@mkdir -p $(DIST)/test

update:
	pushd $(SRC)/lib && sh update.sh && popd

lib:
	pushd $(SRC); tsc; popd
