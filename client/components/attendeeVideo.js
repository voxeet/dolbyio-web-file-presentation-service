import React, { Component } from 'react';
import PropTypes from 'prop-types';

export const Layouts = {
    VERTICAL: 'vertical',
    HORIZONTAL: 'horizontal',
    ROUND: 'round',
};

export class AttendeeVideo extends Component {
    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return false;
    }

    componentDidMount() {
        this.updateStream(this.props);
    }

    updateStream(props) {
        navigator.attachMediaStream(this.video, props.stream);
    }

    render() {
        const videoElement = <video ref={(ref) => (this.video = ref)} title={this.props.participantName} playsInline autoPlay muted />;

        switch (this.props.layout) {
            case Layouts.ROUND:
                return (
                    <div className="attendee col-12 col-720p-6">
                        <div className="d-flex justify-content-center">{videoElement}</div>
                        <p>{this.props.participantName}</p>
                    </div>
                );
            case Layouts.HORIZONTAL:
                return (
                    <div className="attendee col-12">
                        {videoElement}
                        <p>{this.props.participantName}</p>
                    </div>
                );
            case Layouts.VERTICAL:
            default:
                return (
                    <div className="attendee col-12 col-720p-6">
                        {videoElement}
                        <p>{this.props.participantName}</p>
                    </div>
                );
        }
    }
}

AttendeeVideo.propTypes = {
    participantId: PropTypes.string,
    participantName: PropTypes.string,
    stream: PropTypes.object,
    layout: PropTypes.string,
};

AttendeeVideo.defaultProps = {
    participantId: null,
    participantName: null,
    stream: null,
    layout: Layouts.VERTICAL,
};
