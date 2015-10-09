#!/bin/sh

cd ~/scripts/input
(ls -lt|head -n 5;ls)|sort|uniq -u|xargs --no-run-if-empty rm
cd ~/scripts/output
(ls -lt|head -n 5;ls)|sort|uniq -u|xargs --no-run-if-empty rm
