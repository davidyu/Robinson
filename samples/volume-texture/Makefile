.PHONY: folders debug
SHELL = /bin/bash

SRC=src
DIST=dist

debug: folders shaders update page
	sh files.sh debug
	tsc @files.txt --target ES5 --sourceMap --out $(DIST)/app.js
	rm files.txt

release: folders shaders update page
	pushd ../../ && make lib && popd
	cp ../../dist/robinson.d.ts .
	cp ../../dist/robinson.js $(DIST)/
	sh files.sh
	tsc @files.txt --target ES5 --out $(DIST)/app.js
	rm files.txt robinson.d.ts

shaders:
	cp -rf $(SRC)/shaders $(DIST)/
	cp -rf ../../dist/shaders $(DIST)/

page:
	cp app.html dist/

update:
	pushd vendor && sh update.sh && popd
	cp vendor/*.js $(DIST)/vendor/ || :

folders:
	mkdir -p $(DIST)
	mkdir -p $(DIST)/vendor
