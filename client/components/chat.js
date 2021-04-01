import React, { Component } from "react";

import VoxeetSDK from "@voxeet/voxeet-web-sdk";

import "../styles/chat.less";

export default class Chat extends Component {

    constructor(props) {
        super(props);

        this.messages = [];
        this.state = {
            message: '',
            messages: this.messages
        };

        this.handleChangeMessage = this.handleChangeMessage.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.onMessage = this.onMessage.bind(this);
    }

    componentDidMount() {
        VoxeetSDK.command.on("received", this.onMessage);
    }

    componentWillUnmount() {
        VoxeetSDK.command.removeListener("received", this.onMessage);
    }

    handleChangeMessage(e) {
        this.setState({ message: e.target.value });
    }

    sendMessage() {
        const msg = JSON.stringify({
            action: 'ChatMessage',
            value: this.state.message
        });

        VoxeetSDK
            .command
            .send(msg)
            .then(() => {
                this.onMessage(VoxeetSDK.session.participant, msg);

                this.setState({
                    message: ''
                });
            })
            .catch(e => console.log(e));
    }

    onMessage(participant, message) {
        const data = JSON.parse(message);
        if (data.action != "ChatMessage") return;

        const key = `msg-${Math.floor(Math.random() * 1000000)}`;

        if (participant.id == VoxeetSDK.session.participant.id) {
            this.messages.push(
                <li key={key} className="media text-right">
                    <div className="media-body">
                        <h6 className="mt-0">{participant.info.name}</h6>
                        <p>{data.value}</p>
                    </div>
                
                    <img src={participant.info.avatarUrl}
                        className="ml-3"
                        alt={participant.info.name} />
                </li>
            );
        } else {
            this.messages.push(
                <li key={key} className="media">
                    <img src={participant.info.avatarUrl}
                        className="mr-3"
                        alt={participant.info.name} />
    
                    <div className="media-body">
                        <h6 className="mt-0">{participant.info.name}</h6>
                        <p>{data.value}</p>
                    </div>
                </li>
            );
        }

        this.setState({
            messages : this.messages
        });

        // smooth scroll to the end of the list
        const element = document.getElementById('chat-messages');
        element.scrollIntoView({ behavior: 'smooth', inline: 'end' });
    }

    render() {
        return (
            <div className="chat row flex-grow-1 overflow-hidden">
                <div className="col d-flex flex-column">
                    <div className="h-100">
                        <div className="container-fluid d-flex flex-column">
                            <div className="row flex-fill">
                                <div className="col d-flex flex-column">
                                    <ul id="chat-messages" className="messages overflow-auto">
                                        {this.state.messages}
                                    </ul>
                                </div>
                            </div>

                            <div className="row send-message">
                                <div className="col">
                                    <div className="input-group mb-3">
                                        <input type="text"
                                            className="form-control"
                                            placeholder="Send a message"
                                            value={this.state.message}
                                            onChange={this.handleChangeMessage}  />
                                        <div className="input-group-prepend">
                                            <button className="btn btn-outline-secondary" type="button" onClick={this.sendMessage}>
                                                <i className="fas fa-arrow-circle-right"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
