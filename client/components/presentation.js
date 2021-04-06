import React, { Component } from "react";
import PropTypes from "prop-types";

import VoxeetSDK from "@voxeet/voxeet-web-sdk";

import "../styles/presentation.less";

class Presentation extends Component {

    constructor(props) {
        super(props);

        this.state = {
            slideUrl: null,
            canGoBack: false,
            canGoForward: false,
            slidePosition: 0,
            slideCount: 0,
            notes: null,
            canDisplayNotes: false,
            displayNotes: this.props.displayNotes
        }

        this.previousSlide = this.previousSlide.bind(this);
        this.nextSlide = this.nextSlide.bind(this);
        this.updateSlide = this.updateSlide.bind(this);
    }

    componentDidMount() {
        VoxeetSDK.filePresentation.on('updated', this.updateSlide);

        // Load the current slide
        this.updateSlide(VoxeetSDK.filePresentation.current);
    }

    componentWillUnmount() {
        VoxeetSDK.filePresentation.removeListener('updated', this.updateSlide);
    }

    previousSlide() {
        let currentPosition = VoxeetSDK.filePresentation.current.position;
        if (currentPosition > 0) {
            console.log("Request the previous slide.");

            VoxeetSDK
                .filePresentation
                .update(currentPosition - 1)
                .catch((e) => console.log(e));
        }
    }

    nextSlide() {
        let currentPosition = VoxeetSDK.filePresentation.current.position;
        if (currentPosition < VoxeetSDK.filePresentation.current.imageCount - 1) {
            console.log("Request the next slide.");

            VoxeetSDK
                .filePresentation
                .update(currentPosition + 1)
                .catch((e) => console.log(e));
        }
    }

    updateSlide(filePresentation) {
        VoxeetSDK
            .filePresentation
            .image(filePresentation.position)
            .then(url => {
                const current = VoxeetSDK.filePresentation.current;
                const isPresentationOwner = current.owner.id == VoxeetSDK.session.participant.id;
                const canGoBack = isPresentationOwner && current.position > 0;
                const canGoForward = isPresentationOwner && current.position < current.imageCount - 1;

                const notes = [];
                if (isPresentationOwner && this.props.presentation) {
                    const slide = this.props.presentation.get(current.position);
                    if (slide) {
                        for (let index = 0; index < slide.notes.length; index++) {
                            const note = slide.notes[index];
                            const key = `notes-${index}`;
                            notes.push(<li key={key}>{note}</li>);
                        }
                    }
                }

                this.setState({
                    slideUrl: url,
                    canGoBack: canGoBack,
                    canGoForward: canGoForward,
                    slidePosition: current.position + 1, // Index is 0
                    slideCount: current.imageCount,
                    canDisplayNotes: isPresentationOwner,
                    notes: <ul>{notes}</ul>
                });
            })
            .catch((e) => console.log(e));
    }

    render() {
        return (
            <div className="presentation row flex-grow-1">
                <div className="col">
                    <div className="container-fluid d-flex h-100 flex-column">
                        <div className="row flex-grow-1">
                            {this.state.canDisplayNotes && this.state.displayNotes ? (
                                <React.Fragment>
                                    <div className="image col-7" style={{ backgroundImage: `url(${this.state.slideUrl})` }} />
                                    <div className="notes col-5">{this.state.notes}</div>
                                </React.Fragment>
                            ) : (
                                <div className="image col" style={{ backgroundImage: `url(${this.state.slideUrl})` }} />
                            )}
                        </div>
                        {this.state.canDisplayNotes && (
                            <div className="row">
                                <div className="presentationActions">
                                    <a href="#" onClick={this.previousSlide} className={this.state.canGoBack ? "" : "disabled"} title="Previous Slide">
                                        <i className="fas fa-chevron-left"></i>
                                    </a>
                                    {this.state.slidePosition} of {this.state.slideCount}
                                    <a href="#" onClick={this.nextSlide} className={this.state.canGoForward ? "" : "disabled"} title="Next slide">
                                        <i className="fas fa-chevron-right"></i>
                                    </a>
                                    {this.state.displayNotes ? (
                                        <a href="#" onClick={() => this.setState({displayNotes: false})} title="Hide the notes">
                                            <i className="fas fa-sticky-note"></i>
                                        </a>
                                    ) : (
                                        <a href="#" onClick={() => this.setState({displayNotes: true})} title="Display the notes">
                                            <i className="far fa-sticky-note"></i>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

Presentation.propTypes = {
    presentation: PropTypes.object,
    displayNotes: PropTypes.bool
};

Presentation.defaultProps = {
    presentation: null,
    displayNotes: false
};

export default Presentation;
