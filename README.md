# GitHub-Rebase

Quickly rebase a PR by using gh api

## Use case:

1. Dependabot doesn't have permission to run CI
2. Quickly rebase a PR

## Features

- Rebase a PR directly from the GitHub interface
- Automatically fetch a GitHub token from github.dev when needed
- Ability to fetch a GitHub token by right-clicking on the extension icon

## How to Use

1. Click on the `Code` button on the repository page on GitHub.
2. Select `Download ZIP`.
3. Once the ZIP file is downloaded, extract it to your desired location on your local machine.
4. Open the Chrome browser and navigate to `chrome://extensions`.
5. Enable Developer mode by ticking the checkbox in the upper-right corner.
6. Click on the "Load unpacked" button.
7. Navigate to the directory where you extracted the repository and select it.
8. The extension should now be loaded in your Chrome browser.

To use the extension, you have three options:

Option 1: Right-click anywhere on a GitHub pull request page and select "Rebase PR" from the context menu.

Option 2: Click on the extension icon in your browser toolbar while on a GitHub pull request page.

Option 3: Right-click on the extension icon and select "Get Token" to fetch a new GitHub token.
A popup alert will show with the new token when it's fetched successfully.

The extension will automatically rebase the PR using the GitHub API.

Note: The extension requires a GitHub token to work. It will automatically fetch a temporary token from github.dev when
needed.

## How it works:

1. Get GitHub token (temporary?) from github.dev
2. Use GitHub's API to trigger
   rebase: [Link](https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28#update-a-pull-request-branch)