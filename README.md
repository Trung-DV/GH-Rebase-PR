# GitHub-Rebase
Quickly rebase a PR by using gh api

## Use case:
1. Dependabot doesn't have permission to run CI
2. Quickly rebase a PR

## How it work:
1. Get GitHub token (temporary?) from github.dev
2. Use GitHub's API to trigger rebase: [Link](https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28#update-a-pull-request-branch)