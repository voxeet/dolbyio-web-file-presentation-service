import VoxeetSDK from "@voxeet/voxeet-web-sdk";

import Backend from "./backend";


export default class Sdk {
    
    /**
     * Initializes the Voxeet SDK.
     * @return {Promise<void>} A Promise for the completion of the function.
     */
    static initializeSDK() {
        return Backend.getAccessToken()
            .then((accessToken) => {
                VoxeetSDK.initializeToken(accessToken, Backend.getAccessToken);
                console.log("VoxeetSDK Initialized");
            });
    }

    /**
     * Opens a session.
     * @return {Promise<void>} A Promise for the completion of the function.
     */
    static async openSession(name, externalId) {
        const participant = {
            name: name,
            externalId: externalId,
            avatarUrl: "https://gravatar.com/avatar/" + Math.floor(Math.random() * 1000000) + "?s=200&d=identicon",
        };

        // Close the session if it is already opened
        if (VoxeetSDK.session.participant != undefined) {
            await VoxeetSDK.session.close();
        }

        await VoxeetSDK.session.open(participant);
    }

    /**
     * Close the current session.
     * @return {Promise<void>} A Promise for the completion of the function.
     */
    static closeSession() {
        return VoxeetSDK.session.close();
    }

    /**
     * Requests the conversion of the presentation file.
     * @param {*} file Presentation file to convert.
     */
    static async convertFile(file) {
        const result = await VoxeetSDK.filePresentation.convert(file)
        if (result.status != 200) {
            throw Error("There was an error while uploading the file.");
        }
    }

    /**
     * Joins the specified conference.
     * @param {string} conferenceId Conference ID.
     * @param {string} conferenceAccessToken Conference Access Token provided by the backend.
     * @return {Promise<void>} A Promise for the completion of the function.
     */
    static joinConference(conferenceId, conferenceAccessToken) {
        // Get the conference object
        return VoxeetSDK.conference.fetch(conferenceId)
            .then((conference) => {
                // See: https://dolby.io/developers/interactivity-apis/client-sdk/reference-javascript/model/joinoptions
                const joinOptions = {
                    conferenceAccessToken: conferenceAccessToken,
                    constraints: {
                        audio: true,
                        video: true
                    },
                    maxVideoForwarding: 4
                };

                // Join the conference
                return VoxeetSDK.conference.join(conference, joinOptions);
            });
    }

    /**
     * Joins the specified conference as a listener.
     * @param {string} conferenceId Conference ID.
     * @param {string} conferenceAccessToken Conference Access Token provided by the backend.
     * @return {Promise<void>} A Promise for the completion of the function.
     */
    static listenToConference(conferenceId, conferenceAccessToken) {
        // Get the conference object
        return VoxeetSDK.conference.fetch(conferenceId)
            .then((conference) => {
                // See: https://dolby.io/developers/interactivity-apis/reference/client-sdk/reference-javascript/model/listenoptions
                const joinOptions = {
                    conferenceAccessToken: conferenceAccessToken,
                    constraints: {
                        audio: false,
                        video: false
                    },
                    maxVideoForwarding: 4
                };

                // Join the conference
                return VoxeetSDK.conference.listen(conference, joinOptions);
            });
    }

    /**
     * Starts sharing the video to the conference participants.
     * @return {Promise<void>} A Promise for the completion of the function.
     */
    static startVideo() {
        return VoxeetSDK
            .conference
            .startVideo(VoxeetSDK.session.participant);
    }
    
    /**
     * Stops sharing the video to the conference participants.
     * @return {Promise<void>} A Promise for the completion of the function.
     */
    static stopVideo() {
        return VoxeetSDK
            .conference
            .stopVideo(VoxeetSDK.session.participant);
    }

    /**
     * Mutes the local participant.
     */
    static mute() {
        VoxeetSDK.conference.mute(VoxeetSDK.session.participant, true);
    }

    /**
     * Unmutes the local participant.
     */
    static unmute() {
        VoxeetSDK.conference.mute(VoxeetSDK.session.participant, false);
    }

    /**
     * Leaves the conference.
     */
    static leaveConference() {
        VoxeetSDK
            .conference
            .leave()
            .catch(e => console.log(e));
    }

    /**
     * Starts recording the conference.
     * @return {Promise<void>} A Promise for the completion of the function.
     */
    static startRecording() {
        console.log("Starting the recording...");

        return VoxeetSDK.recording.start()
            .then(() => {
                const msg = JSON.stringify({
                    action: "RecordingState",
                    value: true
                });
        
                VoxeetSDK
                    .command
                    .send(msg)
                    .catch(e => console.log(e));
        
                const event = new Event("recordingStarted");
                document.dispatchEvent(event);
            });
    }

    /**
     * Stops recording the conference.
     * @return {Promise<void>} A Promise for the completion of the function.
     */
    static stopRecording() {
        console.log("Stopping the recording...");

        return VoxeetSDK.recording.stop()
            .then(() => {
                const msg = JSON.stringify({
                    action: "RecordingState",
                    value: false
                });
        
                VoxeetSDK
                    .command
                    .send(msg)
                    .catch(e => console.log(e));
        
                const event = new Event("recordingStopped");
                document.dispatchEvent(event);
            });
    }

    /**
     * Starts a presentation.
     * @param {*} fileConverted File converted.
     * @return {Promise<void>} A Promise for the completion of the function.
     */
    static startPresentation(fileConverted) {
        return VoxeetSDK
            .filePresentation
            .start(fileConverted);
    }

    /**
     * Change the position of the slide in the presentation.
     * @param {number} position New position of the presentation.
     */
    static changeSlidePosition(position) {
        console.log(`Change the slide position to ${position}.`);

        VoxeetSDK
            .filePresentation
            .update(position)
            .catch((e) => console.log(e));
    }

    /**
     * Gets the URL of the image for a slide.
     * @param {number} position Position of the slide to request the image.
     * @return {Promise<string>} URL of the image for the requested slide.
     */
    static getSlideImageUrl(position) {
        return VoxeetSDK
            .filePresentation
            .image(position);
    }

    /**
     * Gets the URL of the thumbnail for a slide.
     * @param {number} position Position of the slide to request the thumbnail.
     * @return {Promise<string>} URL of the thumbnail for the requested slide.
     */
    static getSlideThumbnailUrl(position) {
        return VoxeetSDK
            .filePresentation
            .thumbnail(position);
    }

}