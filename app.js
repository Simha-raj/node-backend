const express = require('express');
const http = require("http");
const multer = require("multer");
const cors = require("cors");
const axios=require('axios');


const { uploadFile, searchPolicy, aggregatePolicies, scheduleMessage, fetchData } = require('./controller/control.js');
const bodyparser = require('body-parser');
const app =express();


app.use(bodyparser.json());

app.use(cors());

app.get("/api/fetch-data", fetchData);

const port = 3000;

app.listen(port, () => { console.log(`server running at http://localhost:${port}`) });
