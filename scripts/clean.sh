#!/bin/sh

cd ~/scipts/input
(ls -lt|head -n 5;ls)|sort|uniq -u|xargs --no-run-if-empty rm
cd ~/scipts/output
(ls -lt|head -n 5;ls)|sort|uniq -u|xargs --no-run-if-empty rm
