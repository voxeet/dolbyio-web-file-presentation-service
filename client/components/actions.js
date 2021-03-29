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
            canUnmute: false
        };

        this.onConferenceJoined = this.onConferenceJoined.bind(this);
        this.startVideo = this.startVideo.bind(this);
        this.stopVideo = this.stopVideo.bind(this);
        this.mute = this.mute.bind(this);
        this.unmute = this.unmute.bind(this);
    }

    componentDidMount() {
        VoxeetSDK.conference.on('joined', this.onConferenceJoined);
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

    render() {
        if (!this.state.conferenceJoined) {
            return '';
        }

        return (
            <div className="actions row justify-content-center">
                <div className="col-10 align-self-center">
                    {this.state.canStartVideo && (
                        <button type="button" className="btn-action" onClick={this.startVideo}>
                            <i className="fas fa-video-slash fa-3x"></i>
                            <p>Start Video</p>
                        </button>
                    )}
                    {this.state.canStopVideo && (
                        <button type="button" className="btn-action" onClick={this.stopVideo}>
                            <i className="fas fa-video fa-3x"></i>
                            <p>Stop Video</p>
                        </button>
                    )}
                    {this.state.canMute && (
                        <button type="button" className="btn-action" onClick={this.mute}>
                            <i className="fas fa-microphone fa-3x"></i>
                            <p>Mute</p>
                        </button>
                    )}
                    {this.state.canUnmute && (
                        <button type="button" className="btn-action" onClick={this.unmute}>
                            <i className="fas fa-microphone-slash fa-3x"></i>
                            <p>Unmute</p>
                        </button>
                    )}
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
