const { google } = require('googleapis');
const fs = require('fs');
const readline = require('readline');

const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_SECRET_KEY;
const redirect_uri = process.env.GOOGLE_AUTH_URI;
const TOKEN_PATH = 'token.json';
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

const googleCallback = (request, response) => {
  console.log(request.query);
  authGoogle(request.query.code, listLabels);
  response.json('logged');
};

const authGoogle = (code, callback) => {
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);
  const authUrl =
    oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    }) + 'https://techletter.vercel.app/api/google-callback';
  console.log('Authorize this app by visiting this url:', authUrl);

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, code, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
};

function getNewToken(oAuth2Client, code, callback) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  console.log(code);
  oAuth2Client.getToken(code, (err, token) => {
    console.log('bora pegar o token')
    if (err) return console.error('Error retrieving access token', err);
    oAuth2Client.setCredentials(token);
    // Store the token to disk for later program executions
    console.log('consegui', token)
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
      if (err) return console.error(err);
      console.log('Token stored to', TOKEN_PATH);
    });
    callback(oAuth2Client);
  });
}

function listLabels(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  gmail.users.labels.list(
    {
      userId: 'me',
    },
    (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const labels = res.data.labels;
      if (labels.length) {
        console.log('Labels:');
        labels.forEach((label) => {
          console.log(`- ${label.name}`);
        });
      } else {
        console.log('No labels found.');
      }
    },
  );
}

export default googleCallback;
