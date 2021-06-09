import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import VoxeetSDK from '@voxeet/voxeet-web-sdk';

import Presentation from './components/presentation';
import Attendees from './components/attendees';

import './styles/conference.less';
import './styles/index.less';

class Mixer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            readyToStart: false,
            filePresentationStarted: false,
            conferenceEnded: false,
        };

        this.onFilePresentationStarted = this.onFilePresentationStarted.bind(this);
        this.onConferenceEnded = this.onConferenceEnded.bind(this);
        this.initializeVoxeetSDK = this.initializeVoxeetSDK.bind(this);
        this.joinConference = this.joinConference.bind(this);
        this.replayConference = this.replayConference.bind(this);
    }

    componentDidMount() {
        VoxeetSDK.filePresentation.on('started', this.onFilePresentationStarted);
        VoxeetSDK.conference.on('left', this.onConferenceEnded);
        VoxeetSDK.conference.on('ended', this.onConferenceEnded);

        this.setState({
            readyToStart: true,
        });
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

    initializeVoxeetSDK() {
        // Load the settings injected by the mixer
        const accessToken = document.getElementById('accessToken').value;
        const refreshToken = document.getElementById('refreshToken').value;
        const refreshUrl = document.getElementById('refreshUrl').value;

        // Reference: https://dolby.io/developers/interactivity-apis/client-sdk/reference-javascript/voxeetsdk#static-initializetoken
        VoxeetSDK.initializeToken(accessToken, () =>
            fetch(refreshUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + accessToken,
                },
                body: { refresh_token: refreshToken },
            })
                .then((data) => data.json())
                .then((json) => json.access_token)
        );
    }

    joinConference() {
        this.initializeVoxeetSDK();

        // Load the settings injected by the mixer
        const catToken = document.getElementById('catToken').value;
        const layoutType = document.getElementById('layoutType').value;
        const thirdPartyId = document.getElementById('thirdPartyId').value;
        const conferenceId = document.getElementById('conferenceId').value;

        const mixer = {
            name: 'Mixer',
            externalId: 'Mixer_' + layoutType,
            thirdPartyId: thirdPartyId,
        };

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

        // Open a session for the mixer
        VoxeetSDK.session
            .open(mixer)
            .then(() => VoxeetSDK.conference.fetch(conferenceId))
            // Join the conference
            .then((conference) => VoxeetSDK.conference.join(conference, joinOptions))
            .catch((err) => console.log(err));
    }

    replayConference() {
        this.initializeVoxeetSDK();

        // Load the settings injected by the mixer
        const catToken = document.getElementById('catToken').value;
        const layoutType = document.getElementById('layoutType').value;
        const thirdPartyId = document.getElementById('thirdPartyId').value;
        const conferenceId = document.getElementById('conferenceId').value;

        const mixer = {
            name: 'Mixer',
            externalId: 'Mixer_' + layoutType,
            thirdPartyId: thirdPartyId,
        };

        const replayOptions = {
            conferenceAccessToken: catToken && catToken.length > 0 ? catToken : null,
            offset: 0,
        };

        // Open a session for the mixer
        VoxeetSDK.session
            .open(mixer)
            .then(() => VoxeetSDK.conference.fetch(conferenceId))
            // Replay the conference from the beginning
            .then((conference) =>
                VoxeetSDK.conference.replay(conference, replayOptions, {
                    enabled: true,
                })
            )
            .catch((err) => console.log(err));
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
                    <input type="hidden" value="accessToken" id="accessToken" name="accessToken" />
                    <input type="hidden" value="refreshToken" id="refreshToken" name="refreshToken" />
                    <input type="hidden" value="catToken" id="catToken" name="catToken" />
                    <input type="hidden" value="voxeet" id="conferenceId" name="conferenceId" />
                    <input type="hidden" value="refreshUrl" id="refreshUrl" name="refreshUrl" />
                    <input type="hidden" value="1234" id="thirdPartyId" name="thirdPartyId" />
                    <input type="hidden" value="stream" id="layoutType" name="layoutType" />

                    <button id="joinConference" onClick={this.joinConference}>
                        Join conference
                    </button>
                    <button id="replayConference" onClick={this.replayConference}>
                        Replay conference
                    </button>

                    {this.state.readyToStart && <div id="conferenceStartedVoxeet" />}
                    {this.state.conferenceEnded && <div id="conferenceEndedVoxeet" />}
                </div>
            </main>
        );
    }
}

ReactDOM.render(<Mixer />, document.getElementById('root'));
