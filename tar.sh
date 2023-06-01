#!/usr/bin/bash -v

pnpm='docker run -it --rm -v '$(pwd)':/usr/src/task/ pnpm'

name=$(eval "$pnpm node -p 'require(\"./package.json\").name'")
version=$(eval "$pnpm node -p 'require(\"./package.json\").version'")

name="${name//[$'\t\r\n']}"
version="${version//[$'\t\r\n']}"

full=$name-$version.tgz

echo  "$full"

tar --exclude-from=.npmignore -czvpf "$full" . 