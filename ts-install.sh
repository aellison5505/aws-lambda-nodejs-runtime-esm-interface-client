#!/bin/sh
alias yarn='docker run -it --rm -v $(pwd):/usr/src/task/ -v /root:/root -w /usr/src/task node-lts'
#yarn init -2
#yarn exec npm init
#yarn set version stable
#yarn add --dev typescript eslint prettier stylelint
#yarn add @types/node@~18 -D
#yarn add mocha chai chai-as-promised sinon -D

yarn plugin import typescript
yarn plugin import interactive-tools
yarn plugin import workspace-tools

yarn dlx @yarnpkg/sdks vscode


#mkdir src lib
#mkdir src/test

touch src/index.mjs
touch src/test/index.spec.mts


cat <<\EOF > "tsconfig.json"
{
  "compilerOptions": {
    "module": "ES2022",
    "esModuleInterop": true,
    "target": "ES2022",
    "moduleResolution": "nodenext",
    "sourceMap": true,
    "outDir": "lib",
    "rootDir": "src"
  },
  "lib": ["es2020"],
  "include": ["src"]
}

EOF

cat <<\EOF >> ".gitignore"
.env*

EOF
