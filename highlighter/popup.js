const body = document.querySelector('body');

// function for populating the popup home page with all the highlights for the url
function loadDOM() {
    body.innerHTML = '';
    // Retrieve the current tab's URL
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const activeTab = tabs[0];
        const currentUrl = activeTab.url;
        // Retrieve the highlights for the current URL from storage
        chrome.storage.local.get(currentUrl, function(result) {
            const highlights = result[currentUrl] || [];
            if (highlights.length >= 1) {
                const highlightsContainer = document.createElement("div");
                highlightsContainer.id = "highlights-container";
                
                highlights.forEach(function(highlight) {
                    const highlightItem = document.createElement("div");
                    const colorSelector = document.createElement("div");
                    const highlightItemGroup = document.createElement("div");
                    const yellow = document.createElement("div");
                    const red = document.createElement("div");
                    const green = document.createElement("div");
    
                    highlightItem.classList.add("highlight-item");
                    colorSelector.classList.add("color-selector");
                    highlightItemGroup.classList.add("group");
                    yellow.classList.add('circle');
                    red.classList.add('circle');
                    green.classList.add('circle');
    
                    if (highlight.colour === 'Yellow') {
                        yellow.classList.add('selected');
                    } else if (highlight.colour === 'Red') {
                        red.classList.add('selected');
                    } else if (highlight.colour === 'Green') {
                        green.classList.add('selected');
                    };

                    yellow.id = "Yellow";
                    red.id = "Red";
                    green.id = "Green";    
                    if (highlight.text.split(' ').length >= 16) {
                        highlightItem.innerHTML = `<h5>Name:&emsp;${highlight.name}</h5><h5>Text:&emsp;"${highlight.text.split(' ').slice(0, 16).join(' ')}..."</h5><h5>Note:&emsp;"${highlight.note.split(' ').slice(0, 16).join(' ')}..."</h5>`;
                    } else {
                        highlightItem.innerHTML = `<h5>Name:&emsp;${highlight.name}</h5><h5>Text:&emsp;"${highlight.text}"</h5><h5>Note:&emsp;"${highlight.note}"</h5>`;
                    }
    
                    highlightItemGroup.appendChild(highlightItem);
                    highlightItemGroup.appendChild(colorSelector);
                    colorSelector.appendChild(yellow);
                    colorSelector.appendChild(red);
                    colorSelector.appendChild(green);
                    highlightsContainer.appendChild(highlightItemGroup);
                });
                
                body.appendChild(highlightsContainer);
            } else {
                body.innerHTML = '<h5 id="text">There are no highlights for this page. Highlight text to see it here.</h5>'
            }
        });
        chrome.tabs.sendMessage(activeTab.id, { action: "contentLoaded" });
    });
};
document.addEventListener("DOMContentLoaded", function() {
    loadDOM();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "addListeners") { // this is used to add listeners to resonsive elements like the colour circles and the highlight items themselves
        const groups = document.querySelectorAll('.group');
        groups.forEach((group) => {
            const selectors = group.children[1];
            const colors = selectors.children;

            for (let i = 0; i < colors.length; i++) {
                const color = colors[i];
                color.addEventListener('click', () => {
                    for (let j = 0; j < colors.length; j++) {
                        const c = colors[j];
                        c.classList.remove('selected');
                    };
                    color.classList.add('selected');
            
                    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, { action:"changeColor", text: group.firstElementChild.children[1].textContent.slice(7, -4), color:color.id });
                    });
                });
            };
        });


        const highlightItems = document.querySelectorAll('.highlight-item');
        highlightItems.forEach((highlightItem) => {
            highlightItem.addEventListener('click', () => {
                chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                    const activeTab = tabs[0];
                    const currentUrl = activeTab.url;
                    chrome.storage.local.get(currentUrl, function(result) {
                        const highlights = result[currentUrl] || [];
                        for (let i = 0; i < highlights.length; i++) {
                            const highlight = highlights[i];
                            if (highlight.text.split(' ').slice(0, 16).join(' ') === highlightItem.children[1].textContent.slice(7, -4)) {
                                chrome.tabs.sendMessage(activeTab.id, { action:"scrollToHighlight", x:highlight.xPos, y:highlight.yPos });
                            }
                        };
                    });
                });

                // below cde simply creates a new page for displaying the details of the clicked highlight
                const nameLabel = document.createElement('label');
                nameLabel.setAttribute('for', 'name');
                nameLabel.textContent = "Name";
                const textLabel = document.createElement('label');
                textLabel.setAttribute('for', 'text');
                textLabel.textContent = "Text";
                const noteLabel = document.createElement('label');
                noteLabel.setAttribute('for', 'note');
                noteLabel.textContent = "Note";
        
                const nameElement = document.createElement('input');
                nameElement.maxLength = 30;
                const textElement = document.createElement('div');
                const noteElement = document.createElement('textarea');
                noteElement.maxLength = 100;
                nameElement.id = "name";
                textElement.id = "form-text";
                noteElement.id = "note";
                
                nameElement.value = highlightItem.children[0].textContent.slice(6);
                textElement.textContent = highlightItem.children[1].textContent.slice(7, -1);
                textElement.readOnly = true;
                noteElement.value = highlightItem.children[2].textContent.slice(7, -1);
        
                const nameGroup = document.createElement('div');
                const textGroup = document.createElement('div');
                const noteGroup = document.createElement('div');
                nameGroup.classList.add("form-group");
                textGroup.classList.add("form-group");
                noteGroup.classList.add("form-group");
        
                nameGroup.appendChild(nameLabel);
                nameGroup.appendChild(nameElement);
                textGroup.appendChild(textLabel);
                textGroup.appendChild(textElement);
                noteGroup.appendChild(noteLabel);
                noteGroup.appendChild(noteElement);
        
                const highlightContainer = document.createElement("div");
                highlightContainer.id = "highlight-container";
                highlightContainer.appendChild(nameGroup);
                highlightContainer.appendChild(textGroup);
                highlightContainer.appendChild(noteGroup);

                const backButton = document.createElement("div");
                backButton.id = "back";
                const submitButton = document.createElement("button");
                submitButton.id = "submit";
                const deleteButton = document.createElement("div");
                deleteButton.id = "delete";
                backButton.textContent = "👈🏼";
                submitButton.textContent = "Submit Changes";
                deleteButton.textContent = "❌";
                const buttonContainer = document.createElement("div");
                buttonContainer.id = "btn-container";
                buttonContainer.appendChild(backButton);
                buttonContainer.appendChild(submitButton);
                buttonContainer.appendChild(deleteButton);
                chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, { action:"addBtnListeners" });
                });
        
                body.innerHTML = '';
                body.appendChild(highlightContainer);
                body.appendChild(buttonContainer);
                body.style.margin = 0;
            })
        })
    } else if (message.action === "addBtnListeners") {
        addButtonListeners();
    } else if (message.action === "loadDOM") {
        loadDOM();
    }
});

