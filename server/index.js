var express = require('express');
const dotenv = require('dotenv');

// See: https://www.npmjs.com/package/@dolbyio/dolbyio-rest-apis-client
const dolbyio = require('@dolbyio/dolbyio-rest-apis-client');

const { Command } = require('commander');
const program = new Command();

dotenv.config();

var app = express();

// Parse POST requests as JSON payload
app.use(express.json());

// Serve static files
app.use(express.static('dist'));

const CONSUMER_KEY = process.env.CONSUMER_KEY ?? '';
const CONSUMER_SECRET = process.env.CONSUMER_SECRET ?? '';
const LIVE_RECORDING = process.env.LIVE_RECORDING === 'true';

if (CONSUMER_KEY.length <= 0 || CONSUMER_SECRET.length <= 0) {
    throw new Error('The Consumer Key and/or Secret are missing!');
}

const getClientAccessToken = async () => {
    console.log('Get Client Access Token');
    return await dolbyio.communications.authentication.getClientAccessToken(CONSUMER_KEY, CONSUMER_SECRET, 600);
};

const getAPIAccessToken = async () => {
    console.log('Get API Access Token');
    return await dolbyio.communications.authentication.getApiAccessToken(CONSUMER_KEY, CONSUMER_SECRET, 600);
};

// See: https://dolby.io/developers/interactivity-apis/reference/rest-apis/conference#operation/postConferenceCreate
const createConference = async (alias, ownerExternalId) => {
    const jwt = await getAPIAccessToken();

    return await dolbyio.communications.conference.createConference(jwt, {
        ownerExternalId: ownerExternalId,
        alias: alias,
        dolbyVoice: true,
        liveRecording: LIVE_RECORDING,
    });
};

// See: https://dolby.io/developers/interactivity-apis/reference/rest-apis/conference#operation/postConferenceInvite
const getInvitation = async (conferenceId, externalId, isListener) => {
    // "INVITE", "JOIN", "SEND_AUDIO", "SEND_VIDEO", "SHARE_SCREEN",
    // "SHARE_VIDEO", "SHARE_FILE", "SEND_MESSAGE", "RECORD", "STREAM",
    // "KICK", "UPDATE_PERMISSIONS"

    const participants = [
        {
            externalId: externalId,
            permissions: isListener ? ['JOIN'] : ['JOIN', 'SEND_AUDIO', 'SEND_VIDEO', 'SEND_MESSAGE']
        }
    ];

    const jwt = await getAPIAccessToken();

    return await dolbyio.communications.conference.invite(jwt, conferenceId, participants);
};

const getConferenceId = async function (alias) {
    const jwt = await getAPIAccessToken();

    const conferences = await dolbyio.communications.monitor.conferences.listAllConferences(jwt, { active: true });

    for (let index = 0; index < conferences.length; index++) {
        const conference = conferences[index];
        if (conference.alias.toLowerCase() === alias.toLowerCase()) {
            return conference.confId;
        }
    }
};

app.get('/access-token', function (request, response) {
    console.log(`[GET] ${request.url}`);

    getClientAccessToken()
        .then((accessToken) => {
            response.set('Content-Type', 'application/json');
            response.send(JSON.stringify(accessToken));
        })
        .catch(() => {
            response.status(500);
            response.send('An error happened.');
        });
});

app.post('/conference', function (request, response) {
    console.log(`[POST] ${request.url}`, request.body);

    const alias = request.body.alias;
    const ownerExternalId = request.body.ownerExternalId;

    createConference(alias, ownerExternalId)
        .then((conference) => {
            response.set('Content-Type', 'application/json');
            response.send(JSON.stringify(conference));
        })
        .catch(() => {
            response.status(500);
            response.send('An error happened.');
        });
});

app.post('/get-invited', async function (request, response) {
    console.log(`[POST] ${request.url}`, request.body);

    const alias = request.body.alias;
    const externalId = request.body.externalId;
    const isListener = request.body.isListener;

    try {
        const conferenceId = await getConferenceId(alias);
        if (!conferenceId) {
            response.status(404);
            response.send(`The conference ${alias} cannot be found.`);
            return;
        }

        const accessToken = await getInvitation(conferenceId, externalId, isListener);

        response.set('Content-Type', 'application/json');
        response.send(
            JSON.stringify({
                conferenceId: conferenceId,
                accessToken: accessToken[externalId],
            })
        );
    } catch (error) {
        console.log(error);
        response.status(500);
        response.send('An error happened.');
    }
});

// Extract the port number from the command argument
program.option('-p, --port <portNumber>', 'Port number to start the HTTP server on.');
program.parse(process.argv);

let portNumber = 8081; // Default port number
const options = program.opts();
if (options.port) {
    const p = parseInt(options.port, 10);
    if (!isNaN(p)) {
        portNumber = p;
    }
}

// Starts an HTTP server
var server = app.listen(portNumber, function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log('Dolby.io sample app listening at http://%s:%s', host, port);
});
