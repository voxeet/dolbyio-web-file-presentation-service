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

    async componentDidMount() {
        VoxeetSDK.conference.on('ended', this.onConferenceEndedOrLeft);
        VoxeetSDK.conference.on('left', this.onConferenceEndedOrLeft);

        try {
            await Sdk.initializeSDK();
            this.setState({ isLoading: false });
        } catch (error) {
            console.error(error);
        }

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

    async onConferenceEndedOrLeft() {
        this.setState({
            isLoading: true,
            loadingMessage: 'Leaving the conference',
        });

        try {
            await Sdk.closeSession();

            this.setState({
                isLoading: false,
                isLoggedIn: false,
                isHost: false,
                fileConverted: null,
            });
        } catch (error) {
            this.setState({ isLoading: false });
            console.error(error);
        }
    }

    async onSessionOpened(conferenceAlias, username, isListener, fileConverted, presentation) {
        console.log('Conference alias', conferenceAlias);
        console.log('Username', username);
        const externalId = VoxeetSDK.session.participant.info.externalId;

        try {
            if (fileConverted) {
                console.log('Converted file', fileConverted);

                this.setState({
                    isLoading: true,
                    loadingMessage: 'Creating the conference',
                });

                const conference = await Backend.createConference(conferenceAlias, externalId);

                this.setState({
                    isLoading: true,
                    loadingMessage: 'Joining the conference',
                });

                await Sdk.joinConference(conference.conferenceId, conference.ownerToken);

                this.setState({
                    isLoading: false,
                    isLoggedIn: true,
                    isHost: true,
                    fileConverted: fileConverted,
                    presentation: presentation,
                });
            } else {
                this.setState({
                    isLoading: true,
                    loadingMessage: 'Request access to the conference',
                });

                const invitation = Backend.getInvited(conferenceAlias, isListener, externalId);

                this.setState({
                    isLoading: true,
                    loadingMessage: 'Joining the conference',
                });

                if (isListener) {
                    await Sdk.listenToConference(invitation.conferenceId, invitation.accessToken);
                } else {
                    await Sdk.joinConference(invitation.conferenceId, invitation.accessToken);
                }

                this.setState({
                    isLoading: false,
                    isLoggedIn: true,
                    isHost: false,
                });
            }
        } catch (error) {
            this.setState({ isLoading: false });
            console.error(error);
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
