import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import VoxeetSDK from '@voxeet/voxeet-web-sdk';

import Presentation from './components/presentation';
import Attendees from './components/attendees';
import Sdk from './services/sdk';

import './styles/conference.less';
import './styles/index.less';

class Mixer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            filePresentationStarted: false,
            conferenceStarted: false,
            conferenceEnded: false,
        };

        this.onFilePresentationStarted = this.onFilePresentationStarted.bind(this);
        this.onConferenceEnded = this.onConferenceEnded.bind(this);
    }

    componentDidMount() {
        VoxeetSDK.filePresentation.on('started', this.onFilePresentationStarted);
        VoxeetSDK.conference.on('left', this.onConferenceEnded);
        VoxeetSDK.conference.on('ended', this.onConferenceEnded);
    }

    componentWillUnmount() {
        VoxeetSDK.filePresentation.removeListener('started', this.onFilePresentationStarted);
        VoxeetSDK.conference.removeListener('left', this.onConferenceEnded);
        VoxeetSDK.conference.removeListener('ended', this.onConferenceEnded);
    }

    onFilePresentationStarted() {
        this.setState({
            filePresentationStarted: true,
        });
    }

    async joinConference() {
        // Load the settings injected by the mixer
        const accessToken = document.getElementById('accessToken').value;
        const refreshToken = document.getElementById('refreshToken').value;
        const refreshUrl = document.getElementById('refreshUrl').value;
        Sdk.initializeSDKWithToken(accessToken, refreshToken, refreshUrl);

        const layoutType = document.getElementById('layoutType').value;
        const thirdPartyId = document.getElementById('thirdPartyId').value;
        const mixer = {
            name: 'Mixer',
            externalId: `Mixer_${layoutType}`,
            thirdPartyId: thirdPartyId,
        };

        const catToken = document.getElementById('catToken').value;
        const joinOptions = {
            conferenceAccessToken: catToken && catToken.length > 0 ? catToken : null,
            constraints: {
                video: false,
                audio: false,
            },
            mixing: {
                enabled: true,
            },
            userParams: {},
        };

        try {
            // Open a session for the mixer
            await VoxeetSDK.session.open(mixer);

            const conferenceId = document.getElementById('conferenceId').value;
            const conference = await VoxeetSDK.conference.fetch(conferenceId);

            // Join the conference
            await VoxeetSDK.conference.join(conference, joinOptions);

            this.setState({ conferenceStarted: true });
        } catch (error) {
            console.error(error);
        }
    }

    async replayConference() {
        // Load the settings injected by the mixer
        const accessToken = document.getElementById('accessToken').value;
        const refreshToken = document.getElementById('refreshToken').value;
        const refreshUrl = document.getElementById('refreshUrl').value;
        Sdk.initializeSDKWithToken(accessToken, refreshToken, refreshUrl);

        const layoutType = document.getElementById('layoutType').value;
        const thirdPartyId = document.getElementById('thirdPartyId').value;
        const mixer = {
            name: 'Mixer',
            externalId: `Mixer_${layoutType}`,
            thirdPartyId: thirdPartyId,
        };

        const catToken = document.getElementById('catToken').value;
        const replayOptions = {
            conferenceAccessToken: catToken && catToken.length > 0 ? catToken : null,
            offset: 0,
        };

        try {
            // Open a session for the mixer
            await VoxeetSDK.session.open(mixer);

            const conferenceId = document.getElementById('conferenceId').value;
            const conference = await VoxeetSDK.conference.fetch(conferenceId);

            // Replay the conference from the beginning
            await VoxeetSDK.conference.replay(conference, replayOptions, {
                enabled: true,
            });

            this.setState({ conferenceStarted: true });
        } catch (error) {
            console.error(error);
        }
    }

    onConferenceEnded() {
        this.setState({
            conferenceEnded: true,
        });
    }

    render() {
        return (
            <main className="conference container-fluid d-flex h-100 flex-column">
                <div className="row flex-grow-1">
                    <div className="main-panel col-10">
                        <div className="container-fluid d-flex h-100 flex-column">{this.state.filePresentationStarted && <Presentation />}</div>
                    </div>
                    <div className="side-panel col-2">
                        <Attendees />
                    </div>
                </div>

                <div className="hide">
                    <input type="hidden" defaultValue="accessToken" id="accessToken" name="accessToken" />
                    <input type="hidden" defaultValue="refreshToken" id="refreshToken" name="refreshToken" />
                    <input type="hidden" defaultValue="catToken" id="catToken" name="catToken" />
                    <input type="hidden" defaultValue="conferenceId" id="conferenceId" name="conferenceId" />
                    <input type="hidden" defaultValue="refreshUrl" id="refreshUrl" name="refreshUrl" />
                    <input type="hidden" defaultValue="thirdPartyId" id="thirdPartyId" name="thirdPartyId" />
                    <input type="hidden" defaultValue="layoutType" id="layoutType" name="layoutType" />

                    <button id="joinConference" onClick={this.joinConference.bind(this)}>
                        Join conference
                    </button>
                    <button id="replayConference" onClick={this.replayConference.bind(this)}>
                        Replay conference
                    </button>

                    {this.state.conferenceStarted && <div id="conferenceStartedVoxeet" />}
                    {this.state.conferenceEnded && <div id="conferenceEndedVoxeet" />}
                </div>
            </main>
        );
    }
}

ReactDOM.render(<Mixer />, document.getElementById('root'));
