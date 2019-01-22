.PHONY: folders app update lib test autobuild
SHELL = /bin/bash

SRC=src
TEST=test
DIST=dist

LIBFLAGS=--target ES5 --sourceMap --removeComments --lib webgl2
DECFLAGS=--target ES5 --declaration

app: folders dependencies shaders
	@pushd $(SRC) >/dev/null && find . -name "*.ts" -type f -not -path "*/dist/*" >src.txt && tsc @src.txt --target ES5 --sourceMap --out ../dist/app.js && rm src.txt && popd > /dev/null

dependencies: folders
	@cp $(SRC)/lib/*.js $(DIST)/lib

shaders: folders
	@cp $(SRC)/renderer/shaders/* $(DIST)/shaders
	@# build shaders from samples also
	@cp samples/ocean/src/shaders/* $(DIST)/shaders
	@cp samples/volume-texture/src/shaders/* $(DIST)/shaders
	@cp -rf $(TEST)/shaders/* $(DIST)/test/
	@cp $(TEST)/package.json $(DIST)/test/
	@cp $(SRC)/renderer/shaders/* $(DIST)/test/
	@( pushd $(DIST)/test > /dev/null && npm install --silent > /dev/null && popd > /dev/null )
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

autobuild:
	@echo "-----------------------------"
	@echo "Autobuild: compiling Robinson"
	@date +%x\ %H:%M:%S
	@echo "-----------------------------"
	@make app
	@echo -e "\033[0;32mSUCCESS\033[0m $$(date +%x\ %H:%M:%S)"
	

# Color codes
# Black        0;30     Dark Gray     1;30
# Red          0;31     Light Red     1;31
# Green        0;32     Light Green   1;32
# Brown/Orange 0;33     Yellow        1;33
# Blue         0;34     Light Blue    1;34
# Purple       0;35     Light Purple  1;35
# Cyan         0;36     Light Cyan    1;36
# Light Gray   0;37     White         1;37
