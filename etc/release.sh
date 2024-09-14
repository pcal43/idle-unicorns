#!/bin/bash

BASEDIR=$(git rev-parse --show-toplevel)
TEMPDIR=$(mktemp -d)
cd "${BASEDIR}"
rm -rf dist
npm run build
echo "Temp dir: ${TEMPDIR}"
cd "${TEMPDIR}"
git clone --single-branch --branch pages  https://github.com/pcal43/idle-unicorns.git "${TEMPDIR}"
cp -R "${BASEDIR}"/dist/* "${TEMPDIR}"
cp -R "${BASEDIR}"/public/* "${TEMPDIR}"
git -C "${TEMPDIR}" config http.postBuffer 524288000
git -C "${TEMPDIR}" add .
git -C "${TEMPDIR}" commit -m 'publish'
git -C "${TEMPDIR}" push

