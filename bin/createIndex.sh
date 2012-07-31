#!/bin/bash

source "$(dirname $0)/common.sh"

java -cp "$CLASSPATH" com.neophi.overlap.CreateIndex target/titles.tsv target/index
