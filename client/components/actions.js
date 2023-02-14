import React, { Component } from 'react';

import VoxeetSDK from '@voxeet/voxeet-web-sdk';

import Sdk from '../services/sdk';
import Recording from './recording';

import '../styles/actions.less';

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
            backgroundBlur: false,
        };

        this.onConferenceJoined = this.onConferenceJoined.bind(this);
        this.refreshStatus = this.refreshStatus.bind(this);
    }

    componentDidMount() {
        VoxeetSDK.conference.on('joined', this.onConferenceJoined);
        VoxeetSDK.conference.on('participantAdded', this.refreshStatus);
        VoxeetSDK.conference.on('participantUpdated', this.refreshStatus);

        this.refreshStatus();
    }

    componentWillUnmount() {
        VoxeetSDK.conference.removeListener('joined', this.onConferenceJoined);
        VoxeetSDK.conference.removeListener('participantAdded', this.refreshStatus);
        VoxeetSDK.conference.removeListener('participantUpdated', this.refreshStatus);
    }

    onConferenceJoined() {
        this.setState({
            conferenceJoined: true,
        });
    }

    refreshStatus() {
        var users = 0;
        var listeners = 0;

        VoxeetSDK.conference.participants.forEach((participant) => {
            console.log('id', participant.id, 'status', participant.status, 'type', participant.type);
            console.log('name', participant.info.name, 'externalId', participant.info.externalId);

            if (participant.status === 'Connected' || participant.status === 'Inactive') {
                if (participant.type === 'user' || participant.type === 'speaker') {
                    users++;
                } else if (participant.type === 'listener') {
                    listeners++;
                }
            }
        });

        const conferenceName = VoxeetSDK.conference.current.alias;

        const conferenceJoined = VoxeetSDK.conference.current != null;

        const canStartVideo = this.state.canStartVideo && conferenceJoined && VoxeetSDK.conference.current.permissions.has('SEND_VIDEO');
        const canStopVideo = this.state.canStopVideo && conferenceJoined && VoxeetSDK.conference.current.permissions.has('SEND_VIDEO');

        const canMute = this.state.canMute && conferenceJoined && VoxeetSDK.conference.current.permissions.has('SEND_AUDIO');
        const canUnmute = this.state.canUnmute && conferenceJoined && VoxeetSDK.conference.current.permissions.has('SEND_AUDIO');

        this.setState({
            conferenceName: conferenceName,
            nbUsers: users,
            nbListeners: listeners,
            canStartVideo: canStartVideo,
            canStopVideo: canStopVideo,
            canMute: canMute,
            canUnmute: canUnmute,
            conferenceJoined: conferenceJoined,
        });
    }

    async startBackgroundBlur() {
        try {
            await Sdk.enableBackgroundBlur();

            this.setState({
                backgroundBlur: true,
            });
        } catch (error) {
            console.error(error);
        }
    }

    async stopBackgroundBlur() {
        try {
            await Sdk.disableBackgroundBlur();

            this.setState({
                backgroundBlur: false,
            });
        } catch (error) {
            console.error(error);
        }
    }

    async startVideo() {
        try {
            await Sdk.startVideo();

            this.setState({
                canStartVideo: false,
                canStopVideo: true,
            });
        } catch (error) {
            console.error(error);
        }
    }

    async stopVideo() {
        try {
            await Sdk.stopVideo();

            this.setState({
                canStartVideo: true,
                canStopVideo: false,
            });
        } catch (error) {
            console.error(error);
        }
    }

    mute() {
        Sdk.mute();

        this.setState({
            canMute: false,
            canUnmute: true,
        });
    }

    unmute() {
        Sdk.unmute();

        this.setState({
            canMute: true,
            canUnmute: false,
        });
    }

    async leave() {
        await Sdk.leaveConference();
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
                            <Recording />
                            <span className="separator" />

                            <span>
                                {this.state.nbUsers} user{this.state.nbUsers > 1 ? 's' : ''} / {this.state.nbListeners} listener
                                {this.state.nbListeners > 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="col-center">
                            <span>{this.state.conferenceName}</span>
                        </div>
                        <div className="col-right">
                            <span className="separator" />
                            {((this.state.canStartVideo || this.state.canStopVideo) && !this.state.backgroundBlur) && (
                                <button type="button" className="btn btn-action btn-xl" onClick={this.startBackgroundBlur.bind(this)} title="Start the background blur">
                                    <i className="fas fa-low-vision"></i>
                                </button>
                            )}
                            {((this.state.canStartVideo || this.state.canStopVideo) && this.state.backgroundBlur) && (
                                <button type="button" className="btn btn-action btn-xl" onClick={this.stopBackgroundBlur.bind(this)} title="Stop the background blur">
                                    <i className="fas fa-eye"></i>
                                </button>
                            )}
                            {this.state.canStartVideo && (
                                <button type="button" className="btn btn-action btn-xl" onClick={this.startVideo.bind(this)} title="Start the video">
                                    <i className="fas fa-video-slash"></i>
                                </button>
                            )}
                            {this.state.canStopVideo && (
                                <button type="button" className="btn btn-action btn-xl" onClick={this.stopVideo.bind(this)} title="Stop the video">
                                    <i className="fas fa-video"></i>
                                </button>
                            )}
                            {this.state.canMute && (
                                <button type="button" className="btn btn-action btn-xl" onClick={this.mute.bind(this)} title="Mute the microphone">
                                    <i className="fas fa-microphone"></i>
                                </button>
                            )}
                            {this.state.canUnmute && (
                                <button type="button" className="btn btn-action btn-xl" onClick={this.unmute.bind(this)} title="Unmute the microphone">
                                    <i className="fas fa-microphone-slash"></i>
                                </button>
                            )}
                            <button type="button" className="btn btn-danger btn-xl" onClick={this.leave.bind(this)} title="Leave the conference">
                                Leave
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Actions;
