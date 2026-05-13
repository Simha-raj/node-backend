const mongoose = require("mongoose");
const axios = require("axios");

// -------------------- MongoDB Connection --------------------

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    throw err;
  }
};

// -------------------- Schema Definition --------------------

const dataSchema = new mongoose.Schema(
  {
    code: String,
    rate: Number,
    volume: Number,
    cap: Number,
  },
  {
    timestamps: true,
  }
);

const Livedata = mongoose.models.Livedata || mongoose.model("Livedata", dataSchema);

// -------------------- API --------------------

const fetchData = async (req, res) => {
  try {
    // Connect DB
    await connectDB();

    const headers = {
      "content-type": "application/json",
      accept: "application/json",
   "x-api-key": "73f7a2d8-1f0c-4645-8e7f-99892a2a5162",
    };

    // Fetch data from LiveCoinWatch
    const response = await axios.post(
      "https://api.livecoinwatch.com/coins/list",
      {
        currency: "USD",
        sort: "rank",
        order: "ascending",
        offset: 0,
        limit: 50,
        meta: true,
      },
      { headers }
    );

    // Map response
    const mappedResponse = response.data.map((item) => ({
      code: item.code,
      rate: item.rate,
      volume: item.volume,
      cap: item.cap,
    }));

    // Insert into MongoDB
    await Livedata.insertMany(mappedResponse);

    // Get latest records
    const resp = await Livedata.find({
      code: req.query.code,
    })
      .sort({ createdAt: -1 })
      .limit(20);

    // Response
    res.status(200).json({
      success: true,
      data: resp,
    });
  } catch (err) {
    console.error("Fetch Data Error:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

module.exports = {
  fetchData,
};
