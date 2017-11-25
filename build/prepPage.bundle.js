/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 33);
/******/ })
/************************************************************************/
/******/ ({

/***/ 33:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * THIS IS AN EVENT PAGE. PRETTY MUCH A GENERAL EVENT HANDLER.
 * GOOD FOR PAGE INITIALIZATION STUFF
 */


function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var tabId = 0; //dummy value

function createContextMenus() {
    var annotationText = void 0;
    var contextMenuProps = {
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

chrome.runtime.onInstalled.addListener(function (details) {
    createContextMenus();
    //alert(changeInfo.status);
    // if (changeInfo.status === 'complete') {
    registerEvents();
    // }
});

// chrome.webNavigation.onCompleted.addListener((details) =>{
//     registerEvents();           //get events registered
// });


function registerEvents() {
    //this logic needs to run after every page load
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        //NOTE: I think this runs multiple times. would be nice to only run once
        //setup the modal window in content Script
        var tabIdPromise = new Promise(function (resolve, reject) {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                //get tab, to refer to tab ID.      WILL BREAK IF NOT KEEPING TAB IN THE SELECTED STATE
                resolve(tabs[0].id);
            });
        });
        tabIdPromise.then(function (tabId) {
            tabId = tabId;
            chrome.tabs.sendMessage(tabId, { contentType: "create" }, function (response) {
                if (response) {
                    console.log(response); //indication that content script is rendering
                }
            });
        });
    });

    function clickEvent() {
        //need response and url in the event registration. must therefore register for each page
        //annotationText = performAnnotate();
        //saveAnnotation(response, annotationText);
        preSaveAnnotation(); //prepare the work necessary to begin saving annotations
    }
    chrome.contextMenus.onClicked.addListener(clickEvent);
}

/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found
 */
function getCurrentTabUrl() {
    // Query filter to be passed to chrome.tabs.query - see
    // https://developer.chrome.com/extensions/tabs#method-query
    var queryInfo = {
        active: true,
        currentWindow: true
    };
    return new Promise(function (resolve, reject) {
        chrome.tabs.query(queryInfo, function (tabs) {
            // chrome.tabs.query invokes the callback with a list of tabs that match the
            // query. When the popup is opened, there is certainly a window and at least
            // one tab, so we can safely assume that |tabs| is a non-empty array.
            // A window can only have one active tab at a time, so the array consists of
            // exactly one tab.
            var tab = tabs[0];
            // A tab is a plain object that provides information about the tab.
            // See https://developer.chrome.com/extensions/tabs#type-Tab
            var url = tab.url;
            // tab.url is only available if the "activeTab" permission is declared.
            // If you want to see the URL of other tabs (e.g. after removing active:true
            // from |queryInfo|), then the "tabs" permission is required to see their
            // "url" properties.
            console.assert(typeof url == 'string', 'tab.url should be a string');
            resolve(url);
            //callback();
            //annotationsList(url);
        });
    });
    // return aPromise.then(response =>{
    //    return response;
    // });
}

/**
 * Loads the single selected quote in UI
 */
function loadQuote() {
    //update the extension text
    return new Promise(function (resolve, reject) {
        var script = 'document.getSelection().toString()';
        var annotation = void 0;
        // See https://developer.chrome.com/extensions/tabs#method-executeScript.
        // chrome.tabs.executeScript allows us to programmatically inject JavaScript
        // into a page. Since we omit the optional first argument "tabId", the script
        // is inserted into the active tab of the current window, which serves as the
        // default.
        var executeScriptPromise = chrome.tabs.executeScript({
            code: script
        }, function (response) {
            //document.getElementById("quoteText").innerHTML = response[0];
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

    var annotation = prompt("enter your annotation");
    //document.getElementById("annotationText").innerHTML = annotation;
    return annotation;
}

/**
 * Gets the saved annotation for url.
 *
 * @param {string} url URL whose annotations are to be retrieved.
 * @param {function(string)} callback called with the saved annotations for
 *     the given url on success, or a falsy value if no annotations are retrieved.
 */
function getSavedAnnotations(url) {
    // See https://developer.chrome.com/apps/storage#type-StorageArea. We check
    // for chrome.runtime.lastError to ensure correctness even when the API call
    // fails.
    // chrome.storage.sync.get(url, (items) => {
    //   callback(chrome.runtime.lastError ? null : items[url]);
    // });
    return new Promise(function (resolve, reject) {
        console.log(url);
        chrome.storage.sync.get(url, function (urlObject) {
            //console.log(urlObject.annotations);
            resolve(chrome.runtime.lastError ? null : urlObject[url].annotations);
        });
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
    if (!quoteText || !annotationText) return; //don't do anything if annotation invalid
    chrome.storage.sync.get(url, function (result) {
        var items = result;

        var annotationObject = { //new Object representing annotation metadata to add to annotations
            quoteText: quoteText,
            annotationText: annotationText
        };
        var annotationsArray = [];
        if (Object.values(items)[0]) //include previous annotations if they exist. the 0 property comes from chrome API--> adds an integer key to all thing u save
            annotationsArray = annotationsArray.concat(Object.values(items)[0].annotations);
        annotationsArray.push(annotationObject); //include the new annotation
        items = _defineProperty({}, "" + url, { //"recreate" the key-value object to store in chrome storage (key is the url)
            annotations: annotationsArray
        });

        // console.log(items);
        chrome.storage.sync.set(items, function () {}); //save onto chrome storage
    });
}

// This extension loads the saved annotations for the current tab if one
// exists. The chrome.storage API is used for this purpose. This is different
// from the window.localStorage API, which is synchronous and stores data bound
// to a document's origin. Also, using chrome.storage.sync instead of
// chrome.storage.local allows the extension data to be synced across multiple
// user devices.

function preSaveAnnotation() {
    // let quoteText = loadQuote();
    // let annotationText;
    // let annotations = [];
    // let url = getCurrentTabUrl();
    var quotePromise = loadQuote();
    var theQuote = void 0;
    var annotationText = void 0;
    var annotations = [];
    var urlPromise = getCurrentTabUrl();
    var theUrl = void 0;

    urlPromise.then(function (url) {
        //get Url of current selected tab
        theUrl = url;
    }).then(function () {
        //get the selected text
        quotePromise;
    }).then(function (quoteText) {
        //save the selected quote and get other quotes
        theQuote = quoteText;
        getSavedAnnotations(theUrl);
    }).then(function (savedAnnotations) {
        //ask for user input, save it as annotation and display the modal
        annotationText = performAnnotate();
        saveAnnotation(theUrl, theQuote, annotationText);
        console.log("about to render modal");
        var tabIdPromise = new Promise(function (resolve, reject) {
            //Promise wrapper needed to force synch. behaviour
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                //get tab, to refer to tab ID.      WILL BREAK IF NOT KEEPING TAB IN THE SELECTED STATE
                resolve(tabs[0].id);
            });
        });
        tabIdPromise.then(function (tabId) {
            chrome.tabs.sendMessage(tabId, { contentType: "url", quoteText: theQuote, annotationText: annotationText, url: theUrl }, function (response) {
                if (response) {
                    console.log(response); //indication that content script is rendering
                }
            });
        });
    });
}

/***/ })

/******/ });