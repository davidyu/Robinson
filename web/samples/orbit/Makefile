.PHONY: folders debug
SHELL = /bin/bash

SRC=src
DIST=dist

debug: folders
	sh files.sh
	tsc @files.txt --target ES5 --sourceMap --out $(DIST)/app.js
	rm files.txt

folders:
	mkdir -p $(DIST)
