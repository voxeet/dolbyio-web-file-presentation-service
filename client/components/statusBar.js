import React, { Component } from "react";
import PropTypes from "prop-types";

import VoxeetSDK from "@voxeet/voxeet-web-sdk";

import "../styles/statusBar.less";

class StatusBar extends Component {

    constructor(props) {
        super(props);

        this.state = {
            conferenceName: '',
            nbUsers: 0,
            nbListeners: 0,
            slidePosition: 0,
            slideCount: 0
        };

        this.onConferenceJoined = this.onConferenceJoined.bind(this);
        this.onConferenceParticipantEvent = this.onConferenceParticipantEvent.bind(this);
        this.onFilePresentationEvent = this.onFilePresentationEvent.bind(this);
    }

    componentDidMount() {
        VoxeetSDK.conference.on('joined', this.onConferenceJoined);
        VoxeetSDK.conference.on('participantAdded', this.onConferenceParticipantEvent);
        VoxeetSDK.conference.on('participantUpdated', this.onConferenceParticipantEvent);
        VoxeetSDK.filePresentation.on('updated', this.onFilePresentationEvent);
        VoxeetSDK.filePresentation.on('started', this.onFilePresentationEvent);
    }

    componentWillUnmount() {
        VoxeetSDK.conference.removeListener('joined', this.onConferenceJoined);
        VoxeetSDK.conference.removeListener('participantAdded', this.onConferenceParticipantEvent);
        VoxeetSDK.conference.removeListener('participantUpdated', this.onConferenceParticipantEvent);
        VoxeetSDK.filePresentation.removeListener('updated', this.onFilePresentationEvent);
        VoxeetSDK.filePresentation.removeListener('started', this.onFilePresentationEvent);
    }

    onConferenceJoined() {
        this.refreshStatusBar();
    }

    onConferenceParticipantEvent(participant) {
        this.refreshStatusBar();
    }

    onFilePresentationEvent(filePresentation) {
        this.refreshStatusBar();
    }
    
    refreshStatusBar() {
        var users = 0;
        var listeners = 0;

        VoxeetSDK.conference.participants.forEach(participant => {
            if (participant.status === "Connected" || participant.status === "Inactive") {
                if (participant.type === "user" || participant.type === "speaker") {
                    users++;
                } else if (participant.type === "listener") {
                    listeners++;
                }
            }
        });

        const conferenceName = VoxeetSDK.conference.current.alias;

        const slidePosition = VoxeetSDK.filePresentation.current?.position ?? 0;
        const slideCount = VoxeetSDK.filePresentation.current?.imageCount ?? 0;

        this.setState({
            conferenceName: conferenceName,
            nbUsers: users,
            nbListeners: listeners,
            slidePosition: slidePosition,
            slideCount: slideCount
        });
    }

    render() {
      return (
        <div className="statusBar row">
            <div className="col col-left">
                {this.state.slideCount > 0 && (
                    <span>Slide {this.state.slidePosition + 1} of {this.state.slideCount}</span>
                )}
            </div>
            <div className="col col-center">
            </div>
            <div className="col col-right">
                <span>{this.state.conferenceName}</span>
                <span>{this.state.nbUsers} user{this.state.nbUsers > 1 ? "s" : ""} / {this.state.nbListeners} listener{this.state.nbListeners > 1 ? "s" : ""}</span>
            </div>
        </div>
      );
    }
}

StatusBar.propTypes = {
    
};

StatusBar.defaultProps = {
    
};

export default StatusBar;
