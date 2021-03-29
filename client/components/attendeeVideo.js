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
      return (
        <video
            ref={ref => (this.video = ref)}
            height="120px"
            width="120px"
            className="rounded-circle"
            title={this.props.participantName}
            playsInline
            autoPlay
            muted />
      );
    }
}

AttendeeVideo.propTypes = {
    participantId: PropTypes.string,
    participantName: PropTypes.string,
    stream: PropTypes.object,
};

AttendeeVideo.defaultProps = {
    participantId: null,
    participantName: null,
    stream: null
};

export default AttendeeVideo;
