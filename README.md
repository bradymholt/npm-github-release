# npm-github-release

Automate the full release process for npm packages.

When publishing npm packages, there is more to do than just running `npm package`.  Usually, you end up doing the following steps:
- Versioning
- Creating a release on GitHub with release notes
- Publishing to npm

npm-github-release automates these steps in a simple way.  Simply run `npm run release`, specify release type (major, minor, patch), provide release notes and you are done.  After npm-github-release automates finishes, you'll have a newly publish npm package available on npm, and a corresponding release on GitHub with your release notes. 

## Setup

1. Install npm-github-release
```
npm i --save-dev npm-github-release
```

2. Add a new `release` script to your `package.json`

```
"scripts": {
  "release": "npm-github-release"
}
```

3. Run `npm run release`.

## Demo

![Demo](https://cloud.githubusercontent.com/assets/759811/17310238/b74f40f2-5808-11e6-9b91-4a6697008242.gif)
