const express = require('express');
const app = express();//Initiate Express Application
const router = express.Router();
const mongoose = require('mongoose');//Node tool for MongoDB
const config = require('./config/database');//Mongoose Config
const path = require('path'); //NodeJS package for file paths

const authentication = require('./routes/authentication')(router);
const blogs = require('./routes/blogs')(router); // this router needs the token from the middleware that was implemented in authentication.js

const bodyParser = require('body-parser');

const cors = require('cors');

mongoose.Promise = global.Promise;
mongoose.connect(config.uri , (err) => {
    if(err){
        console.log('COULD NOT connect to my database '+ err);
    } else {
        console.log('Connected to database ' + config.db);
    }
});

app.use(cors({
    origin : 'http://localhost:4200'
}));
 

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Provide static directry for front-end
app.use(express.static(__dirname + '/client/dist/'));

app.use('/authentication',authentication);
app.use('/blogs',blogs);

// Connect server to Angular 2 index.html
app.get('*', (req,res) => {
    res.sendFile(path.join(__dirname + '/client/dist/index.html'));
});

// Start server : Listen on port : 8080
app.listen(8080, () => {
    console.log('Listening on port 8080');
});