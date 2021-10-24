# Add local package.json for the builds.
# Many thanks to
# https://www.sensedeep.com/blog/posts/2021/how-to-create-single-source-npm-module.html

cat >build/cjs/package.json <<!EOF
{
  "type": "commonjs"
}
!EOF

cat >build/esm/package.json <<!EOF
{
  "type": "module"
}
!EOF

# Fix import statements in ts esm build for Node.
# Imports for Node require file extension which is *not* transpiled by TypeScript.
# Many thanks to
# https://2ality.com/2021/06/typescript-esm-nodejs.html#visual-studio-code

replace "^(import [^';]* from '(\./|(\.\./)+)[^';.]*)';" "\$1.js';" ./build/esm/*.js
replace "^(export \{ default [^\}]*\} from '(\./|(\.\./)+)[^';.]*)';" "\$1.js';" ./build/esm/*.js
