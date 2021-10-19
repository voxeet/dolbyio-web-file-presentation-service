import React, { Component } from 'react';

import VoxeetSDK from '@voxeet/voxeet-web-sdk';

import Sdk from '../services/sdk';

import '../styles/slides.less';

class Slides extends Component {
    constructor(props) {
        super(props);

        this.thumbnails = [];
        this.state = {
            thumbnails: this.thumbnails,
        };

        this.changeSlide = this.changeSlide.bind(this);
        this.changeHighlight = this.changeHighlight.bind(this);
    }

    async componentDidMount() {
        VoxeetSDK.filePresentation.on('updated', this.changeHighlight);
        VoxeetSDK.filePresentation.on('started', this.changeHighlight);

        for (let index = 0; index < VoxeetSDK.filePresentation.current.imageCount; index++) {
            try {
                const url = await Sdk.getSlideThumbnailUrl(index);
                const key = `thumbnail-${index}`;
                const cssClassName = VoxeetSDK.filePresentation.current.position === index ? 'list-group-item active' : 'list-group-item';

                this.thumbnails.push(
                    <a key={key} id={key} href="#" className={cssClassName} onClick={async (event) => await this.changeSlide(event, index)}>
                        <div className="active-bolder">
                            <img src={url} />
                        </div>
                    </a>
                );

                this.setState({
                    thumbnails: this.thumbnails,
                });
            } catch (error) {
                console.error(error);
            }
        }
    }

    componentWillUnmount() {
        VoxeetSDK.filePresentation.removeListener('updated', this.changeHighlight);
        VoxeetSDK.filePresentation.removeListener('started', this.changeHighlight);
    }

    async changeSlide(event, position) {
        event.preventDefault();
        event.stopPropagation();
        
        await Sdk.changeSlidePosition(position);
    }

    changeHighlight(filePresentation) {
        // Remove the active tag on all slides
        const elements = document.getElementsByClassName('list-group-item');
        for (let index = 0; index < elements.length; index++) {
            elements[index].classList.remove('active');
        }

        // Add the active class for the current slide
        const element = document.getElementById(`thumbnail-${filePresentation.position}`);
        element.classList.add('active');

        // smooth scroll of the thumbnail to the center of the list
        element.scrollIntoView({ behavior: 'smooth', inline: 'center' });

        // Log a message in the console
        const slideCount = VoxeetSDK.filePresentation.current?.imageCount ?? 0;
        console.log(`Changed position to slide ${filePresentation.position + 1} of ${slideCount}`);
    }

    render() {
        return (
            <div className="thumbnails row">
                <div className="col list-group list-group-horizontal">{this.thumbnails}</div>
            </div>
        );
    }
}

export default Slides;
