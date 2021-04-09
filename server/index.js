var express = require('express');
const https = require("https");

var app = express();

// Parse POST requests as JSON payload
app.use(express.json());

// Serve static files
app.use(express.static('dist'))

// Enter your Consumer Key and Secret from the dolby.io dashboard
const CONSUMER_KEY = 'CONSUMER_KEY';
const CONSUMER_SECRET = 'CONSUMER_SECRET';

// Other settings
const LIVE_RECORDING = false;


/**
 * Sends a POST request
 * @param {string} hostname
 * @param {string} path 
 * @param {*} headers 
 * @param {string} body 
 * @returns A JSON payload object through a Promise.
 */
const postAsync = (hostname, path, headers, body) => {
    return new Promise(function(resolve, reject) {
        const options = {
            hostname: hostname,
            port: 443,
            path: path,
            method: 'POST',
            headers: headers
        };
        
        const req = https.request(options, res => {
            console.log(`[POST] ${res.statusCode} - https://${hostname}${path}`);

            let data = '';
            res.on('data', chunk => {
                data = data + chunk.toString();
            });

            res.on('end', () => {
                const json = JSON.parse(data);
                resolve(json);
            });
        });
        
        req.on('error', error => {
            console.error('error', error);
            reject(error);
        });
        
        req.write(body);
        req.end();
    });
};

/**
 * Sends a GET request
 * @param {string} hostname
 * @param {string} path 
 * @param {*} headers 
 * @returns A JSON payload object through a Promise.
 */
 const getAsync = (hostname, path, headers) => {
    return new Promise(function(resolve, reject) {
        const options = {
            hostname: hostname,
            port: 443,
            path: path,
            method: 'GET',
            headers: headers
        };
        
        const req = https.request(options, res => {
            console.log(`[GET] ${res.statusCode} - https://${hostname}${path}`);

            let data = '';
            res.on('data', (chunk) => {
                data = data + chunk.toString();
            });

            res.on('end', () => {
                const json = JSON.parse(data);
                resolve(json);
            })
        });
        
        req.on('error', error => {
            console.error('error', error);
            reject(error);
        });
        
        req.end();
    });
};

/**
 * Gets a JWT token for authorization.
 * @param {string} hostname 
 * @param {string} path 
 * @returns a JWT token.
 */
const getAccessTokenAsync = (hostname, path) => {
    const body = "grant_type=client_credentials";

    const authz = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
        'Authorization': 'Basic ' + authz,
        'Content-Length': body.length
    };

    return postAsync(hostname, path, headers, body);
};

// See: https://dolby.io/developers/interactivity-apis/reference/rest-apis/authentication#operation/postOAuthToken
const getClientAccessTokenAsync = () => {
    console.log('Get Client Access Token');
    return getAccessTokenAsync('session.voxeet.com', '/v1/oauth2/token');
};

// See: https://dolby.io/developers/interactivity-apis/reference/rest-apis/authentication#operation/JWT
const getAPIAccessTokenAsync = () => {
    console.log('Get API Access Token');
    return getAccessTokenAsync('api.voxeet.com', '/v1/auth/token');
};

// See: https://dolby.io/developers/interactivity-apis/reference/rest-apis/conference#operation/postConferenceCreate
const createConferenceAsync = async (alias, ownerExternalId) => {
    const body = JSON.stringify({
        alias: alias,
        parameters: {
            dolbyVoice: true,
            liveRecording: LIVE_RECORDING
        },
        ownerExternalId: ownerExternalId
    });
    
    const jwt = await getAPIAccessTokenAsync();

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt.access_token,
        'Content-Length': body.length
    };

    return await postAsync('api.voxeet.com', '/v2/conferences/create', headers, body);
};

// See: https://dolby.io/developers/interactivity-apis/reference/rest-apis/conference#operation/postConferenceInvite
const getInvitationAsync = async (conferenceId, externalId, isListener) => {
    // "INVITE", "JOIN", "SEND_AUDIO", "SEND_VIDEO", "SHARE_SCREEN",
    // "SHARE_VIDEO", "SHARE_FILE", "SEND_MESSAGE", "RECORD", "STREAM",
    // "KICK", "UPDATE_PERMISSIONS"

    const participants = {};
    if (isListener) {
        participants[externalId] = {
            permissions: [
                "JOIN",
                "SEND_MESSAGE"
            ]
        };
    } else {
        participants[externalId] = {
            permissions: [
                "JOIN",
                "SEND_AUDIO",
                "SEND_VIDEO",
                "SEND_MESSAGE"
            ]
        };
    }

    const body = JSON.stringify({
        participants: participants
    });
    
    const jwt = await getAPIAccessTokenAsync();

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt.access_token,
        'Content-Length': body.length
    };

    return await postAsync('api.voxeet.com', `/v2/conferences/${conferenceId}/invite`, headers, body);
};

const getConferenceIdAsync = async function (alias) {
    const jwt = await getAPIAccessTokenAsync();

    const headers = {
        'Authorization': 'Bearer ' + jwt.access_token
    };

    const jsonResponse = await getAsync('api.voxeet.com', '/v1/monitor/conferences?active=true&max=1000', headers);

    const conferences = jsonResponse.conferences;
    for (let index = 0; index < conferences.length; index++) {
        const conference = conferences[index];
        if (conference.alias.toLowerCase() == alias.toLowerCase()) {
            return conference.confId;
        }
    }
};


app.get('/access-token', function (request, response) {
    console.log(`[GET] ${request.url}`);

    getClientAccessTokenAsync()
        .then(accessToken => {
            response.set('Content-Type', 'application/json');
            response.send(JSON.stringify(accessToken));
        })
        .catch(() => {
            response.status(500);
        });
});

app.post('/conference', function (request, response) {
    console.log(`[POST] ${request.url}`, request.body);

    const alias = request.body.alias;
    const ownerExternalId = request.body.ownerExternalId;

    createConferenceAsync(alias, ownerExternalId)
        .then(conference => {
            response.set('Content-Type', 'application/json');
            response.send(JSON.stringify(conference));
        })
        .catch(() => {
            response.status(500);
        });
});

app.post('/get-invited', async function (request, response) {
    console.log(`[POST] ${request.url}`, request.body);

    const alias = request.body.alias;
    const externalId = request.body.externalId;
    const isListener = request.body.isListener;

    try {
        const conferenceId = await getConferenceIdAsync(alias);
        if (!conferenceId) {
            response.status(404);
            return;
        }

        const accessToken = await getInvitationAsync(conferenceId, externalId, isListener);
        
        response.set('Content-Type', 'application/json');
        response.send(JSON.stringify({
            conferenceId: conferenceId,
            accessToken: accessToken[externalId]
        }));

    } catch (error) {
        console.log(error);
        response.status(500);
    }
});


// Starts an HTTP server on port 8081
var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Dolby.io app listening at http://%s:%s", host, port)
});