// function for adding listeners to the buttns in the display page
function addButtonListeners() {
    const backButton = document.getElementById("back");
    const submitButton = document.getElementById("submit");
    const deleteButton = document.getElementById("delete");
    const name = document.getElementById("name");
    const text = document.getElementById("form-text").textContent.slice(0, -3);
    const note = document.getElementById("note");

    backButton.addEventListener('click', () => {
        body.innerHTML = '';
        body.style.margin = "8px";
        loadDOM();
    });
    
    submitButton.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const activeTab = tabs[0];
            const currentUrl = activeTab.url;
            chrome.storage.local.get(currentUrl, function(result) {
                const highlights = result[currentUrl] || [];
                for (let i = 0; i < highlights.length; i++) {
                    const highlight = highlights[i];
                    if (highlight.text.split(' ').slice(0, 16).join(' ') === text) {
                        const new_highlight = {
                            name: name.value,
                            text: highlight.text,
                            note: note.value,
                            colour: highlight.colour
                        };
                        highlights.splice(i, 1, new_highlight);
                        const data = { [currentUrl]: highlights };
                        chrome.storage.local.set(data);
                        break;
                    };
                };
            });
        });
        
        body.innerHTML = '';
        body.style.margin = "8px";
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action:"loadDOM" });
        });
    })
    
    deleteButton.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const activeTab = tabs[0];
            const currentUrl = activeTab.url;
            chrome.storage.local.get(currentUrl, function(result) {
                const highlights = result[currentUrl] || [];
                for (let i = 0; i < highlights.length; i++) {
                    const highlight = highlights[i];
                    if (highlight.text.split(' ').slice(0, 16).join(' ') === text) {
                        highlights.splice(i, 1);
                        const data = { [currentUrl]: highlights };
                        chrome.storage.local.set(data);
                        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                            chrome.tabs.sendMessage(tabs[0].id, { action:"reloadPage" });
                        });
                        break;
                    };
                };
            });
        });

        body.innerHTML = '';
        body.style.margin = "8px";
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action:"loadDOM" });
        });
    })
}