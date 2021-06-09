import React, { Component } from 'react';
import PropTypes from 'prop-types';

import VoxeetSDK from '@voxeet/voxeet-web-sdk';

import Loading from './loading';
import PowerPoint from '../services/powerpoint';
import Sdk from '../services/sdk';

import '../styles/login.less';

class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            conferenceName: `conf-${Math.round(Math.random() * 10000)}`,
            username: `Guest ${Math.round(Math.random() * 10000)}`,
            isListener: false,
            file: null,
            canJoinConference: true,
            canStartPresentation: false,
            isLoading: false,
            loadingMessage: '',
        };

        this.onFilePresentationConversionProgress = this.onFilePresentationConversionProgress.bind(this);
        this.onFilePresentationConverted = this.onFilePresentationConverted.bind(this);

        this.handleChangeConferenceName = this.handleChangeConferenceName.bind(this);
        this.handleChangeUserName = this.handleChangeUserName.bind(this);
        this.handleChangeAsListener = this.handleChangeAsListener.bind(this);
        this.handleChangePresentationFile = this.handleChangePresentationFile.bind(this);

        this.joinPresentation = this.joinPresentation.bind(this);
        this.startPresentation = this.startPresentation.bind(this);
    }

    componentDidMount() {
        VoxeetSDK.filePresentation.on('conversionProgress', this.onFilePresentationConversionProgress);
        VoxeetSDK.filePresentation.on('converted', this.onFilePresentationConverted);
    }

    componentWillUnmount() {
        VoxeetSDK.filePresentation.removeListener('conversionProgress', this.onFilePresentationConversionProgress);
        VoxeetSDK.filePresentation.removeListener('converted', this.onFilePresentationConverted);
    }

    onFilePresentationConversionProgress(fileConversionProgress) {
        this.setState({
            isLoading: true,
            loadingMessage: `Converting the presentation - ${fileConversionProgress.progress.toFixed(0)}%`,
        });

        //console.log(fileConversionProgress);
    }

    async onFilePresentationConverted(fileConverted) {
        console.log('fileConverted', fileConverted);

        try {
            const presentation = await PowerPoint.getPresentation(this.state.file);
            this.props.handleOnSessionOpened(this.state.conferenceName, this.state.username, this.state.isListener, fileConverted, presentation);
        } catch (error) {
            console.error(error);
        }
    }

    handleChangeConferenceName(e) {
        const canJoinConference = e.target.value.length > 0 && this.state.username.length > 0;

        this.setState({
            conferenceName: e.target.value,
            canJoinConference: canJoinConference,
            canStartPresentation: canJoinConference && this.state.file != null,
        });
    }

    handleChangeUserName(e) {
        const canJoinConference = e.target.value.length > 0 && this.state.conferenceName.length > 0;

        this.setState({
            username: e.target.value,
            canJoinConference: canJoinConference,
            canStartPresentation: canJoinConference && this.state.file != null,
        });
    }

    handleChangePresentationFile(e) {
        const file = e.target.files[0];
        console.log('Selected PowerPoint file', file);

        const canJoinConference = e.target.value.length > 0 && this.state.conferenceName.length > 0;

        this.setState({
            file: file,
            canStartPresentation: canJoinConference && file != null,
        });
    }

    handleChangeAsListener(e) {
        this.setState({
            isListener: e.target.checked,
        });
    }

    async joinPresentation() {
        this.setState({
            isLoading: true,
            loadingMessage: 'Opening a session',
        });

        try {
            await Sdk.openSession(this.state.username, this.state.username);
            this.props.handleOnSessionOpened(this.state.conferenceName, this.state.username, this.state.isListener);
        } catch (error) {
            this.setState({ isLoading: false });
            console.error(error);
        }
    }

    async startPresentation() {
        this.setState({
            isLoading: true,
            loadingMessage: 'Opening a session',
        });

        try {
            await Sdk.openSession(this.state.username, this.state.username);

            this.setState({
                isLoading: true,
                loadingMessage: 'Uploading the presentation',
            });

            await Sdk.convertFile(this.state.file);

            this.setState({
                isLoading: true,
                loadingMessage: 'Converting the presentation',
            });
        } catch (error) {
            this.setState({ isLoading: false });
            console.error(error);
        }
    }

    render() {
        if (this.state.isLoading) {
            return <Loading message={this.state.loadingMessage} />;
        }

        return (
            <div className="login container">
                <div className="row justify-content-center">
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
                                            onChange={this.handleChangeConferenceName}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="input-user-name">Your name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="input-user-name"
                                            value={this.state.username}
                                            onChange={this.handleChangeUserName}
                                        />
                                    </div>

                                    <div className="form-group form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="input-as-listener"
                                            checked={this.state.isListener}
                                            onChange={this.handleChangeAsListener}
                                        />
                                        <label className="form-check-label" htmlFor="input-as-listener">
                                            Join as listener
                                        </label>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-lg btn-block btn-primary"
                                        onClick={this.joinPresentation}
                                        disabled={!this.state.canJoinConference}
                                    >
                                        Join Presentation
                                    </button>

                                    <div className="form-group custom-file">
                                        <input type="file" className="custom-file-input" id="input-file" onChange={this.handleChangePresentationFile} />
                                        <label className="custom-file-label" htmlFor="input-file">
                                            Choose PowerPoint file
                                        </label>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-lg btn-block btn-primary"
                                        onClick={this.startPresentation}
                                        disabled={!this.state.canStartPresentation}
                                    >
                                        Start Presentation
                                    </button>
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
    handleOnSessionOpened: PropTypes.func,
};

Login.defaultProps = {
    handleOnSessionOpened: null,
};

export default Login;
