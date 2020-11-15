let isAnyCtrlPressed = false;

const askForConsentBeforeClosingTab = (evt)  => {
    let confirmationMessage = "consent";
    if (isAnyCtrlPressed) {
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