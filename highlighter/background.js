// Add a listener to detect when the user selects text
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "highlightText",
        title: "Highlight Text",
        contexts: ["selection"]
    });
});

// Add a listener for context menu item clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "highlightText") {
        // Send a message to the content script to handle the selected text
        chrome.tabs.sendMessage(tab.id, { action: "highlight", selection: info.selectionText})
    };
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "saveHighlight") {
        saveHighlight(sender.tab.url, message.selection, message.x, message.y);
        // Send a message to the content script to handle the selected text
        chrome.tabs.sendMessage(sender.tab.id, { action: "highlightText", selection: message.selection });
    }
});

// function for saving the highlight object to the localstorage under the current url
function saveHighlight(url, highlightedText, x, y) {
    chrome.storage.local.get({ [url]: [] }, function(result) {
        const highlights = result[url];
        highlight = {
            name: "Not set",
            text: highlightedText,
            note: '',
            colour: "Yellow",
            xPos: x,
            yPos: y
        }
        highlights.push(highlight);
        const data = { [url]: highlights };
        chrome.storage.local.set(data);
    });
}