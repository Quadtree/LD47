#!/usr/bin/env bash

# docker-compose up build
BASE='/var/www/dyn/lighttpd/ld/ld47/html5/'
ssh sigma "mkdir -p ${BASE}dist/"
ssh sigma "mkdir -p ${BASE}assets/"
rsync -v index.html "sigma:${BASE}index.html"
rsync -v dist/*.js "sigma:${BASE}dist/"
rsync -v assets/*.js "sigma:${BASE}assets/"
rsync -v assets/*.png "sigma:${BASE}assets/"
rsync -v assets/*.glb "sigma:${BASE}assets/"
rsync -v assets/*.ogg "sigma:${BASE}assets/"
rsync -v assets/*.wav "sigma:${BASE}assets/"
