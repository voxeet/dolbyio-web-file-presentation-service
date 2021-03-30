import React, { Component } from "react";
import PropTypes from "prop-types";

import VoxeetSDK from "@voxeet/voxeet-web-sdk";

import Loading from "./loading";
import Presentation from "./presentation";
import Slides from "./slides";
import Actions from "./actions";
import Attendees from "./attendees";
import Chat from "./chat";
import StatusBar from "./statusBar";

import "../styles/conference.less";

class Conference extends Component {

    constructor(props) {
        super(props);

        this.state = {
            filePresentationStarted: false,
            isPresentationOwner: false,
            isLoading: this.props.isHost, // Will start the presentation
            loadingMessage: 'Loading...'
        };

        this.onFilePresentationStarted = this.onFilePresentationStarted.bind(this);
    }

    componentDidMount() {
        VoxeetSDK.filePresentation.on('started', this.onFilePresentationStarted);

        if (this.props.isHost) {
            this.setState({
                isLoading: true,
                loadingMessage: 'Starting the presentation'
            });
            
            VoxeetSDK
                .filePresentation
                .start(this.props.fileConverted)
                .then(() => {
                    this.setState({ isLoading: false });
                })
                .catch((e) => {
                    this.setState({ isLoading: false });
                    console.log(e);
                });
        } else if (VoxeetSDK.filePresentation.current != null) {
            this.onFilePresentationStarted(VoxeetSDK.filePresentation.current);
        }
    }

    componentWillUnmount() {
        VoxeetSDK.filePresentation.removeListener('started', this.onFilePresentationStarted);
    }

    onFilePresentationStarted(filePresentation) {
        // Only the owner of the presentation can see all the slides
        const isPresentationOwner = filePresentation.owner.id == VoxeetSDK.session.participant.id;

        this.setState({
            filePresentationStarted: true,
            isPresentationOwner: isPresentationOwner
        });
    }

    render() {
        if (this.state.isLoading) {
            return <Loading message={this.state.loadingMessage} />;
        }

        return (
            <div className="conference container-fluid d-flex flex-column">
                <div className="row flex-fill">
                    <div className="main-panel col-md-9">
                        <div className="container-fluid d-flex flex-column">
                            {this.state.filePresentationStarted && <Presentation /> }
                            {this.state.isPresentationOwner && <Slides /> }
                        </div>
                    </div>
                    <div className="side-panel col-md-3">
                        <div className="container-fluid d-flex flex-column">
                            <Actions />
                            <Attendees />
                            <Chat />
                        </div>
                    </div>
                </div>
                <StatusBar />
            </div>
        );
    }
}

Conference.propTypes = {
    isHost: PropTypes.bool,
    fileConverted: PropTypes.object
};

Conference.defaultProps = {
    isHost: false,
    fileConverted: null
};

export default Conference;
