const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('bodyparser');
const axios = require('axios');

//Mongodb connection
mongoose.connect("mongodb://localhost:27017/TempDatabase?directConnection=true",{})

//Schema Definition
const dataSchema = new mongoose.Schema({
    code: String,
    rate: Number,
    volume: Number,
    cap: Number,
})

const Livedata = mongoose.model('Livedata',dataSchema);

//Api for fetching data from liveCoinWatch

const fetchData = async (req, res) => {

    try {

        const headers = {
            "content-type": "application/json",
            "x-api-key": "73f7a2d8-1f0c-4645-8e7f-99892a2a5162",
            "accept": "application/json"
        }

        const response = await axios.post("https://api.livecoinwatch.com/coins/list", {
            "currency": "USD",
            "sort": "rank",
            "order": "ascending",
            "offset": 0,
            "limit": 50,
            "meta": true
        }, { headers });

        const mappedResponse = response.data.map((resp) => ({
            "code": resp.code,
            "rate": resp.rate,
            "volume": resp.volume,
            "cap": resp.cap,
        }));

        await insertData(mappedResponse);

        async function insertData(data) {
            for (const item of data) {
                await new Livedata({ ...item }).save();
            }

        }

        const resp = await Livedata.find({ "code": req.query.code }).sort({ _id: -1 }).limit(20);

        const result = resp.map((resp) => ({
            "code": resp.code,
            "rate": resp.rate,
            "volume": resp.volume,
            "cap": resp.cap,
        }));

        res.status(200).json({ data: [...result,] })

    } catch (err) {
        res.status(500).json({ error: `Failed to fetch data ${err}` });
    }
}

module.exports.fetchData = fetchData;
