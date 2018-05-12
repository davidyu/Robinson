.PHONY: folders debug data
SHELL = /bin/bash

SRC=src
DIST=dist

debug: folders dependencies shaders update page data
	sh files.sh debug
	tsc @files.txt --target ES5 --sourceMap --out $(DIST)/app.js
	rm files.txt

release: folders dependencies shaders update page data
	pushd ../../ && make lib && popd
	cp ../../dist/robinson.d.ts .
	cp ../../dist/robinson.js $(DIST)/
	sh files.sh
	tsc @files.txt --target ES5 --out $(DIST)/app.js
	rm files.txt robinson.d.ts

data:
	cp -rf data/*.blob $(DIST)/

shaders:
	cp -rf ../../dist/shaders $(DIST)/

dependencies:
	cp -rf ../../dist/lib/*.js $(DIST)/

page:
	cp app.html dist/

update:
	pushd vendor && sh update.sh && popd
	cp vendor/*.js $(DIST)/vendor/ || :

folders:
	mkdir -p $(DIST)
	mkdir -p $(DIST)/vendor
