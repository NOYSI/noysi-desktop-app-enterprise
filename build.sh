#!/bin/sh
set -e
npm install
node_modules/.bin/webpack --config webpack.config.js
npm run build:linux
npm run build:winall
