chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "rebasePR",
        title: "Rebase PR",
        contexts: ["all"],
        documentUrlPatterns: ["https://github.com/*/pull/*"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "rebasePR") {
        rebasePR(tab)
    }
});

chrome.action.onClicked.addListener(() =>
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        const tab = tabs[0];
        const url = new URL(tab.url);

        // Check if the current tab's URL matches the pattern github.com/*/pull/*
        const urlPattern = /^https:\/\/github\.com\/.*\/pull\//;
        if (!urlPattern.test(url)) {
            console.log('Current tab does not match the pattern github.com/*/pull/*');
            return;
        }
        rebasePR(tab)
    }));

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getTokenFromGitHubDev") {
        getTokenFromGitHubDev((newAuthHeader) => sendResponse({GitHubToken: newAuthHeader}));
        return true;
    }
});

function getTokenFromGitHubDev(callback) {
    console.log("Opening github.dev")
    chrome.tabs.create({url: "https://github.dev", active: false}, newTab => {
        console.log("created tab");

        // Capture requests to api.github.com
        const listener = function (details) {
            console.log("caught request", details.url, details.requestHeaders);
            for (let i = 0; i < details.requestHeaders.length; ++i) {
                if (details.requestHeaders[i].name.toLowerCase() === 'authorization') {
                    const authHeader = details.requestHeaders[i].value;
                    // Store the authHeader in the secret storage
                    chrome.storage.sync.set({GitHubToken: authHeader}, function () {
                        console.log('AuthHeader is stored in the secret storage.');
                    });
                    // Remove the listener after capturing the first Authorization header
                    chrome.webRequest.onBeforeSendHeaders.removeListener(listener);
                    // Close the tab after updating the bookmark
                    chrome.tabs.remove(newTab.id);
                    callback(authHeader);
                    break;
                }
            }
            return {requestHeaders: details.requestHeaders};
        };

        chrome.webRequest.onBeforeSendHeaders.addListener(listener, {urls: ["*://api.github.com/*"]}, ["requestHeaders"]);
    });
}

function rebasePR(tab) {
    console.log("rebasePR")

    execConsoleScript = (authToken) => {
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            function: doRebaseScript,
            args: [authToken],
            injectImmediately: true,
        });
    }
    chrome.storage.sync.get(['GitHubToken'], function (result) {
        console.log("got token", result)
        if (!result.GitHubToken || result.GitHubToken === "") {
            console.log("reload token")
            getTokenFromGitHubDev((newAuthHeader) => execConsoleScript(newAuthHeader));
            return
        }
        execConsoleScript(result.GitHubToken);
    });
}

function doRebaseScript(authHeader) {
    console.log("Rebasing PR", authHeader);
    const endOIDs = document.querySelectorAll('input[name="comparison_end_oid"]');
    let headSHA;
    if (endOIDs.length > 0) {
        headSHA = endOIDs[endOIDs.length - 1].value;
    } else {
        headSHA = document.querySelector('input[name="head_sha"]').value;
    }
    const prAPIBuilder = window.location.href.split('/').slice(0, 7);
    prAPIBuilder[2] = "api.github.com/repos";
    prAPIBuilder[5] = "pulls";
    const prURL = prAPIBuilder.join('/');
    console.log(`PR_URL: ${prURL}`);
    fetch(`${prURL}/update-branch`, {
        "headers": {"Authorization": authHeader},
        "body": JSON.stringify({"update_method": "rebase", "expected_head_sha": headSHA}),
        "method": "PUT"
    }).then(resp => {
        if (resp.status >= 400 && resp.status < 500) {                // Send a message to the background script to get a new token
            chrome.runtime.sendMessage({action: "getTokenFromGitHubDev"},
                function (response) {
                    console.log("Received new token", response);
                    doRebaseScript(response.GitHubToken);
                });
            alert('Unauthorized: Please wait a moment to get a new token');
        }
    }).catch(error => {
        console.error('Error:', error);
    });
}