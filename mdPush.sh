#!/bin/bash
multimarkdown --output=$1 $2 && couchapp push C:/MAF/Dev/GitHub/library default