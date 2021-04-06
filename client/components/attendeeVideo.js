import React, { Component } from "react";
import PropTypes from "prop-types";

class AttendeeVideo extends Component {

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
        if (this.props.round) {
            return (
                <div className="attendee col-12 col-720p-6">
                    <div className="d-flex justify-content-center">
                        <video
                            ref={ref => (this.video = ref)}
                            title={this.props.participantName}
                            playsInline
                            autoPlay
                            muted />
                    </div>
                    <p>{this.props.participantName}</p>
                </div>
            );
        }

        return (
            <div className="attendee col-12 col-720p-6">
                <video
                    ref={ref => (this.video = ref)}
                    title={this.props.participantName}
                    playsInline
                    autoPlay
                    muted />
                <p>{this.props.participantName}</p>
            </div>
        );
    }
}

AttendeeVideo.propTypes = {
    participantId: PropTypes.string,
    participantName: PropTypes.string,
    stream: PropTypes.object,
    round: PropTypes.bool
};

AttendeeVideo.defaultProps = {
    participantId: null,
    participantName: null,
    stream: null,
    round: false
};

export default AttendeeVideo;
