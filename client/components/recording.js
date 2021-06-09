import React, { Component } from "react";

import VoxeetSDK from "@voxeet/voxeet-web-sdk";

import Sdk from "../services/sdk";


class Recording extends Component {

    constructor(props) {
        super(props);

        this.state = {
            canStartRecording: false,
            canStopRecording: false,
            isRecording: false
        };

        this.refreshStatus = this.refreshStatus.bind(this);
        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
        this.onRecordingStarted = this.onRecordingStarted.bind(this);
        this.onRecordingStopped = this.onRecordingStopped.bind(this);
    }

    componentDidMount() {
        VoxeetSDK.conference.on("participantAdded", this.refreshStatus);
        VoxeetSDK.conference.on("participantUpdated", this.refreshStatus);

        document.addEventListener("recordingStarted", this.onRecordingStarted, false);
        document.addEventListener("recordingStopped", this.onRecordingStopped, false);

        this.refreshStatus();
    }

    componentWillUnmount() {
        VoxeetSDK.conference.removeListener("participantAdded", this.refreshStatus);
        VoxeetSDK.conference.removeListener("participantUpdated", this.refreshStatus);

        VoxeetSDK.command.removeListener("recordingStarted", this.onRecordingStarted);
        VoxeetSDK.command.removeListener("recordingStopped", this.onRecordingStopped);
    }

    refreshStatus() {
        var isRecording = VoxeetSDK.recording.current != null;

        const canRecord = VoxeetSDK.conference.current != null
            && VoxeetSDK.conference.current.permissions.has("RECORD");

        this.setState({
            isRecording: isRecording,
            canStartRecording: canRecord && !isRecording,
            canStopRecording: canRecord && isRecording
        });
    }

    startRecording() {
        Sdk.startRecording()
            .then(() => {
                this.setState({
                    canStartRecording: false,
                    canStopRecording: true
                });
            })
            .catch(e => console.log(e));
    }

    stopRecording() {
        Sdk.stopRecording()
            .then(() => {
                this.setState({
                    canStartRecording: true,
                    canStopRecording: false
                });
            })
            .catch(e => console.log(e));
    }

    onRecordingStarted() {
        this.setState({
            isRecording: true
        });
    }

    onRecordingStopped() {
        this.setState({
            isRecording: false
        });
    }

    render() {
        return (
            <React.Fragment>
                {this.state.canStartRecording && (
                    <button type="button" className="btn btn-action btn-xl" onClick={this.startRecording} title="Start recording the conference">
                        <i className="fas fa-circle"></i>
                    </button>
                )}
                {this.state.canStopRecording && (
                    <button type="button" className="btn btn-action btn-xl" onClick={this.stopRecording} title="Stop the recording">
                        <i className="fas fa-square"></i>
                    </button>
                )}
                {this.state.isRecording && (
                    <span className="recording"><i className="fas fa-circle"></i> Recording is on</span>
                )}
            </React.Fragment>
        );
    }
}

export default Recording;
