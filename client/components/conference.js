import React, { Component } from "react";
import PropTypes from "prop-types";

import VoxeetSDK from "@voxeet/voxeet-web-sdk";

import Presentation from "./presentation";
import Slides from "./slides";
import Actions from "./actions";
import Attendees from "./attendees";
import Chat from "./chat";
import StatusBar from "./statusBar";

import "../styles/conference.less";

class Conference extends Component {

    constructor(props) {
        super(props);

        this.state = {
            joined: false,
            conferenceId: null,
            filePresentationStarted: false,
            isPresentationOwner: false
        };

        this.onFilePresentationStarted = this.onFilePresentationStarted.bind(this);
    }

    componentDidMount() {
        VoxeetSDK.filePresentation.on('started', this.onFilePresentationStarted);

        if (this.props.isHost) {
            this.createConference(this.props.conferenceName)
                .then(conference => {
                    this.joinConference(conference.conferenceId, conference.ownerToken)
                        .then(c => {
                            this.setState({
                                joined: true,
                                conferenceId: conference.conferenceId
                            });
                            
                            VoxeetSDK
                                .filePresentation
                                .start(this.props.fileConverted)
                                .then(() => {})
                                .catch((e) => console.log(e));
                        })
                        .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
        } else {
            this.getInvited(this.props.conferenceName)
                .then(invitation => {
                    this.joinConference(invitation.conferenceId, invitation.accessToken)
                        .then(c => {
                            this.setState({
                                joined: true,
                                conferenceId: invitation.conferenceId
                            });
                        })
                        .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
        }
    }

    componentWillUnmount() {
        VoxeetSDK.filePresentation.removeListener('started', this.onFilePresentationStarted);
    }

    onFilePresentationStarted(filePresentation) {
        // Only the owner of the presentation can see all the slides
        const isPresentationOwner = filePresentation.owner.id == VoxeetSDK.session.participant.id;

        this.setState({
            filePresentationStarted: true,
            isPresentationOwner: isPresentationOwner
        });
    }

    async getInvited(conferenceName) {
        const externalId = VoxeetSDK.session.participant.info.externalId;

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                conferenceName: conferenceName,
                externalId: externalId
            })
        };

        // Request our backend for an invitation
        const invitation = await fetch('/get-invited', options)
        return invitation.json();
    }

    async createConference(conferenceName) {
        const externalId = VoxeetSDK.session.participant.info.externalId;

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                alias: conferenceName,
                ownerExternalId: externalId
            })
        };

        // Request our backend to create a conference
        const response = await fetch('/conference', options);
        return response.json();
    }

    async joinConference(conferenceId, conferenceAccessToken) {
        const conference = await VoxeetSDK.conference.fetch(conferenceId);

        // See: https://dolby.io/developers/interactivity-apis/client-sdk/reference-javascript/model/joinoptions
        const joinOptions = {
            conferenceAccessToken: conferenceAccessToken,
            constraints: {
                audio: true,
                video: true
            },
            maxVideoForwarding: 9
        };

        // 2. Join the conference
        await VoxeetSDK.conference.join(conference, joinOptions);
    }

    render() {
        return (
            <div className="conference container-fluid d-flex flex-column">
                <div className="row flex-fill">
                    <div className="main-panel col-md-9">
                        <div className="container-fluid d-flex flex-column">
                            {this.state.filePresentationStarted && <Presentation isPresentationOwner={this.state.isPresentationOwner} /> }
                            {this.state.isPresentationOwner && <Slides /> }
                        </div>
                    </div>
                    <div className="side-panel col-md-3">
                        <div className="container-fluid d-flex flex-column">
                            <Actions />
                            <Attendees />
                            <Chat />
                        </div>
                    </div>
                </div>
                <StatusBar />
            </div>
        );
    }
}

Conference.propTypes = {
    conferenceName: PropTypes.string,
    isHost: PropTypes.bool,
    fileConverted: PropTypes.object
};

Conference.defaultProps = {
    conferenceName: null,
    isHost: false,
    fileConverted: null
};

export default Conference;
