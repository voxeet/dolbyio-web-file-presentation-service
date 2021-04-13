import React, { Component } from "react";
import PropTypes from "prop-types";

import "../styles/loading.less";


class Loading extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="loading row h-100 align-items-center">
                <div className="mx-auto text-center">
                    <div className="ddloader mx-auto"></div>
                    <h1>{this.props.message}</h1>
                </div>
            </div>
        );
    }
}

Loading.propTypes = {
    message: PropTypes.string
};

Loading.defaultProps = {
    message: "Loading..."
};

export default Loading;
