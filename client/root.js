import React, { Component } from "react";

import VoxeetSDK from "@voxeet/voxeet-web-sdk";

import Loading from "./components/loading";
import Login from "./components/login";
import Conference from "./components/conference";

export default class Root extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            isLoggedIn: false,
            isHost: false,
            fileConverted: null,
            conferenceName: null
        };

        this.onSessionOpened = this.onSessionOpened.bind(this);
    }

    componentDidMount() {
        this.getAccessToken()
            .then(accessToken => VoxeetSDK.initializeToken(accessToken, this.getAccessToken) )
            .then(() => {
                console.log('SDK Initialized')
                this.setState({isLoading: false});
            });

        // Remove the bottom left link from Google Chrome
        // From: https://stackoverflow.com/a/28206011
        $("body").on('mouseover', 'a', function (e) {
            var $link = $(this),
                href = $link.attr('href') || $link.data("href");
        
            $link.off('click.chrome');
            $link.on('click.chrome', () => window.location.href = href)
                .attr('data-href', href)
                .css({ cursor: 'pointer' })
                .removeAttr('href');
        });
    }

    async getAccessToken() {
        const url = '/access-token';
        const response = await fetch(url);
        const jwt = await response.json();

        return jwt.access_token;
    }

    onSessionOpened(conferenceName, userName, fileConverted) {
        console.log("Conf Name", conferenceName);
        console.log("User Name", userName);
        if (fileConverted) {
            console.log("File", fileConverted);
            this.setState({
                conferenceName: conferenceName,
                isLoggedIn: true,
                isHost: true,
                fileConverted: fileConverted
            });
        } else {
            this.setState({
                conferenceName: conferenceName,
                isLoggedIn: true,
                isHost: false
            });
        }
    }

    render() {
        return (
            this.state.isLoading
                ? <Loading />
                : !this.state.isLoggedIn
                    ? <Login
                        handleOnSessionOpened={(conferenceName, userName, fileConverted) => this.onSessionOpened(conferenceName, userName, fileConverted)} />
                    : <Conference
                        conferenceName={this.state.conferenceName}
                        isHost={this.state.isHost}
                        fileConverted={this.state.fileConverted} />
        );
    }
}
