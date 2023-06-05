#!/bin/sh -v

version=$(eval "npx node -p 'require(\"./package.json\").version'")

version="${version//[$'\t\r\n']}"

full=build-$version

echo  "$full"

rm -R dist/"$full"

mkdir -p dist/"$full"
mkdir -p dist/"$full"/deps/patches


cp -R bin scripts src .npmignore binding.gyp LICENSE Makefile NOTICE package.json THIRD-PARTY-LICENSES tsconfig-base.prod.json pnpm-lock.yaml  dist/"$full"

cp -R deps/patches dist/"$full"/deps/patches
cp -R deps/versions deps/aws-lambda-cpp-0.2.8.tar.gz deps/curl-7_83_1.tar.gz dist/"$full"/deps


export NODE_ENV=production

pnpm run build:prod --outDir dist/"$full"/lib

cd dist/"$full"

pnpm run postbuild

pnpm pack

mv aws-lambda-ric-esm*.tgz ../.



 