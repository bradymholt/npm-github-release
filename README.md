# npm-github-release [![NPM Package](https://img.shields.io/npm/v/npm-github-release.svg)](https://www.npmjs.com/package/npm-github-release)

Automate the full release process for npm packages.

When publishing npm packages, there is more to do than just running `npm package`.  Usually, you end up doing the following steps:
- Versioning
- Creating a release on GitHub with release notes
- Publishing to npm

npm-github-release automates these steps in a simple way.  Simply run `npm run release`, specify the release type (major, minor, patch), provide release notes and you are done.  After npm-github-release finishes, you will have a new version of your package available on npm as well as a corresponding release on GitHub with release notes. 

**Only macOS and Linux are supported**.

## Usage

1. Install npm-github-release
```
npm i --save-dev npm-github-release
```

2. Add a new `release` script to your `package.json` file

```
"scripts": {
  "release": "npm-github-release"
}
```

3. Run `npm run release`.

## Demo

![Demo](https://cloud.githubusercontent.com/assets/759811/17310238/b74f40f2-5808-11e6-9b91-4a6697008242.gif)

## Settings

A [GitHub Personal access token](https://help.github.com/articles/creating-an-access-token-for-command-line-use/) will be needed to create the release on GitHub.  Adding this token to an environment variable named `GITHUB_API_TOKEN` is recommended as this will allow npm-github-release to skip prompting for it.


