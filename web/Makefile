.PHONY: folders app update lib test
SHELL = /bin/bash

SRC=src
TEST=test
DIST=dist

LIBFLAGS=--target ES5 --sourceMap --removeComments --lib webgl2
DECFLAGS=--target ES5 --declaration

app: folders shaders
	pushd $(SRC); find . -name "*.ts" -type f -not -path "*/dist/*" >src.txt; tsc @src.txt --target ES5 --sourceMap --out ../dist/app.js; rm src.txt; popd

shaders: folders
	@cp $(SRC)/renderer/shaders/* $(DIST)/shaders 
	@cp -rf $(TEST)/shaders/* $(DIST)/test/
	@cp $(TEST)/package.json $(DIST)/test/
	@cp $(SRC)/renderer/shaders/* $(DIST)/test/
	@( pushd $(DIST)/test && npm install --silent > /dev/null && popd )
	@pushd $(DIST)/test > /dev/null && ./node_modules/.bin/karma start && popd > /dev/null

all: app

folders:
	@mkdir -p $(DIST)
	@mkdir -p $(DIST)/lib
	@mkdir -p $(DIST)/shaders
	@mkdir -p $(DIST)/test

update:
	pushd $(SRC)/lib && sh update.sh && popd

lib: shaders
	pushd $(SRC); find . -name "*.ts" -type f -not -path "*/dist/*" >src.txt; tsc @src.txt $(LIBFLAGS) --out ../dist/Robinson.js; rm src.txt; popd
	pushd $(SRC); find . -name "*.ts" -type f -not -path "*/dist/*" >src.txt; tsc @src.txt $(DECFLAGS) --out ../dist/Robinson.js; rm src.txt; popd
