Hello [kawhi](https://kawhi.site/).

# Deploy

```sh
# build
hui build

# navigate into the build output directory
cd dist

git init
git config user.name kawhi66
git config user.email kawhi_site@163.com
git add -A
git commit -m 'deploy to gh-pages'

# if you are deploying to https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

# if you are deploying to https://<USERNAME>.github.io/<REPO>
git push -f https://github.com/kawhi66/Kawhi.git master:gh-pages

cd ..
```
