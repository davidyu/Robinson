#!/bin/bash

if ! [ -x "$(command -v fswatch)" ]; then
    brew install fswatch
fi

# use fswatch to run the make command any time any file except src.txt changes in this directory
fswatch -o . -e "samples" -e "dist" -e "src.txt" -e ".git" | while read; \
    do \
        make autobuild || true
    done
