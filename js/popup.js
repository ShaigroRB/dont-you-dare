const options = {
    WHITELIST: 'whitelist',
    BLACKLIST: 'blacklist',
    EXT_DISABLED: 'disabled'
}

const btnChangePageStatus = document.getElementById('btn-change-page-status');
const divPageStatus = document.getElementById('div-page-status');
const divLists = document.getElementById('div-lists');

let windowUrl = '';
let isActivatedOnPage = false;
let isExtensionEnabled = true;
let listOfPages = [''];
let optionSelected = '';
let isUrlInList = false;

const removeElementFromList = (array, elem) => {
    var index = array.indexOf(elem);
    if (index > -1) {
        array.splice(index, 1);
    }
};

const setStorage = (data, callback) => {
    chrome.storage.sync.set(data, callback)
};

const getStorage = (dataId, callback) => {
    chrome.storage.sync.get(dataId, callback);
};

const injectActivationState = (activationState) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.executeScript(
            tabs[0].id,
            { code: `isActivated = ${activationState};` }
        );
    });
};

const createElmOfList = (url, removeUrl) => {
    const div = document.createElement('div');
    div.className = 'item-list flex-row';
    const p = document.createElement('p');
    p.innerText = url;
    const button = document.createElement('button');
    button.innerHTML = '&#x274C;';
    button.addEventListener('click', () => {
        removeUrl(url);
    })
    div.appendChild(p)
    div.appendChild(button);
    return div;
};

const isWhitelist = () => {
    return optionSelected === options.WHITELIST;
};

// Relation between being in whitelist mode and website being url in list => is the extension activated on the website (XNOR)
/*
    | is whitelist | url in list   | is activated    |
    --------------------------------------------------
    |       0      |      0        |         1       |
    |       0      |      1        |         0       |
    |       1      |      0        |         0       |
    |       1      |      1        |         1       |
*/
const getActivationOnWebsite = () => {
    return !(isWhitelist() ^ isUrlInList);
};

const updatePopup = () => {
    isActivatedOnPage = getActivationOnWebsite();
    const globallyEnabled = isExtensionEnabled && isActivatedOnPage;
    injectActivationState(globallyEnabled);

    btnChangePageStatus.innerHTML = isActivatedOnPage
        ? "&#x2714;"
        : "&#x26D4;";

    if (globallyEnabled) {
        divPageStatus.innerHTML = "<p>Enabled on this page</p>";
        divPageStatus.classList.add('enabled');
    } else {
        divPageStatus.innerHTML = "<p>Disabled on this page</p>";
        divPageStatus.classList.remove('enabled');
    }

    btnChangePageStatus.disabled = !isExtensionEnabled;
    if (!isExtensionEnabled) {
        document.getElementById('div-lists').classList.add('disabled');
    } else {
        document.getElementById('div-lists').classList.remove('disabled');
    }

    divLists.innerHTML = '';
    listOfPages.forEach(page => {
        divLists.appendChild(createElmOfList(page, (url) => {
            isUrlInList = !(windowUrl === url);
            removeElementFromList(listOfPages, url);
            if (isWhitelist()) {
                setStorage({ whitelist: listOfPages }, updatePopup);
            } else {
                setStorage({ blacklist: listOfPages }, updatePopup);
            }
        }));
    });
};

const getListFromStorage = (listname) => {
    isExtensionEnabled = true;
    getStorage(listname, (data) => {
        listOfPages = data[listname];
        isUrlInList = listOfPages.indexOf(windowUrl) != -1;
        updatePopup();
    });
};

const setOptionInPopup = (option) => {
    optionSelected = option;
    setStorage({ option: option }, () => {

        switch (option) {
            case options.EXT_DISABLED:
                isExtensionEnabled = false;
                updatePopup();
                break;
            case options.WHITELIST:
                getListFromStorage(options.WHITELIST);
                break;
            case options.BLACKLIST:
                getListFromStorage(options.BLACKLIST);
                break
        }
    });
};

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    windowUrl = new URL(tabs[0].url).host;
});

getStorage('option', (data) => {
    const option = data.option;
    document.getElementById('option-' + option).checked = true;
    setOptionInPopup(option);
});

for (let option of Object.values(options)) {
    const optionElm = document.getElementById('option-' + option);
    optionElm.addEventListener('click', () => {
        optionElm.checked = true;
        setOptionInPopup(option)
    });
}

btnChangePageStatus.addEventListener('click', () => {
    if (isUrlInList) {
        removeElementFromList(listOfPages, windowUrl);
    } else {
        listOfPages.push(windowUrl);
    }
    isUrlInList = !isUrlInList;
    switch (optionSelected) {
        case options.WHITELIST:
            setStorage({ whitelist: listOfPages }, updatePopup);
            break;
        case options.BLACKLIST:
            setStorage({ blacklist: listOfPages }, updatePopup);
            break;
    }
});