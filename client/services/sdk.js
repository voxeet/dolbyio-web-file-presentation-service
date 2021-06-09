import VoxeetSDK from '@voxeet/voxeet-web-sdk';

import Backend from './backend';

/**
 * Initializes the Voxeet SDK.
 * @return {Promise<void>} A Promise for the completion of the function.
 */
const initializeSDK = async () => {
    const accessToken = await Backend.getAccessToken();

    VoxeetSDK.initializeToken(accessToken, Backend.getAccessToken);
    console.log('VoxeetSDK Initialized');
};

/**
 * Opens a session.
 * @return {Promise<void>} A Promise for the completion of the function.
 */
const openSession = async (name, externalId) => {
    const participant = {
        name: name,
        externalId: externalId,
        avatarUrl: `https://gravatar.com/avatar/${Math.floor(Math.random() * 1000000)}?s=200&d=identicon`,
    };

    // Close the session if it is already opened
    if (VoxeetSDK.session.participant) {
        await VoxeetSDK.session.close();
    }

    await VoxeetSDK.session.open(participant);
};

/**
 * Close the current session.
 * @return {Promise<void>} A Promise for the completion of the function.
 */
const closeSession = async () => {
    await VoxeetSDK.session.close();
};

/**
 * Requests the conversion of the presentation file.
 * @param {*} file Presentation file to convert.
 */
const convertFile = async (file) => {
    const result = await VoxeetSDK.filePresentation.convert(file);
    if (result.status != 200) {
        throw Error('There was an error while uploading the file.');
    }
};

/**
 * Joins the specified conference.
 * @param {string} conferenceId Conference ID.
 * @param {string} conferenceAccessToken Conference Access Token provided by the backend.
 * @return {Promise<void>} A Promise for the completion of the function.
 */
const joinConference = async (conferenceId, conferenceAccessToken) => {
    // Get the conference object
    const conference = await VoxeetSDK.conference.fetch(conferenceId);

    // See: https://dolby.io/developers/interactivity-apis/client-sdk/reference-javascript/model/joinoptions
    const joinOptions = {
        conferenceAccessToken: conferenceAccessToken,
        constraints: {
            audio: true,
            video: true,
        },
        maxVideoForwarding: 4,
    };

    // Join the conference
    await VoxeetSDK.conference.join(conference, joinOptions);
};

/**
 * Joins the specified conference as a listener.
 * @param {string} conferenceId Conference ID.
 * @param {string} conferenceAccessToken Conference Access Token provided by the backend.
 * @return {Promise<void>} A Promise for the completion of the function.
 */
const listenToConference = async (conferenceId, conferenceAccessToken) => {
    // Get the conference object
    const conference = await VoxeetSDK.conference.fetch(conferenceId);

    // See: https://dolby.io/developers/interactivity-apis/reference/client-sdk/reference-javascript/model/listenoptions
    const joinOptions = {
        conferenceAccessToken: conferenceAccessToken,
        constraints: {
            audio: false,
            video: false,
        },
        maxVideoForwarding: 4,
    };

    // Join the conference
    await VoxeetSDK.conference.listen(conference, joinOptions);
};

/**
 * Starts sharing the video to the conference participants.
 * @return {Promise<void>} A Promise for the completion of the function.
 */
const startVideo = async () => {
    await VoxeetSDK.conference.startVideo(VoxeetSDK.session.participant);
};

/**
 * Stops sharing the video to the conference participants.
 * @return {Promise<void>} A Promise for the completion of the function.
 */
const stopVideo = async () => {
    await VoxeetSDK.conference.stopVideo(VoxeetSDK.session.participant);
};

/**
 * Mutes the local participant.
 */
const mute = () => {
    VoxeetSDK.conference.mute(VoxeetSDK.session.participant, true);
};

/**
 * Unmutes the local participant.
 */
const unmute = () => {
    VoxeetSDK.conference.mute(VoxeetSDK.session.participant, false);
};

/**
 * Leaves the conference.
 */
const leaveConference = async () => {
    try {
        await VoxeetSDK.conference.leave();
    } catch (error) {
        console.error(error);
    }
};

/**
 * Starts recording the conference.
 * @return {Promise<void>} A Promise for the completion of the function.
 */
const startRecording = async () => {
    console.log('Starting the recording...');

    await VoxeetSDK.recording.start();

    const msg = JSON.stringify({
        action: 'RecordingState',
        value: true,
    });

    try {
        await VoxeetSDK.command.send(msg);
    } catch (error) {
        console.error(error);
    }

    const event = new Event('recordingStarted');
    document.dispatchEvent(event);
};

/**
 * Stops recording the conference.
 * @return {Promise<void>} A Promise for the completion of the function.
 */
const stopRecording = async () => {
    console.log('Stopping the recording...');

    await VoxeetSDK.recording.stop();

    const msg = JSON.stringify({
        action: 'RecordingState',
        value: false,
    });

    try {
        await VoxeetSDK.command.send(msg);
    } catch (error) {
        console.error(error);
    }

    const event = new Event('recordingStopped');
    document.dispatchEvent(event);
};

/**
 * Starts a presentation.
 * @param {*} fileConverted File converted.
 * @return {Promise<void>} A Promise for the completion of the function.
 */
const startPresentation = async (fileConverted) => {
    await VoxeetSDK.filePresentation.start(fileConverted);
};

/**
 * Change the position of the slide in the presentation.
 * @param {number} position New position of the presentation.
 */
const changeSlidePosition = async (position) => {
    console.log(`Change the slide position to ${position}.`);

    try {
        await VoxeetSDK.filePresentation.update(position);
    } catch (error) {
        console.error(error);
    }
};

/**
 * Gets the URL of the image for a slide.
 * @param {number} position Position of the slide to request the image.
 * @return {Promise<string>} URL of the image for the requested slide.
 */
const getSlideImageUrl = async (position) => {
    return await VoxeetSDK.filePresentation.image(position);
};

/**
 * Gets the URL of the thumbnail for a slide.
 * @param {number} position Position of the slide to request the thumbnail.
 * @return {Promise<string>} URL of the thumbnail for the requested slide.
 */
const getSlideThumbnailUrl = async (position) => {
    return await VoxeetSDK.filePresentation.thumbnail(position);
};

export default {
    initializeSDK,
    openSession,
    closeSession,
    convertFile,
    joinConference,
    listenToConference,
    startVideo,
    stopVideo,
    mute,
    unmute,
    leaveConference,
    startRecording,
    stopRecording,
    startPresentation,
    changeSlidePosition,
    getSlideImageUrl,
    getSlideThumbnailUrl,
};
