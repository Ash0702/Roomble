const express = require('express');
const { createServer } = require('node:http');
const dotenv = require('dotenv');
dotenv.config();
const path = require('node:path');
const { Server } = require('socket.io');
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

const Landlord_routes_auth = require(`./routes/Landlord_auth`)//contains Landlord authentication routing
const Connectto_DB = require(`./database/database`)//contains module for connecting to database

const app = express();
const port = process.env.PORT || 3000;

//Connecting to Database
Connectto_DB();


app.use(express.json());

app.use(`/authenticate`, Landlord_routes_auth);


app.listen(port, ()=>{console.log(`Server is now listening`)});
