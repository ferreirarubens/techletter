const { google } = require('googleapis');

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

  response.json(authUrl);
};

export default newsletter;
