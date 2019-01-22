.PHONY: folders debug clean release shaders page update art dependencies
SHELL = /bin/bash

SRC=src
DIST=dist

PUBLIC_DIST=../../../../Robinson-web-samples

SAMPLE_NAME=$(shell basename $(shell pwd))

debug: folders shaders update page art dependencies
	sh files.sh debug
	tsc @files.txt --target ES5 --sourceMap --out $(DIST)/app.js
	rm files.txt

clean:
	rm -rf $(DIST)

release: clean folders shaders update page art dependencies
	pushd ../../ && make lib && popd
	cp ../../dist/robinson.d.ts .
	cp ../../dist/robinson.js $(DIST)/
	sh files.sh
	tsc @files.txt --target ES5 --out $(DIST)/app.js
	rm files.txt robinson.d.ts
	if [ -d $(PUBLIC_DIST) ]; then mkdir -p $(PUBLIC_DIST)/$(SAMPLE_NAME) && cp -rf $(DIST)/* $(PUBLIC_DIST)/$(SAMPLE_NAME)/; fi;

dependencies:
	cp -rf ../../dist/lib/*.js $(DIST)/

shaders:
	cp -rf ../../dist/shaders $(DIST)/

page:
	cp app.html dist/

update:
	pushd vendor && sh update.sh && popd
	cp vendor/*.js vendor/*.map $(DIST)/vendor/

folders:
	mkdir -p $(DIST)
	mkdir -p $(DIST)/vendor

art:
	cp -rf art/*.jpg dist/
