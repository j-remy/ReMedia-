const React = require('react');
const ReactDOM = require('react-dom');


module.exports = function (url) {

    class AnnotationsList extends React.Component {

        constructor(props) {
            super();
            this.state = {
                annotationObjects: []
            }
        }

        componentDidMount() {
            chrome.storage.sync.get(url, (urlObject) => {
                if (!chrome.runtime.lastError) this.setState({annotationObjects: urlObject[url].annotations});
            });
        }

        render() {               //rendering a single annotationObject for each element in annotationObjects
            let annotationsToRender = this.state.annotationObjects.map(annotationObject =>
                <AnnotationElement key={annotationObject.quoteText} quote={annotationObject.quoteText}
                                   annotation={annotationObject.annotationText}/>
            );
            return (
                annotationsToRender
            );
        }
    }


    class AnnotationElement extends React.Component {

        constructor() {
            super();
        }

        render() {
            return (
                <div>
                    <div className="quotes" id="quoteText">"{this.props.quote}"</div>
                    <div className="annotations" id="annotationText"> &emsp;{this.props.annotation}</div>
                </div>
            );
        }
    }

    ReactDOM.render(
        <AnnotationsList/>,
        document.getElementById('annotationList')
    );

};