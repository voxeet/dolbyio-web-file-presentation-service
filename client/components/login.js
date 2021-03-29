import React, { Component } from "react";
import PropTypes from "prop-types";

import VoxeetSDK from "@voxeet/voxeet-web-sdk";

import "../styles/login.less";

class Login extends Component {

    constructor(props) {
        super(props);

        this.state = {
            conferenceName: "conf-" + Math.round(Math.random() * 10000),
            userName: "Guest " + Math.round(Math.random() * 10000),
            file: null
        };

        this.handleChangeConferenceName = this.handleChangeConferenceName.bind(this);
        this.handleChangeUserName = this.handleChangeUserName.bind(this);
        this.handleChangePresentationFile = this.handleChangePresentationFile.bind(this);
        this.joinPresentation = this.joinPresentation.bind(this);
        this.startPresentation = this.startPresentation.bind(this);
    }

    componentDidMount() {
        VoxeetSDK.filePresentation.on("conversionProgress", this.onFilePresentationConversionProgress);
        VoxeetSDK.filePresentation.on("converted", this.onFilePresentationConverted);
    }

    componentWillUnmount() {
        VoxeetSDK.filePresentation.removeListener("conversionProgress", this.onFilePresentationConversionProgress);
        VoxeetSDK.filePresentation.removeListener("converted", this.onFilePresentationConverted);
    }

    onFilePresentationConversionProgress(file) {
        console.log(file);
    }

    onFilePresentationConverted(fileConverted) {
        console.log("fileConverted", fileConverted);
        this.props.handleOnSessionOpened(this.state.conferenceName, this.state.userName, fileConverted);
    }

    handleChangeConferenceName(e) {
        this.setState({ conferenceName: e.target.value });
    }

    handleChangeUserName(e) {
        this.setState({ userName: e.target.value });
    }

    handleChangePresentationFile(e) {
        const file = e.target.files[0];
        console.log(file);

        this.setState({ file: file });
    }

    joinPresentation() {
        VoxeetSDK
            .session
            .open({
                name: this.state.userName,
                externalId: this.state.userName,
                avatarUrl: "https://gravatar.com/avatar/" + Math.floor(Math.random() * 1000000) + "?s=200&d=identicon",
            })
            .then(() => {
                this.props.handleOnSessionOpened(this.state.conferenceName, this.state.userName);
            });
    }

    startPresentation() {
        VoxeetSDK
            .session
            .open({
                name: this.state.userName,
                externalId: this.state.userName,
                avatarUrl: "https://gravatar.com/avatar/" + Math.floor(Math.random() * 1000000) + "?s=200&d=identicon",
            })
            .then(() => {
                VoxeetSDK
                    .filePresentation
                    .convert(this.state.file)
                    .then((result) => {
                        if (result.status == 200) {
                            console.log('Upload the file success.');
                        } else {
                            console.log('There was an error while uploading the file.');
                        }
                    });
            });
    }

    render() {
        return (
            <div className="container">
                <div id="component-login" className="row justify-content-center">
                    <div className="col-md-7 col-lg-5">
                        <div className="card card-lg mb-5">
                            <div className="card-body">
                                <div className="text-center">
                                    <h1>Conference</h1>
                                </div>
                                <form>
                                    <div className="form-group">
                                        <label htmlFor="input-conference-name">Conference name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="input-conference-name"
                                            value={this.state.conferenceName}
                                            onChange={this.handleChangeConferenceName} />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="input-user-name">Your name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="input-user-name"
                                            value={this.state.userName}
                                            onChange={this.handleChangeUserName} />
                                    </div>
                                    
                                    <button type="button" className="btn btn-lg btn-block btn-primary" onClick={this.joinPresentation}>Join Presentation</button>

                                    <div className="form-group custom-file">
                                        <input type="file" className="custom-file-input" id="input-file" onChange={this.handleChangePresentationFile} />
                                        <label className="custom-file-label" htmlFor="input-file">Choose PowerPoint file</label>
                                    </div>
                                    
                                    <button type="button" className="btn btn-lg btn-block btn-primary" onClick={this.startPresentation}>Start Presentation</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Login.propTypes = {
    handleOnSessionOpened: PropTypes.func
};

Login.defaultProps = {
    handleOnSessionOpened: null
};

export default Login;
