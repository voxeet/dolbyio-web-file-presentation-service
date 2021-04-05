import React, { Component } from "react";
import PropTypes from "prop-types";

import VoxeetSDK from "@voxeet/voxeet-web-sdk";

import "../styles/actions.less";

class Actions extends Component {

    constructor(props) {
        super(props);

        this.state = {
            conferenceName: '',
            conferenceJoined: false,
            nbUsers: 0,
            nbListeners: 0,
            canStartVideo: false,
            canStopVideo: true,
            canMute: true,
            canUnmute: false,
            canStartRecording: false,
            canStopRecording: false,
            recording: false
        };

        this.onConferenceJoined = this.onConferenceJoined.bind(this);
        this.refreshStatus = this.refreshStatus.bind(this);
        this.startVideo = this.startVideo.bind(this);
        this.stopVideo = this.stopVideo.bind(this);
        this.mute = this.mute.bind(this);
        this.unmute = this.unmute.bind(this);
        this.leave = this.leave.bind(this);
        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
        this.onRecordingStarted = this.onRecordingStarted.bind(this);
        this.onRecordingStopped = this.onRecordingStopped.bind(this);
    }

    componentDidMount() {
        VoxeetSDK.conference.on('joined', this.onConferenceJoined);
        VoxeetSDK.conference.on('participantAdded', this.refreshStatus);
        VoxeetSDK.conference.on('participantUpdated', this.refreshStatus);

        document.addEventListener('recordingStarted', this.onRecordingStarted, false);
        document.addEventListener('recordingStopped', this.onRecordingStopped, false);

        this.refreshStatus();
    }

    componentWillUnmount() {
        VoxeetSDK.conference.removeListener('joined', this.onConferenceJoined);
        VoxeetSDK.conference.removeListener('participantAdded', this.refreshStatus);
        VoxeetSDK.conference.removeListener('participantUpdated', this.refreshStatus);

        VoxeetSDK.command.removeListener("recordingStarted", this.onRecordingStarted);
        VoxeetSDK.command.removeListener("recordingStopped", this.onRecordingStopped);
    }

    onConferenceJoined() {
        this.setState({
            conferenceJoined: true
        });
    }

    refreshStatus() {
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

        const permissions = VoxeetSDK.conference.current.permissions;

        const conferenceJoined = VoxeetSDK.conference.current != null;
        const canRecord = conferenceJoined && permissions.has('RECORD');

        const canStartVideo = this.state.canStartVideo && permissions.has('SEND_VIDEO');
        const canStopVideo = this.state.canStopVideo && permissions.has('SEND_VIDEO');

        const canMute = this.state.canMute && permissions.has('SEND_AUDIO');
        const canUnmute = this.state.canUnmute && permissions.has('SEND_AUDIO');

        this.setState({
            conferenceName: conferenceName,
            nbUsers: users,
            nbListeners: listeners,
            canStartVideo: canStartVideo,
            canStopVideo: canStopVideo,
            canMute: canMute,
            canUnmute: canUnmute,
            conferenceJoined: conferenceJoined,
            canStartRecording: canRecord && VoxeetSDK.recording.current == null,
            canStopRecording: canRecord && VoxeetSDK.recording.current
        });
    }

    startVideo() {
        VoxeetSDK
            .conference
            .startVideo(VoxeetSDK.session.participant)
            .then(() => {
                this.setState({
                    canStartVideo: false,
                    canStopVideo: true
                });
            })
            .catch((e) => console.log(e));
    }

    stopVideo() {
        VoxeetSDK
            .conference
            .stopVideo(VoxeetSDK.session.participant)
            .then(() => {
                this.setState({
                    canStartVideo: true,
                    canStopVideo: false
                });
            })
            .catch((e) => console.log(e));
    }

    mute() {
        VoxeetSDK.conference.mute(VoxeetSDK.session.participant, true);

        this.setState({
            canMute: false,
            canUnmute: true
        });
    }

    unmute() {
        VoxeetSDK.conference.mute(VoxeetSDK.session.participant, false);

        this.setState({
            canMute: true,
            canUnmute: false
        });
    }

    leave() {
        VoxeetSDK
            .conference
            .leave()
            .catch(e => console.log(e));
    }

    startRecording() {
        console.log('Starting the recording...');

        VoxeetSDK
            .recording
            .start()
            .then(() => {
                this.setState({
                    canStartRecording: false,
                    canStopRecording: true
                });

                const msg = JSON.stringify({
                    action: 'RecordingState',
                    value: true
                });

                // Send a message to alert other participants
                VoxeetSDK
                    .command
                    .send(msg)
                    .catch(e => console.log(e));

                const event = new Event('recordingStarted');
                document.dispatchEvent(event);
            })
            .catch(e => console.log(e));
    }

    stopRecording() {
        console.log('Stopping the recording...');

        VoxeetSDK
            .recording
            .stop()
            .then(() => {
                this.setState({
                    canStartRecording: true,
                    canStopRecording: false
                });

                const msg = JSON.stringify({
                    action: 'RecordingState',
                    value: false
                });

                VoxeetSDK
                    .command
                    .send(msg)
                    .catch(e => console.log(e));

                const event = new Event('recordingStopped');
                document.dispatchEvent(event);
            })
            .catch(e => console.log(e));
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

    render() {
        if (!this.state.conferenceJoined) {
            return '';
        }

        return (
            <div className="actions row">
                <div className="col">
                    <div className="d-flex justify-content-between">
                        <div className="col-left">
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
                            {this.state.recording > 0 && (
                                <span className="recording"><i className="fas fa-circle"></i> Recording is on</span>
                            )}

                            <span className="separator" />
                            <span>{this.state.nbUsers} user{this.state.nbUsers > 1 ? "s" : ""} / {this.state.nbListeners} listener{this.state.nbListeners > 1 ? "s" : ""}</span>
                        </div>
                        <div className="col-center">
                            <span>{this.state.conferenceName}</span>
                        </div>
                        <div className="col-right">
                            <span className="separator" />
                            {this.state.canStartVideo && (
                                <button type="button" className="btn btn-action btn-xl" onClick={this.startVideo} title="Start the video">
                                    <i className="fas fa-video-slash"></i>
                                </button>
                            )}
                            {this.state.canStopVideo && (
                                <button type="button" className="btn btn-action btn-xl" onClick={this.stopVideo} title="Stop the video">
                                    <i className="fas fa-video"></i>
                                </button>
                            )}
                            {this.state.canMute && (
                                <button type="button" className="btn btn-action btn-xl" onClick={this.mute} title="Mute the microphone">
                                    <i className="fas fa-microphone"></i>
                                </button>
                            )}
                            {this.state.canUnmute && (
                                <button type="button" className="btn btn-action btn-xl" onClick={this.unmute} title="Unmute the microphone">
                                    <i className="fas fa-microphone-slash"></i>
                                </button>
                            )}
                            <button type="button" className="btn btn-danger btn-xl" onClick={this.leave} title="Leave the conference">
                                Leave
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Actions.propTypes = {
    
};

Actions.defaultProps = {
    
};

export default Actions;
