const express = require('express');
const bodyParser = require('body-parser');
const ngrok = require('ngrok');
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const url = require('url');
const OAuth2 = require('simple-oauth2');
const http = require('http');
const chalk = require('chalk')
const request = require('request')


const server = express();
const port = process.env.PORT || 8000

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

//token jose
token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InBob25lIjoiOTQyNDA4NDE5IiwiaWRfdmEiOiIyOTMiLCJuYW1lIjoiSm9zZSBMdWlzIENlcsOzbiIsImJhY2tlbmRVc2VySWQiOiI3MjEifSwiaWF0IjoxNTY1MzAxNjEwfQ.QIATeuTT7_Z6ZVHFDNcXIsoat-4_HMr3X82yOGVN8_Y'

//token maria
// token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJ1c2VybmFtZSI6Ik1hcmlhIENhbGl4dHJvIiwiZW1haWwiOiJtYXJpYS5jYWxpeHRyb0BzZXJhdGljLmNvbSJ9LCJpYXQiOjE1NjUyMTg3ODd9.YBs8YyDuEcZEQEaJtAXFD8eOU8uORTp28Xz0ox-p0YQ'
//token efrain
// token= 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJ1c2VybmFtZSI6IkVmcmFpbiIsImVtYWlsIjoiZWZyYWluMjgwMEBnbWFpbC5jb20ifSwiaWF0IjoxNTY1Mjk0NzgzfQ.uX86_-OTG3OLPfhgMiSsiUssvMdPjo-mqOONtQlE2yM'
const oauth2Client = new google.auth.OAuth2(
    '761485722056-85g6gv54li457mnqldbnasfkvgc3uqc8.apps.googleusercontent.com',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJ1c2VybmFtZSI6Impvc2UiLCJlbWFpbCI6Impvc2UuY2Vyb25Ac2VyYXRpYy5jb20ifSwiaWF0IjoxNTYzODk4MTk2fQ.bvt9CzQPr2Zy73QhLdbQBaYsGRDu1ZXd4mPLsvlQGm4',
    'https://oauth-redirect.googleusercontent.com/r/seratina-3edf1');
const scopes = [
    // 'https://www.googleapis.com/auth/blogger',
    'https://www.googleapis.com/auth/calendar'
];
const url2 = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    // access_type: 'offline',  
    // If you only need one scope you can pass it as a string
    scope: scopes,
    // response_type: 'token'
    // token_type: 'bearer',
    // code: '4dp0'

});


server.get('/api', (req, res) => {
    console.log('api Intent')
    console.log(req.query)

    res.send(url2);
});

server.get('/api/auth', (req, res) => {
    console.log('api Intent')
    console.log(req.query)

    input = req.query;
    client_id = input.client_id
    redirect_uri = input.redirect_uri
    state = input.state
    response_type = input.response_type

    console.log('client_id:  ', input.client_id)
    console.log('redirect_uri: ', input.redirect_uri)
    console.log('state: ', state)
    console.log('response_type: ', input.response_type)

  

    var texto = 

        redirect_uri + 
        '#access_token=' + token +        
        '&token_type=bearer' +        
        '&state=' + state +
        '&code=' + 301 
       
        

    console.log(chalk.green.inverse(texto))

    res.redirect(texto)
   
});

server.get('/api/auth2', (req, res) => {
    console.log('api Intent')
    console.log(req.query)
    redirect_uri = req.query.redirect_uri
    state = req.query.state
    // Authorization oauth2 URI
    var authorizationUri = OAuth2.authorizationCode.authorizeURL({
        redirect_uri,
        state,
        code: '4dp0'
    });

   
    res.redirect(authorizationUri);


});


server.post('/api/token/read', verifyToken, (req, res) => {

    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.sendStatus(403)
        } else {
            res.json(
                authData
            )
        }

    })

});

// Verify token
function verifyToken(req, res, next) {
    // Get auth header value
    const bearearHeader = req.headers['authorization'];
    //check if bearer is undefined
    if (typeof bearearHeader !== 'undefined') {
        // Splt at the space
        const bearer = bearearHeader.split(' ');
        // Get token from array
        const bearerToken = bearer[1];
        //Set the token
        req.token = bearerToken;
        // Next middleware
        next();

    } else {
        //Forbidden
        res.sendStatus(403)
    }
}

server.post('/api/token/create', (req, res) => {
    //Mock user
    console.log(req.query.phone)
    const user = {
        // phone: 942408419,
        // id_va: '293',
        // name: 'Jose Luis',
        // full_id: '721'
        phone: req.query.phone,
        id_va: req.query.id_va,
        name: req.query.name,
        backendUserId: req.query.full_id//full_id
        
    }

    // jwt.sign({user: user}, 'secretkey', { expiresIn: '20s'},(err, token) => {
    jwt.sign({ user: user }, 'secretkey', (err, token) => {
        res.json({
            token: token
        })
    });
});


const serv = server.listen((port), function () {
    console.log("SERVER: UP AND LISTENING: " + serv.address().port);

});

ngrok.connect({
    proto: 'http',
    addr: 8000
}, (err, url) => {
    if (err) {
        console.error('Error while connecting Ngrok', err);
        return new Error('Ngrok Failed');
    } else {
        console.log('Tunnel Created -> ', url);

    }
});
