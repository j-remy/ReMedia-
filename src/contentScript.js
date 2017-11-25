"use strict";
const annotationsList = require('./annotations_list');

//listener for events
chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
    if(request.contentType === "create") {

        sendResponse({content: "creating modal"});

        //create modal --> ID and class
        let modal = document.createElement('div');
        modal.setAttribute('id', 'parentModal');
        modal.setAttribute('class', 'modal');
            let modalChild = document.createElement('div');
            modalChild.setAttribute('class', 'modal-content');
                let modalChildSpan = document.createElement('span');
                modalChildSpan.setAttribute('class', 'close">&times');
                modalChild.appendChild(modalChildSpan);
                let modalChildQuote = document.createElement('div');
                modalChildQuote.setAttribute('id', 'quoteText');
                modalChild.appendChild(modalChildQuote);
                let modalChildAnnotation = document.createElement('div');
                modalChildAnnotation.setAttribute('id', 'annotationText');
                modalChild.appendChild(modalChildAnnotation);
                let modalChildAnnotationList = document.createElement('div');
                modalChildAnnotationList.setAttribute('id', 'annotationList');
                modalChild.appendChild(modalChildAnnotationList);
        modal.appendChild(modalChild);


        modal.style.display = "none";                                                    //set to no display by default
        document.body.appendChild(modal);                   //add to HTML body of page

        //setup listeners for closing the modal
        modalChildSpan.onclick = () => {           //close if press the x
            modal.style.display = "none";
        };
        window.onclick = event => {                // When the user clicks anywhere outside of the modal, close it
            if (event.target === modal) {
                modal.style.display = "none";
            }
        };

        return true;
    }

    else if(request.contentType === "url"){                 //if request contains url, need to display

        sendResponse({content: "displaying modal"});

        document.getElementById('quoteText').innerHTML = request.quoteText;
        document.getElementById('annotationText').innerHTML = request.annotationText;

        annotationsList(request.url);                   //render annotationList using content, after creating id's

        let modal = document.getElementById('parentModal');
        modal.style.display = "block";

        return true;
    }
});