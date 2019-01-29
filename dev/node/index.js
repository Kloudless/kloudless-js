/* global KLOUDLESS_APP_ID, KLOUDLESS_API_KEY */

// Test SDK on Node.js with Expressjs
// No hot reloading as of now
import express from 'express';
import kloudless from 'kloudless';

const server = express();


let account;
// initialize account manually or use /connectAccount
/**
const accountId = 0;
account = new kloudless.Account({
  token: KLOUDLESS_API_KEY,
  accountId,
  tokenType: 'APIKey',
});
 */

// an example of redirecting user to connect an account
let stateCache;
server.get('/connectAccount', (req, res) => {
  const { url, state } = kloudless.getAuthorizationUrl({
    redirectUri: 'http://localhost:8080/callback',
    scope: 'any.storage',
    appId: KLOUDLESS_APP_ID,
  });
  stateCache = state;
  res.redirect(url);
});

server.get('/callback', (req, res) => {
  kloudless.completeAuth({
    state: stateCache,
    redirectUri: 'http://localhost:8080/callback',
    oauthCallbackUrl: req.originalUrl,
    appId: KLOUDLESS_APP_ID,
    apiKey: KLOUDLESS_API_KEY,
  }).then((token) => {
    account = new kloudless.Account({ token });
    account.getDetail().then(() => {
      res.send(
        'Account connection successful<br/>'
        + `ID: ${account.id} Token: ${account.token}`
        + '<br/> Go to  http://localhost:8080/test/request to test requests'
      );
    });
  }).catch((error) => {
    res.send(`OAuth failed: ${error}`);
  });
});


// test SDK
server.get('/test/request', (req, res) => {
  const method = 'get';
  const options = {};
  account[method](options).then((response) => {
    // handle responses here
    res.send(response.data);
  }).catch((exception) => {
    res.send(exception.message);
  });
});

// an example of downloading binary files in Express
server.get('/test/binary', (req, res) => {
  const fileId = '';
  const filename = '';
  account.get({
    url: `storage/files/${fileId}/contents/`,
  }).then((response) => {
    res.setHeader('content-type', response.headers['content-type']);
    res.setHeader('content-disposition', `attachment; filename=${filename}`);
    response.data.pipe(res);
  });
});

server.listen(8080);
/* eslint-disable-next-line */
console.log('Server running at http://localhost:8080');
