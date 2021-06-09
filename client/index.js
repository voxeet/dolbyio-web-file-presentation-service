import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import VoxeetSDK from '@voxeet/voxeet-web-sdk';

import Backend from './services/backend';
import Sdk from './services/sdk';

import Loading from './components/loading';
import Login from './components/login';
import Conference from './components/conference';

import './styles/index.less';

class Index extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            loadingMessage: 'Loading...',
            isLoggedIn: false,
            isHost: false,
            fileConverted: null,
            presentation: null,
        };

        this.onConferenceEndedOrLeft = this.onConferenceEndedOrLeft.bind(this);
        this.onSessionOpened = this.onSessionOpened.bind(this);
    }

    componentDidMount() {
        VoxeetSDK.conference.on('ended', this.onConferenceEndedOrLeft);
        VoxeetSDK.conference.on('left', this.onConferenceEndedOrLeft);

        Sdk.initializeSDK()
            .then(() => this.setState({ isLoading: false }))
            .catch((e) => console.log(e));

        // Remove the bottom left link from Google Chrome
        // From: https://stackoverflow.com/a/28206011
        $('body').on('mouseover', 'a', function () {
            var $link = $(this),
                href = $link.attr('href') || $link.data('href');

            $link.off('click.chrome');
            $link
                .on('click.chrome', () => (window.location.href = href))
                .attr('data-href', href)
                .css({ cursor: 'pointer' })
                .removeAttr('href');
        });
    }

    componentWillUnmount() {
        VoxeetSDK.conference.removeListener('ended', this.onConferenceEndedOrLeft);
        VoxeetSDK.conference.removeListener('left', this.onConferenceEndedOrLeft);
    }

    onConferenceEndedOrLeft() {
        this.setState({
            isLoading: true,
            loadingMessage: 'Leaving the conference',
        });

        Sdk.closeSession()
            .then(() => {
                this.setState({
                    isLoading: false,
                    isLoggedIn: false,
                    isHost: false,
                    fileConverted: null,
                });
            })
            .catch((e) => {
                this.setState({ isLoading: false });
                console.log(e);
            });
    }

    onSessionOpened(conferenceAlias, username, isListener, fileConverted, presentation) {
        console.log('Conference alias', conferenceAlias);
        console.log('Username', username);
        const externalId = VoxeetSDK.session.participant.info.externalId;

        if (fileConverted) {
            console.log('Converted file', fileConverted);

            this.setState({
                isLoading: true,
                loadingMessage: 'Creating the conference',
            });

            Backend.createConference(conferenceAlias, externalId)
                .then((conference) => {
                    this.setState({
                        isLoading: true,
                        loadingMessage: 'Joining the conference',
                    });

                    return Sdk.joinConference(conference.conferenceId, conference.ownerToken);
                })
                .then(() => {
                    this.setState({
                        isLoading: false,
                        isLoggedIn: true,
                        isHost: true,
                        fileConverted: fileConverted,
                        presentation: presentation,
                    });
                })
                .catch((e) => {
                    this.setState({ isLoading: false });
                    console.log(e);
                });
        } else {
            this.setState({
                isLoading: true,
                loadingMessage: 'Request access to the conference',
            });

            Backend.getInvited(conferenceAlias, isListener, externalId)
                .then((invitation) => {
                    this.setState({
                        isLoading: true,
                        loadingMessage: 'Joining the conference',
                    });

                    if (isListener) {
                        return Sdk.listenToConference(invitation.conferenceId, invitation.accessToken);
                    }

                    return Sdk.joinConference(invitation.conferenceId, invitation.accessToken);
                })
                .then(() => {
                    this.setState({
                        isLoading: false,
                        isLoggedIn: true,
                        isHost: false,
                    });
                })
                .catch((e) => {
                    this.setState({ isLoading: false });
                    console.log(e);
                });
        }
    }

    render() {
        if (this.state.isLoading) {
            return <Loading message={this.state.loadingMessage} />;
        }

        if (!this.state.isLoggedIn) {
            return <Login handleOnSessionOpened={this.onSessionOpened} />;
        }

        return <Conference isHost={this.state.isHost} fileConverted={this.state.fileConverted} presentation={this.state.presentation} />;
    }
}

ReactDOM.render(<Index />, document.getElementById('root'));
