import React, { Component } from 'react';
import PropTypes from 'prop-types';

import VoxeetSDK from '@voxeet/voxeet-web-sdk';

import Sdk from '../services/sdk';
import Loading from './loading';
import Presentation from './presentation';
import Slides from './slides';
import Actions from './actions';
import Attendees from './attendees';

import '../styles/conference.less';

class Conference extends Component {
    constructor(props) {
        super(props);

        this.state = {
            filePresentationStarted: false,
            isPresentationOwner: false,
            isLoading: this.props.isHost, // Will start the presentation
            loadingMessage: 'Loading...',
        };

        this.onFilePresentationStarted = this.onFilePresentationStarted.bind(this);
    }

    async componentDidMount() {
        VoxeetSDK.filePresentation.on('started', this.onFilePresentationStarted);

        if (this.props.isHost) {
            this.setState({
                isLoading: true,
                loadingMessage: 'Starting the presentation',
            });

            try {
                await Sdk.startPresentation(this.props.fileConverted);
                this.setState({ isLoading: false });
            } catch (error) {
                this.setState({ isLoading: false });
                console.error(error);
            }
        } else if (VoxeetSDK.filePresentation.current != null) {
            this.onFilePresentationStarted(VoxeetSDK.filePresentation.current);
        }
    }

    componentWillUnmount() {
        VoxeetSDK.filePresentation.removeListener('started', this.onFilePresentationStarted);
    }

    onFilePresentationStarted(filePresentation) {
        // Only the owner of the presentation can see all the slides
        const isPresentationOwner = filePresentation.owner.id === VoxeetSDK.session.participant.id;

        this.setState({
            filePresentationStarted: true,
            isPresentationOwner: isPresentationOwner,
        });
    }

    render() {
        if (this.state.isLoading) {
            return <Loading message={this.state.loadingMessage} />;
        }

        return (
            <main className="conference container-fluid d-flex h-100 flex-column">
                <Actions />
                <div className="row flex-grow-1">
                    <div className="main-panel col-10">
                        <div className="container-fluid d-flex h-100 flex-column">
                            {this.state.filePresentationStarted && (
                                <Presentation presentation={this.props.presentation} displayNotes={this.props.displayNotes} />
                            )}
                            {this.state.isPresentationOwner && <Slides />}
                        </div>
                    </div>
                    <div className="side-panel col-2">
                        <Attendees />
                    </div>
                </div>
            </main>
        );
    }
}

Conference.propTypes = {
    isHost: PropTypes.bool,
    fileConverted: PropTypes.object,
    presentation: PropTypes.object,
    displayNotes: PropTypes.bool,
};

Conference.defaultProps = {
    isHost: false,
    fileConverted: null,
    presentation: null,
    displayNotes: true,
};

export default Conference;
