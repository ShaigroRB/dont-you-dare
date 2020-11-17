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