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
        this.leave = this.leave.bind(this);
    }

    componentDidMount() {
        this.setState({
            conferenceJoined: VoxeetSDK.conference.current != null
        });

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

    leave() {
        VoxeetSDK
            .conference
            .leave()
            .catch((e) => console.log(e));
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
