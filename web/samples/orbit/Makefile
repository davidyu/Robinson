.PHONY: folders debug
SHELL = /bin/bash

SRC=src
DIST=dist

debug: folders update
	sh files.sh
	tsc @files.txt --target ES5 --sourceMap --out $(DIST)/app.js
	rm files.txt

release: folders
	pushd ../../ && make lib && popd
	cp ../../dist/robinson.d.ts .
	tsc

update:
	pushd vendor && sh update.sh && popd

folders:
	mkdir -p $(DIST)
