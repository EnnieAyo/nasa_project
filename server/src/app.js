const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const api = require('../src/routes/api')
// const path = require('path');

const planetsRouter = require('./routes/planets/planets.router');
const launchesRouter = require('./routes/launches/launches.router');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
}));
// the logger middleware
app.use(morgan("combined"));

app.use(express.json());
// to serve the built static files in the public folder
// app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/planets', planetsRouter);
app.use('/launches', launchesRouter);

//versioning my code
app.use('/v1', api);
// app.use('/v2', api);

// to send the index.html file generated after the build
// the '/*' is used to pass the handling of the routes not found in the APIs to the front end engine
// app.get('/*', (req, res) => {
    // res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
// });

module.exports = app;