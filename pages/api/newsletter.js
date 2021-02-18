const { google } = require('googleapis');
const readline = require('readline');

const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_SECRET_KEY;
const redirect_uri = process.env.GOOGLE_AUTH_URI;

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

const newsletter = (request, response) => {
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);
  console.log(oAuth2Client);

  const authUrl =
    oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    }) + 'https://techletter.vercel.app/api/google-callback';
  console.log('Authorize this app by visiting this url:', authUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });

  response.json(authUrl);
};

function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

export default newsletter;
