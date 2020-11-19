let isAnyCtrlPressed = false;
let isActivated = false;

const askForConsentBeforeClosingTab = (evt) => {
    let confirmationMessage = "consent";
    if (isActivated && isAnyCtrlPressed) {
        (evt || window.event).returnValue = confirmationMessage; //Gecko + IE
        return confirmationMessage;
    }
};

const setIsAnyCtrlPressed = (evt) => {
    isAnyCtrlPressed = evt.ctrlKey;
};

window.addEventListener("beforeunload", askForConsentBeforeClosingTab);
document.body.addEventListener("keydown", setIsAnyCtrlPressed);
document.body.addEventListener("keyup", setIsAnyCtrlPressed);

// message background to know if the extension is activated on the current page
chrome.runtime.sendMessage({
    isInjectFinished: true,
    windowsUrl: window.location.host
}, (response) => {
    isActivated = response.isActivated;
});