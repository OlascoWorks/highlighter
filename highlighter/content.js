console.log("Loaded content.js👍");
document.querySelector("html").style.scrollBehavior = "smooth";
const currentUrl = window.location.href;

// Function for finding the element that contains highlighted text on the page
// Its not used in some places due to differences in criteria for checking
function findElement(selectedText) {
    const elements = document.getElementsByTagName("*");
    let foundElement = null;
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element.textContent === selectedText || element.innerHTML === selectedText || element.innerText === selectedText || element.text === selectedText) {
            foundElement = element;
            return foundElement
        }
    }

    return false;
}

// Retrieve the highlights for the current URL from storage and send them to the popup page
chrome.storage.local.get(currentUrl, function(result) {
    const highlights = result[currentUrl] || [];
    highlights.forEach(function(highlight) {
        const elements = document.getElementsByTagName("*");
        let foundElement = null;

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];

            if (element.textContent === highlight.text || element.innerHTML === highlight.text) {
                foundElement = element;
                break;
            }
        }
        
        foundElement.innerHTML = `<span style="background-color: ${highlight.colour};">${highlight.text}</span>`; // change the inner html of the element to house all it's text content inside a span that can be styled
    });
});

// Add a listener for messages from the background script and popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "highlightText") {
        // highlight the text
        const selection = window.getSelection();
        const selectedText = message.selection;
        const foundElement = findElement(selectedText);
        foundElement.innerHTML = `<span style="background-color: yellow;">${selectedText}</span>`;
    } else if (message.action === "highlight") {
        // initial message after the "highlight text" has been chosen
        // This is necessary so the content script can receive details of the highlighted text, send other info that can only be gotten with the content script and check if its parent element can be found before coninuing 
        const foundElement = findElement(message.selection);
        if (foundElement) {
            saveHighlight(message.selection);
        }
    } else if(message.action === "contentLoaded") {
        addListeners();
    } else if (message.action === "changeColor") {
        changeColor(message.text, message.color);
    } else if (message.action === "addBtnListeners") {
        chrome.runtime.sendMessage({ action: "addBtnListeners" });
    } else if (message.action === "loadDOM") {
        chrome.runtime.sendMessage({ action: "loadDOM" });
    } else if (message.action === "scrollToHighlight") {
        window.scrollTo(message.x, message.y-(window.innerHeight/2));
    } else if (message.action === "reloadPage") {
        location.reload();
    };
});

// This function doesn't really save the highlight. It simply gets specific data related to the highlighted text and sends them to the background where they are then saved
function saveHighlight(selection) {
    let elements = document.getElementsByTagName("*");
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element.textContent === selection || element.innerHTML === selection) {
            const foundElement = element;
            const position = foundElement.getBoundingClientRect();
            const scrollTop = window.scrollY || window.pageYOffset;
            const scrollLeft = window.scrollX || window.pageXOffset;

            const x = position.left + scrollLeft;
            const y = position.top + scrollTop;
            chrome.runtime.sendMessage({ action: "saveHighlight", selection: selection, x:x, y:y });
            break;
        }
    }
}

// function for handling colour change
function changeColor(text, color) {
    chrome.storage.local.get(currentUrl, function(result) {
        const highlights = result[currentUrl] || [];
        
        for (let i = 0; i < highlights.length; i++) {
            const highlight = highlights[i];
            if (highlight.text.split(' ').slice(0, 16).join(' ') === text) {
                const elements = document.getElementsByTagName("*");
                for (let j = 0; j < elements.length; j++) {
                    const element = elements[j];
                    if (element.textContent.split(' ').slice(0, 16).join(' ') === text || element.innerHTML.split(' ').slice(0, 16).join(' ') === text) {
                        const foundElement = element;
                        foundElement.firstElementChild.style.backgroundColor = color;
                        const new_highlight = {
                            name: highlight.name,
                            text: highlight.text,
                            note: highlight.note,
                            colour: color,
                            xPos: highlight.xPos,
                            yPos: highlight.yPos
                        }; // create a new highlight object with same detials as the highlight except the updated colour
                        highlights.splice(i, 1, new_highlight); // replace highlight with new highlight
                        const data = { [currentUrl]: highlights };
                        chrome.storage.local.set(data);
                        break;
                    }
                }
                
            }
        };
    });
};

function addListeners() {
    chrome.runtime.sendMessage({ action:"addListeners" });
}