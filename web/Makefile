.PHONY: folders app update lib test
SHELL = /bin/bash

SRC=src
TEST=test
DIST=dist

app: folders vendor shaders
	pushd $(SRC); find . -name "*.ts" -type f >src.txt; tsc @src.txt --target ES5 --sourceMap --out ../dist/app.js; rm src.txt; popd

vendor: folders
	cp $(SRC)/lib/*.js $(DIST)/lib/

shaders: folders
	@cp $(SRC)/renderer/shaders/* $(DIST)/shaders 
	@cp -rf $(TEST)/shaders $(DIST)/test/
	@cp $(SRC)/renderer/shaders/* $(DIST)/test/shaders/
	@( pushd $(DIST)/test && npm install && popd ) > /dev/null
	@pushd $(DIST) > /dev/null && node test/compileshader.js && popd > /dev/null

all: app

folders:
	@mkdir -p $(DIST)
	@mkdir -p $(DIST)/lib
	@mkdir -p $(DIST)/shaders
	@mkdir -p $(DIST)/test

update:
	pushd $(SRC)/lib && sh update.sh && popd

lib:
	pushd $(SRC); cp -r tsconfigs/lib.json tsconfig.json; tsc; popd
	pushd $(SRC); cp -r tsconfigs/dec.json tsconfig.json; tsc; popd
