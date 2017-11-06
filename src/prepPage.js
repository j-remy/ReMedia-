/**
 * THIS IS AN EVENT PAGE. PRETTY MUCH A GENERAL EVENT HANDLER.
 * GOOD FOR PAGE INITIALIZATION STUFF
 */
"use strict";
const annotationsList = require('./annotations_list');

function createContextMenus(){
    let annotationText;
    let contextMenuProps = {
        type: 'normal',
        id: '1',
        contexts: ['selection'],
        title: 'ReMedia: annotate selection'
    };
    // let contextMenuProps2 = {
    //     type: 'normal',
    //     id: '2',
    //     contexts: ['selection'],
    //     title: 'ReMedia: view annotations'
    // };
    // let contextMenuProps3 = {
    //     type: 'normal',
    //     id: '3',
    //     contexts: ['selection'],
    //     title: 'ReMedia: view others annotations'
    // };
    chrome.contextMenus.create(contextMenuProps);
    //chrome.contextMenus.create(contextMenuProps2);
    //chrome.contextMenus.create(contextMenuProps3);
}

chrome.runtime.onInstalled.addListener(details =>{
    console.log("runnin!");
    createContextMenus();
});

chrome.webNavigation.onCompleted.addListener((details) =>{
    console.log("loaded page woohoo!");
    registerEvents();           //get events registered
});


function registerEvents() {
    function clickEvent() {                                      //need response and url in the event registration. must therefore register for each page
        //annotationText = performAnnotate();
        //saveAnnotation(response, annotationText);
        preSaveAnnotation();                                //prepare the work necessary to begin saving annotations

    }
    chrome.contextMenus.onClicked.addListener(clickEvent);
}


/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found
 */
function getCurrentTabUrl(callback) {
    // Query filter to be passed to chrome.tabs.query - see
    // https://developer.chrome.com/extensions/tabs#method-query
    let queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, (tabs) => {
        // chrome.tabs.query invokes the callback with a list of tabs that match the
        // query. When the popup is opened, there is certainly a window and at least
        // one tab, so we can safely assume that |tabs| is a non-empty array.
        // A window can only have one active tab at a time, so the array consists of
        // exactly one tab.
        let tab = tabs[0];

        // A tab is a plain object that provides information about the tab.
        // See https://developer.chrome.com/extensions/tabs#type-Tab
        let url = tab.url;

        // tab.url is only available if the "activeTab" permission is declared.
        // If you want to see the URL of other tabs (e.g. after removing active:true
        // from |queryInfo|), then the "tabs" permission is required to see their
        // "url" properties.
        console.assert(typeof url == 'string', 'tab.url should be a string');

        callback(url);
        annotationsList(url);
    });

}


/**
 * Loads the single selected quote in UI
 */
function loadQuote() {
    //update the extension text
    return new Promise((resolve, reject) => {
        let script = 'document.getSelection().toString()';
        let annotation;
        // See https://developer.chrome.com/extensions/tabs#method-executeScript.
        // chrome.tabs.executeScript allows us to programmatically inject JavaScript
        // into a page. Since we omit the optional first argument "tabId", the script
        // is inserted into the active tab of the current window, which serves as the
        // default.
        let executeScriptPromise = chrome.tabs.executeScript({
            code: script
        }, function (response) {
            document.getElementById("quoteText").innerHTML = response[0];
            resolve(response[0]);
        });
    });
}


/**
 * perform annotations on a single selected quote
 */
function performAnnotate() {

    // //update the extension text
    //  let script = 'document.getSelection().toString()';
    //  let annotation;
    //  // See https://developer.chrome.com/extensions/tabs#method-executeScript.
    //  // chrome.tabs.executeScript allows us to programmatically inject JavaScript
    //  // into a page. Since we omit the optional first argument "tabId", the script
    //  // is inserted into the active tab of the current window, which serves as the
    //  // default.
    //  let executeScriptPromise = chrome.tabs.executeScript({
    //    code: script
    //  }, function (response){
    //     document.getElementById("quoteText").innerHTML=response[0];
    //     annotation = prompt("enter your annotation");
    //     document.getElementById("annotationText").innerHTML=annotation;
    //     return annotation;
    //  });

    let annotation = prompt("enter your annotation");
    document.getElementById("annotationText").innerHTML = annotation;
    return annotation;

}


