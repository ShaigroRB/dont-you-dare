chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ option: 'whitelist' }, () => {
        console.log("option is whitelist by default");
    });
    chrome.storage.sync.set({ whitelist: [] }, () => {
        console.log("whitelist is empty");
    });
    chrome.storage.sync.set({ blacklist: [] }, () => {
        console.log("blacklist is empty");
    });
});

const getStorage = (dataId, callback) => {
    chrome.storage.sync.get(dataId, callback);
};

// listens on messages sent by anyone
chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
    const windowsUrl = request.windowsUrl;
    // if the content_script has finished loading
    // then it is ready to know if the extension is activated on the website
    if (request.isInjectFinished) {
        getStorage(['option', 'whitelist', 'blacklist'], (storage) => {
            switch (storage.option) {
                case 'disabled':
                    sendResponse({ isActivated: false });
                    break;
                case 'whitelist':
                    // if url in whitelist, then it is activated on the website
                    sendResponse({
                        isActivated: (storage.whitelist.indexOf(windowsUrl) != -1)
                    });
                    break;
                case 'blacklist':
                    // if url in blacklist, then it is not activated on the website
                    sendResponse({
                        isActivated: (storage.blacklist.indexOf(windowsUrl) == -1)
                    });
                    break
            }
        });
    }
    // keeps the sendResponse valid after the listener returns,
    // so I can still use it later
    return true;
});