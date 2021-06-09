import React, { Component } from 'react';
import PropTypes from 'prop-types';

import VoxeetSDK from '@voxeet/voxeet-web-sdk';

import { AttendeeVideo, Layouts } from './attendeeVideo';

import '../styles/attendees.less';

class Attendees extends Component {
    constructor(props) {
        super(props);

        this.videoNodes = [];
        this.state = {
            videoNodes: this.videoNodes,
        };

        this.onStreamAdded = this.onStreamAdded.bind(this);
        this.onStreamUpdated = this.onStreamUpdated.bind(this);
        this.onStreamRemoved = this.onStreamRemoved.bind(this);
    }

    componentDidMount() {
        VoxeetSDK.conference.on('streamAdded', this.onStreamAdded);
        VoxeetSDK.conference.on('streamUpdated', this.onStreamUpdated);
        VoxeetSDK.conference.on('streamRemoved', this.onStreamRemoved);

        // Load the streams for all active participants after this component is loaded
        VoxeetSDK.conference.participants.forEach((participant) => {
            if (participant.streams) {
                for (let index = 0; index < participant.streams.length; index++) {
                    const stream = participant.streams[index];
                    if (stream.getVideoTracks().length) {
                        this.addVideoNode(participant, stream);
                        break;
                    }
                }
            }
        });
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

        let videoNode = (
            <AttendeeVideo
                key={`video-${participant.id}`}
                participantId={participant.id}
                participantName={participant.info.name}
                stream={stream}
                layout={this.props.videoLayout}
            />
        );

        this.videoNodes.push(videoNode);
        this.setState({
            videoNodes: this.videoNodes,
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
            videoNodes: this.videoNodes,
        });
    }

    render() {
        const cssClasses = `attendees ${this.props.videoLayout} row`;
        return <div className={cssClasses}>{this.state.videoNodes}</div>;
    }
}

Attendees.propTypes = {
    videoLayout: PropTypes.string,
};

Attendees.defaultProps = {
    videoLayout: Layouts.VERTICAL,
};

export default Attendees;
