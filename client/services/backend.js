/**
 * Requests a session access token from the backend.
 * @return {Promise<string>} The session access token provided by the backend.
 */
const getAccessToken = async () => {
    const url = 'access-token';
    const response = await fetch(url);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
    }

    const jwt = await response.json();
    return jwt.access_token;
};

/**
 * Requests an invitation to access the conference.
 * @param {string} conferenceAlias Conference alias.
 * @param {boolean} isListener Flag indicating if the user is a listener or a participant.
 * @param {string} externalId External ID of the user.
 * @return {Promise<any>} The invitation object.
 */
const getInvited = async (conferenceAlias, isListener, externalId) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({
            alias: conferenceAlias,
            externalId: externalId,
            isListener: isListener,
        }),
    };

    // Request the backend for an invitation
    const response = await fetch('get-invited', options);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
    }

    return response.json();
};

/**
 * Requests the backend to create a conference.
 * @param {string} conferenceAlias Conference alias.
 * @param {string} externalId External ID of the user.
 * @return {Promise<any>} The conference object.
 */
const createConference = async (conferenceAlias, externalId) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({
            alias: conferenceAlias,
            ownerExternalId: externalId,
        }),
    };

    // Request the backend to create a conference
    const response = await fetch('conference', options);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
    }

    return response.json();
};

export default { getAccessToken, getInvited, createConference };
