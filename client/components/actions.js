import React, { Component } from "react";
import PropTypes from "prop-types";

import VoxeetSDK from "@voxeet/voxeet-web-sdk";

import "../styles/actions.less";

class Actions extends Component {

    constructor(props) {
        super(props);

        this.state = {
            conferenceJoined: false,
            canStartVideo: false,
            canStopVideo: true,
            canMute: true,
            canUnmute: false,
            canStartRecording: false,
            canStopRecording: false
        };

        this.onConferenceJoined = this.onConferenceJoined.bind(this);
        this.startVideo = this.startVideo.bind(this);
        this.stopVideo = this.stopVideo.bind(this);
        this.mute = this.mute.bind(this);
        this.unmute = this.unmute.bind(this);
        this.leave = this.leave.bind(this);
        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
    }

    componentDidMount() {
        VoxeetSDK.conference.on('joined', this.onConferenceJoined);

        const conferenceJoined = VoxeetSDK.conference.current != null;
        const canRecord = conferenceJoined
            && VoxeetSDK.conference.current.permissions.has('RECORD');

        this.setState({
            conferenceJoined: conferenceJoined,
            canStartRecording: canRecord && VoxeetSDK.recording.current == null,
            canStopRecording: canRecord && VoxeetSDK.recording.current
        });
    }

    componentWillUnmount() {
        VoxeetSDK.conference.removeListener('joined', this.onConferenceJoined);
    }

    onConferenceJoined() {
        this.setState({
            conferenceJoined: true
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

    render() {
        if (!this.state.conferenceJoined) {
            return '';
        }

        return (
            <div className="actions row">
                {this.state.canStartVideo && (
                    <button type="button" className="btn-action btn-inverted" onClick={this.startVideo}>
                        <i className="fas fa-video-slash fa-2x"></i>
                    </button>
                )}
                {this.state.canStopVideo && (
                    <button type="button" className="btn-action" onClick={this.stopVideo}>
                        <i className="fas fa-video fa-2x"></i>
                    </button>
                )}
                {this.state.canMute && (
                    <button type="button" className="btn-action" onClick={this.mute}>
                        <i className="fas fa-microphone fa-2x"></i>
                    </button>
                )}
                {this.state.canUnmute && (
                    <button type="button" className="btn-action btn-inverted" onClick={this.unmute}>
                        <i className="fas fa-microphone-slash fa-2x"></i>
                    </button>
                )}
                {this.state.canStartRecording && (
                    <button type="button" className="btn-action" onClick={this.startRecording} title="Start recording the conference">
                        <i className="fas fa-circle fa-2x"></i>
                    </button>
                )}
                {this.state.canStopRecording && (
                    <button type="button" className="btn-action btn-inverted" onClick={this.stopRecording} title="Stop the recording">
                        <i className="fas fa-square fa-2x"></i>
                    </button>
                )}
                <button type="button" className="btn-action" onClick={this.leave}>
                    <i className="fas fa-door-open fa-2x"></i>
                </button>
            </div>
        );
    }
}

Actions.propTypes = {
    
};

Actions.defaultProps = {
    
};

export default Actions;
