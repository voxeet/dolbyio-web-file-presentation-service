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
            canGoForward: false
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

                this.setState({
                    slideUrl: url,
                    canGoBack: canGoBack,
                    canGoForward: canGoForward
                });
            })
            .catch((e) => console.log(e));
    }

    render() {
        return (
            <div className="presentation row flex-fill">
                <div className="col d-flex flex-column">
                    <div className="inner-presentation h-100">
                        <div>
                            <img src={this.state.slideUrl} />
                            {this.state.canGoBack && (
                                <div className="left h-100">
                                    <button onClick={this.previousSlide}><i className="fas fa-chevron-left fa-3x"></i></button>
                                </div>
                            )}
                            {this.state.canGoForward && (
                                <div className="right h-100">
                                    <button onClick={this.nextSlide}><i className="fas fa-chevron-right fa-3x"></i></button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Presentation.propTypes = {
    isPresentationOwner: PropTypes.bool
};

Presentation.defaultProps = {
    isPresentationOwner: false
};

export default Presentation;
