#!/usr/bin/env node

'use strict';

var packageInfo = require(process.env.PWD + "/package.json");
var inquirer = require('inquirer');
var github = require("octonode");
var Promise = require("bluebird");
var pexec = Promise.promisify(require('child_process').exec);
var readline = require('readline');

function checkForPackageInfoRequirements() {
    return new Promise(function (resolve, reject) {
        if (!packageInfo.repository || !packageInfo.repository.url) {
            reject("{ \"repository\": { \"url\" } } is missing in package.json.\n[Reference: https://docs.npmjs.com/files/package.json#repository]");
        } else {
            resolve();
        }
    });
}

function checkForUncommitedChanges() {
    return new Promise(function (resolve, reject) {
        pexec("git status --porcelain | grep '^\\s*[MADRUC\\?]' | wc -l")
            .then((changeCount) => {
                if (changeCount > 0) {
                    reject("Git working directory not clean.  You must commit changes in working directory first.");
                } else {
                    resolve();
                }
            });
    });
}

function promptVersionType() {
    return new Promise(function (resolve, reject) {
        inquirer.prompt([
            {
                type: 'list',
                name: 'type',
                message: 'What type of release is this?',
                choices: [
                    'major',
                    'minor',
                    'patch',
                ]
            }
        ]).then(function (answers) {
            resolve(answers.type);
        });
    });
}

function promptGitHubToken() {
    return new Promise(function (resolve, reject) {
        if (process.env.GITHUB_API_TOKEN) {
            resolve(process.env.GITHUB_API_TOKEN);
        } else {
            var questions = [
                {
                    type: 'input',
                    name: 'ghToken',
                    validate: function (value) {
                        var pass = value.match(/^\w+$/);
                        if (pass) {
                            return true;
                        }

                        return 'Please enter a valid GitHub Personal access token';
                    },
                    message: 'GitHub Personal access token:'
                }
            ];

            console.log("\x1b[33m%s\x1b[0m", "GITHUB_API_TOKEN env variable not found (set GITHUB_API_TOKEN to skip this prompt)")
            inquirer.prompt(questions).then(function (answers) {
                resolve(answers.ghToken);
            });
        }
    });
}

function promptReleaseNotes() {
    return new Promise(function (resolve, reject) {
        var input = [];

        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(`\x1b[32m?\x1b[0m Release notes (finish with Ctrl^D from newline):\n`, (answer) => {
            input.push(answer);
        });

        rl.on('line', function (cmd) {
            input.push(cmd);
        });

        rl.on('close', function (cmd) {
            resolve(input.join("\n"));
        });

    });
}

function versionAndReturnTagName(versionType, releaseNotes) {
    return new Promise(function (resolve, reject) {
        console.log("\x1b[1m\x1b[37m%s\x1b[0m", "Versioning package...");
        pexec(`npm version ${versionType} -m "Release %s\n\n${releaseNotes}"`)
            .then((command, output) => {
                console.log("\x1b[1m\x1b[37m%s\x1b[0m", "Pushing new release tag to GitHub...");
                return pexec("git push --follow-tags");
            })
            .then((command, output) => {
                return pexec("git describe --abbrev=0 --tags");
            })
            .then((output) => {
                let releaseTagName = output.trim();
                resolve(releaseTagName);
            });
    });
}

function createGitHubRelease(repoName, releaseTagName, releaseNotes, token) {
    var ghClient = github.client(token);
    var ghRepoName = repoName;
    var ghRepo = ghClient.repo(ghRepoName);

    return new Promise(function (resolve, reject) {
        console.log("\x1b[1m\x1b[37m%s\x1b[0m", "Creating a new GitHub release...");
        ghRepo.release({
            tag_name: releaseTagName,
            name: releaseTagName,
            body: releaseNotes,
            draft: false
        }, (error, data) => {
            if (!error) {
                resolve(data);
            } else {
                reject("GitHub API: " + error.message);
            }
        });
    })
}

function npmPublish() {
    return pexec("npm publish");
}

function run() {
    let versionType = null;
    let ghToken = null;
    let releaseNotes = null;
    let releaseTagName = null;

    checkForPackageInfoRequirements()
        .then(() => {
            return checkForUncommitedChanges();
        })
        .then(() => {
            return promptVersionType();
        })
        .then((type) => {
            versionType = type;
            return promptGitHubToken();
        })
        .then((token) => {
            ghToken = token;
            return promptReleaseNotes();
        })
        .then((notes) => {
            releaseNotes = notes;
            return versionAndReturnTagName(versionType, releaseNotes);
        })
        .then((tagName) => {
            releaseTagName = tagName;
            let repoName = packageInfo.repository.url.match(/\.com\/(\w+\/(?:(?!\.git)[^/])*)/)[1];
            return createGitHubRelease(repoName, releaseTagName, releaseNotes, ghToken);
        })
        .then((output) => {
            console.log("\x1b[1m\x1b[32m%s\x1b[0m", `${releaseTagName} released to GitHub - ${output.html_url}`);
            return npmPublish(releaseTagName);
        })
        .then(() => {
            let npmUrl = `https://www.npmjs.com/package/` + packageInfo.name;
            console.log("\x1b[1m\x1b[32m%s\x1b[0m", `${releaseTagName} released to npm - ${npmUrl}`);
            process.exit(0);
        })
        .catch((errorMessage) => {
            console.log("\x1b[31mERROR: %s\x1b[0m", errorMessage);
            process.exit(1);
        });
}

run();

