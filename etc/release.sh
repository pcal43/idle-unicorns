#!/bin/bash

BASEDIR=$(git rev-parse --show-toplevel)
TEMPDIR=$(mktemp -d)
cd "${BASEDIR}" && npm run build
echo "Temp dir: ${TEMPDIR}"
cd "${TEMPDIR}"
git -C "${TEMPDIR}" clone --single-branch --branch pages  https://github.com/pcal43/idle-unicorns.git
cp "${BASEDIR}"/dist/* "${TEMPDIR}"
git -C "${TEMPDIR}" add .