/**
 * Gets the saved annotation for url.
 *
 * @param {string} url URL whose annotations are to be retrieved.
 * @param {function(string)} callback called with the saved annotations for
 *     the given url on success, or a falsy value if no annotations are retrieved.
 */
function getSavedAnnotations(url, callback) {
    // See https://developer.chrome.com/apps/storage#type-StorageArea. We check
    // for chrome.runtime.lastError to ensure correctness even when the API call
    // fails.
    // chrome.storage.sync.get(url, (items) => {
    //   callback(chrome.runtime.lastError ? null : items[url]);
    // });
    chrome.storage.sync.get(url, (urlObject) => {
        console.log(urlObject);
        callback(chrome.runtime.lastError ? null : urlObject.annotations);
    });
}

/**
 * Sets the annotations for url of current page.
 *
 * @param {string} url URL for page of which contains the annotations that are to be saved.
 * @param {string} quoteText The quote to be saved.
 * @param {string} annotationText The annotation to be saved
 */
function saveAnnotation(url, quoteText, annotationText) {
    if(!quoteText || !annotationText)   return;                 //don't do anything if annotation invalid
    // let url;
    // getCurrentTabUrl(urlArg=>{
    //     url = urlArg;
    // });
    chrome.storage.sync.get(url, result => {
        let items = result;

        let annotationObject = {                                //new Object representing annotation metadata to add to annotations
            quoteText: quoteText,
            annotationText: annotationText
        };
        let annotationsArray = [];
        if(Object.values(items)[0])               //include previous annotations if they exist. the 0 property comes from chrome API--> adds an integer key to all properties
            annotationsArray = annotationsArray.concat(Object.values(items)[0].annotations);
        annotationsArray.push(annotationObject);                //include the new annotation
        items = {["" + url]: {                                  //"recreate" the key-value object to store in chrome storage (key is the url)
            annotations: annotationsArray
        }};

        console.log(items);
        chrome.storage.sync.set(items, ()=>{

        });                         //save onto chrome storage
    });
}

// This extension loads the saved annotations for the current tab if one
// exists. The chrome.storage API is used for this purpose. This is different
// from the window.localStorage API, which is synchronous and stores data bound
// to a document's origin. Also, using chrome.storage.sync instead of
// chrome.storage.local allows the extension data to be synced across multiple
// user devices.

function preSaveAnnotation() {
    let quoteText = loadQuote();
    let annotationText;
    let annotations = [];
    getCurrentTabUrl((url) => {
        let dropdown = document.getElementById('dropdown');

        // Load the saved annotations for this page and modify the dropdown
        // value, if needed.
        quoteText.then(response =>{
            getSavedAnnotations(url, (savedAnnotationObjects) => {
                if (savedAnnotationObjects) {
                    console.log(savedAnnotationObjects);

                    //displaying the saved annotations
                    annotationsList(url);

                    //let annotationText = performAnnotate();
                    //quoteText = savedOption;
                    //   let quoteText = savedAnnotationObject.quoteText;
                    //   let annotationText = savedAnnotationObject.annotationText;
                }
            });
            //createContextMenus(url, response, annotationText);
            //only laod the additional options once the quote is loaded
            // dropdown.addEventListener('change', () => {
            //     if (dropdown.value === "annotate") {
            //         annotationText = performAnnotate();
            //         saveAnnotation(url, response, annotationText);
            //     }
            // });
            //createContextMenus(url, response);
        });                                      //load the selected quote if any...
    });
}

// document.addEventListener('DOMContentLoaded', () => {
//     registerEvents();           //get events registered
// });