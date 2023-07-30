import re

text = """
chrome.sidePanel
Description
Use the chrome.sidePanel API to host content in the browser's side panel alongside the main content of a webpage.

Permissions
sidePanel
Availability
Chrome 114+
MV3+
#Overview
Chrome features a built-in side panel that enables users to view more information alongside the main content of a webpage. The Side Panel API allows extensions to display their own UI in the side panel, enabling persistent experiences that complement the user's browsing journey.

Side panel drop-down menu
Chrome browser side panel UI.
Some features include:

The side panel remains open when navigating between tabs (if set to do so).
It can be available only on specific websites.
As an extension page, side panels have access to all Chrome APIs.
Within Chrome's settings, users can specify which side the panel should be displayed on.
#Manifest
To use the Side Panel API, add the "sidePanel" permission in the extension manifest file:

manifest.json:

{
  "name": "My side panel extension",
  ...
  "permissions": [
    "sidePanel"
  ]
}
#Use cases
The following sections demonstrate some common use cases for the Side Panel API. See Extension samples for complete extension examples.

#Display the same side panel on every site
The side panel can be set initially from the "default_path" property in the "side_panel" key of the manifest to display the same side panel on every site. This should point to a relative path within the extension directory.

manifest.json:

{
  "name": "My side panel extension",
  ...
  "side_panel": {
    "default_path": "sidepanel.html"
  }
  ...
}
sidepanel.html:

<!DOCTYPE html>
<html>
  <head>
    <title>My Sidepanel</title>
  </head>
  <body>
    <h1>All sites sidepanel extension</h1>
    <p>This side panel is enabled on all sites</p>
  </body>
</html>
#Enable a side panel on a specific site
An extension can use sidepanel.setOptions() to enable a side panel on a specific tab. This example uses chrome.tabs.onUpdated() to listen for any updates made to the tab. It checks if the URL is www.google.com and enables the side panel. Otherwise, it disables it.

service-worker.js:

const GOOGLE_ORIGIN = 'https://www.google.com';

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;
  const url = new URL(tab.url);
  // Enables the side panel on google.com
  if (url.origin === GOOGLE_ORIGIN) {
    await chrome.sidePanel.setOptions({
      tabId,
      path: 'sidepanel.html',
      enabled: true
    });
  } else {
    // Disables the side panel on all other sites
    await chrome.sidePanel.setOptions({
      tabId,
      enabled: false
    });
  }
});
When a user temporarily switches to a tab where the side panel is not enabled, the side panel will be hidden. It will automatically show again when the user switches to a tab where it was previously open.

When the user navigates to a site where the side panel is not enabled, the side panel will close, and the extension will not show in the side panel drop-down menu.

For a complete example, see the Tab-specific side panel sample.

#Open the side panel by clicking the toolbar icon
Developers can allow users to open the side panel when they click on the action toolbar icon with sidePanel.setPanelBehavior(). First, declare the "action" key in the manifest:

manifest.json:

{
  "name": "My side panel extension",
  ...
   "action": {
    "default_title": "Click to open panel"
  },
  ...
}
Now, let's add this functionality to the previous example:

service-worker.js:

const GOOGLE_ORIGIN = 'https://www.google.com';

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
...
#Programmatically open the side panel on user interaction
Chrome 116 introduces sidePanel.open(). It allows extensions to open the side panel through an extension user gesture, such as clicking on the action icon. Or a user interaction on an extension page or content script, such as clicking a button. For a complete demo, see the Open Side Panel sample extension.

The following code shows how to open a global side panel on the current window when the user clicks on a context menu. When using sidePanel.open(), you must choose the context in which it should open. Use windowId to open a global side panel. Alternatively, set the tabId to open the side panel only on a specific tab.

service-worker.js:

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'openSidePanel',
    title: 'Open side panel',
    contexts: ['all']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'openSidePanel') {
    // This will open the panel in all the pages on the current window.
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
});
Important
Remember to design your side panel as a useful companion tool for users, improving their browsing experience without unnecessary distractions. Check the Quality Guidelines in the Program Policies for more info.

#Switch to a different panel
Extensions can use sidepanel.getOptions() to retrieve the current side panel. The following example sets a welcome side panel on runtime.onInstalled(). Then when the user navigates to a different tab, it replaces it with the main side panel.

service-worker.js:

const welcomePage = 'sidepanels/welcome-sp.html';
const mainPage = 'sidepanels/main-sp.html';

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setOptions({ path: welcomePage });
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const { path } = await chrome.sidePanel.getOptions({ tabId });
  if (path === welcomePage) {
    chrome.sidePanel.setOptions({ path: mainPage });
  }
});
See the Multiple side panels for a complete sample.

#Side panel user experience
Users will see Chrome's built-in side panels first. Each side panel displays the extension's icon in the side panel menu. If no icons are included, it will show a placeholder icon with the first letter of the extension's name.

#Opening the side panel
Navigating to the side panel menu
Users can find available side panels on the side panel menu. Then, they can choose an extension from the drop-down menu.
Side panel drop-down menu
Chrome browser side panel UI.
Open through a user gesture
You can open the side panel through user interactions using sidePanel.open() and sidePanel.setPanelBehavior(), such as:

An action click
A keyboard shortcut
A context menu
A user gesture on an extension page or content script.
#Extension samples
For more Side Panel API extensions demos, explore any of the following extensions:

Dictionary side panel.
Global side panel.
Multiple side panels.
Open Side panel.
Site-specific side panel.
Summary
Types
GetPanelOptions
OpenOptions
PanelBehavior
PanelOptions
SidePanel
Methods
getOptions
getPanelBehavior
open
setOptions
setPanelBehavior
Types
GetPanelOptions
PROPERTIES
tabId
number optional

If specified, the side panel options for the given tab will be returned. Otherwise, returns the default side panel options (used for any tab that doesn't have specific settings).

OpenOptions
Pending
PROPERTIES
tabId
number optional

The tab in which to open the side panel. If the corresponding tab has a tab-specific side panel, the panel will only be open for that tab. If there is not a tab-specific panel, the global panel will be open in the specified tab and any other tabs without a currently-open tab- specific panel. This will override any currently-active side panel (global or tab-specific) in the corresponding tab. At least one of this and windowId must be provided.

windowId
number optional

The window in which to open the side panel. This is only applicable if the extension has a global (non-tab-specific) side panel or tabId is also specified. This will override any currently-active global side panel the user has open in the given window. At least one of this and tabId must be provided.

PanelBehavior
PROPERTIES
openPanelOnActionClick
boolean optional

Whether clicking the extension's icon will toggle showing the extension's entry in the side panel. Defaults to false.

PanelOptions
PROPERTIES
enabled
boolean optional

Whether the side panel should be enabled. This is optional. The default value is true.

path
string optional

The path to the side panel HTML file to use. This must be a local resource within the extension package.

tabId
number optional

If specified, the side panel options will only apply to the tab with this id. If omitted, these options set the default behavior (used for any tab that doesn't have specific settings). Note: if the same path is set for this tabId and the default tabId, then the panel for this tabId will be a different instance than the panel for the default tabId.

SidePanel
PROPERTIES
default_path
string

Developer specified path for side panel display.

Methods
getOptions
chrome.sidePanel.getOptions(
  options: GetPanelOptions,
  callback?: function,
)
Promise
Returns the active panel configuration.

PARAMETERS
options
GetPanelOptions

Specifies the context to return the configuration for.

callback
function optional

The callback parameter looks like:
(options: PanelOptions) => void

options
PanelOptions

RETURNS
Promise<PanelOptions>

Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

getPanelBehavior
chrome.sidePanel.getPanelBehavior(
  callback?: function,
)
Promise
Returns the extension's current side panel behavior.

PARAMETERS
callback
function optional

The callback parameter looks like:
(behavior: PanelBehavior) => void

behavior
PanelBehavior

RETURNS
Promise<PanelBehavior>

Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

open
chrome.sidePanel.open(
  options: OpenOptions,
  callback?: function,
)
Promise
Pending
Opens the side panel for the extension. This may only be called in response to a user action.

PARAMETERS
options
OpenOptions

Specifies the context in which to open the side panel.

callback
function optional

The callback parameter looks like:
() => void

RETURNS
Promise<void>

Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

setOptions
chrome.sidePanel.setOptions(
  options: PanelOptions,
  callback?: function,
)
Promise
Configures the side panel.

PARAMETERS
options
PanelOptions

The configuration options to apply to the panel.

callback
function optional

The callback parameter looks like:
() => void

RETURNS
Promise<void>

Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.

setPanelBehavior
chrome.sidePanel.setPanelBehavior(
  behavior: PanelBehavior,
  callback?: function,
)
Promise
Configures the extension's side panel behavior. This is an upsert operation.

PARAMETERS
behavior
PanelBehavior

The new behavior to be set.

callback
function optional

The callback parameter looks like:
() => void

RETURNS
Promise<void>

Promises are supported in Manifest V3 and later, but callbacks are provided for backward compatibility. You cannot use both on the same function call. The promise resolves with the same type that is passed to the callback.
"""
searchObject = re.compile(r'\(((\w)+(\s)?)+\)')
print(searchObject.search(text).group())