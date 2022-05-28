const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.92306.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const collection = client.db("doctorsPortal").collection("services");

    // Get all services
    app.get("/services", async (request, response) => {
      const query = {};
      const cursor = collection.find(query);
      const services = await cursor.toArray();
      response.send(services);
    });

    console.log("DB connected");
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello From Doctors Uncle!");
});

app.listen(port, () => {
  console.log(`Doctors app listening on port ${port}`);
});
