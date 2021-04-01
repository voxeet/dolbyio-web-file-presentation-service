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
            slideCount: 0,
            recording: false
        };

        this.refreshStatusBar = this.refreshStatusBar.bind(this);
        this.onRecordingStarted = this.onRecordingStarted.bind(this);
        this.onRecordingStopped = this.onRecordingStopped.bind(this);
        this.onMessage = this.onMessage.bind(this);
    }

    componentDidMount() {
        VoxeetSDK.conference.on('joined', this.refreshStatusBar);
        VoxeetSDK.conference.on('participantAdded', this.refreshStatusBar);
        VoxeetSDK.conference.on('participantUpdated', this.refreshStatusBar);
        VoxeetSDK.filePresentation.on('updated', this.refreshStatusBar);
        VoxeetSDK.filePresentation.on('started', this.refreshStatusBar);
        VoxeetSDK.command.on("received", this.onMessage);

        document.addEventListener('recordingStarted', this.onRecordingStarted, false);
        document.addEventListener('recordingStopped', this.onRecordingStopped, false);

        if (VoxeetSDK.recording.current != null) {
            this.setState({ recording: true });
        }
    }

    componentWillUnmount() {
        VoxeetSDK.conference.removeListener('joined', this.refreshStatusBar);
        VoxeetSDK.conference.removeListener('participantAdded', this.refreshStatusBar);
        VoxeetSDK.conference.removeListener('participantUpdated', this.refreshStatusBar);
        VoxeetSDK.filePresentation.removeListener('updated', this.refreshStatusBar);
        VoxeetSDK.filePresentation.removeListener('started', this.refreshStatusBar);
        VoxeetSDK.command.removeListener("received", this.onMessage);

        VoxeetSDK.command.removeListener("recordingStarted", this.onRecordingStarted);
        VoxeetSDK.command.removeListener("recordingStopped", this.onRecordingStopped);
    }

    onRecordingStarted() {
        this.setState({
            recording: true
        });
    }

    onRecordingStopped(e) {
        this.setState({
            recording: false
        });
    }

    onMessage(_, message) {
        const data = JSON.parse(message);
        if (data.action == "RecordingState") {
            this.setState({ recording: data.value });
        }
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
                {this.state.recording > 0 && (
                    <span className="recording"><i className="fas fa-circle"></i> Recording is on</span>
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
