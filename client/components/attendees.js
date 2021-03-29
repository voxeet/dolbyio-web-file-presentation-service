import React, { Component } from "react";

import VoxeetSDK from "@voxeet/voxeet-web-sdk";

import AttendeeVideo from "./attendeeVideo";

import "../styles/attendees.less";


export default class Attendees extends Component {

    constructor(props) {
        super(props);

        this.videoNodes = [];
        this.state = {
            videoNodes : this.videoNodes
        }

        this.onStreamAdded = this.onStreamAdded.bind(this);
        this.onStreamUpdated = this.onStreamUpdated.bind(this);
        this.onStreamRemoved = this.onStreamRemoved.bind(this);
    }

    componentDidMount() {
        // When a video stream is added to the conference
        VoxeetSDK.conference.on('streamAdded', this.onStreamAdded);

        // When a video stream is updated from the conference
        VoxeetSDK.conference.on('streamUpdated', this.onStreamUpdated);

        // When a video stream is removed from the conference
        VoxeetSDK.conference.on('streamRemoved', this.onStreamRemoved);
    }

    componentWillUnmount() {
        VoxeetSDK.conference.removeListener('streamAdded', this.onStreamAdded);
        VoxeetSDK.conference.removeListener('streamUpdated', this.onStreamUpdated);
        VoxeetSDK.conference.removeListener('streamRemoved', this.onStreamRemoved);
    }

    onStreamAdded(participant, stream) {
        if (stream.type === 'ScreenShare') return;

        console.log(`${Date.now()} - streamAdded from ${participant.info.name} (${participant.id})`);

        if (stream.getVideoTracks().length) {
            // Only add the video node if there is a video track
            this.addVideoNode(participant, stream);
        }
    }

    onStreamUpdated(participant, stream) {
        if (stream.type === 'ScreenShare') return;

        console.log(`${Date.now()} - streamUpdated from ${participant.info.name} (${participant.id})`);

        if (stream.getVideoTracks().length) {
            // Only add the video node if there is a video track
            this.addVideoNode(participant, stream);
        } else {
            this.removeVideoNode(participant.id);
        }
    }

    onStreamRemoved(participant, stream) {
        if (stream.type === 'ScreenShare') return;

        console.log(`${Date.now()} - streamRemoved from ${participant.info.name} (${participant.id})`);

        this.removeVideoNode(participant.id);
    }

    addVideoNode(participant, stream) {
        for (let index = 0; index < this.videoNodes.length; index++) {
            const videoNode = this.videoNodes[index];
            if (videoNode.key == `video-${participant.id}`) {
                return;
            }
        }

        let videoNode = <AttendeeVideo
            key={`video-${participant.id}`}
            participantId={participant.id}
            participantName={participant.info.name}
            stream={stream} />

        this.videoNodes.push(videoNode);
        this.setState({
            videoNodes : this.videoNodes
        });
    }

    removeVideoNode(participantId) {
        const key = `video-${participantId}`;

        const tmpVideoNodes = [];
        for (let index = 0; index < this.videoNodes.length; index++) {
            const videoNode = this.videoNodes[index];
            if (videoNode.key != key) {
                tmpVideoNodes.push(videoNode);
            }
        }

        this.videoNodes = tmpVideoNodes;
        this.setState({
            videoNodes : this.videoNodes
        });
    }

    render() {
        return (
            <div className="attendees row">
                <div className="col">
                    <div className="videos">
                        {this.state.videoNodes}
                    </div>
                </div>
            </div>
        );
    }
}
