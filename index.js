const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.92306.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    console.log("decoded", decoded);
    req.decoded = decoded;
    next();
  });
}
async function run() {
  try {
    await client.connect();
    const productCollection = client.db("jahanParts").collection("products");
    const orderCollection = client.db("jahanParts").collection("orders");
    const reviewCollection = client.db("jahanParts").collection("reviews");

    // AUTH
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

    // Get all services
    app.get("/services", async (request, response) => {
      const query = {};
      const cursor = productCollection.find(query);
      const services = await cursor.toArray();
      response.send(services);
    });

    // Get all Products
    app.get("/products", async (request, response) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      response.send(products);
    });
    // product Details
    app.get("/product/:id", async (request, response) => {
      const id = request.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      response.send(product);
    });

    // Order Place
    app.post("/order", async (req, res) => {
      const newOrder = req.body;
      const result = await orderCollection.insertOne(newOrder);
      res.send(result);
    });

    /**
     * =======================================
     *              Review API
     * ======================================
     * */
    // http://localhost:5000/review?email=samraatjahangir@gmail.com
    app.get("/review", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = orderCollection.find(query);
        const reviews = await cursor.toArray();
        res.send(reviews);
      } else {
        res.status(403).send({ message: "forbidden access" });
      }
    });
    app.post("/review", async (req, res) => {
      const newOrder = req.body;
      const result = await reviewCollection.insertOne(newOrder);
      res.send(result);
    });

    console.log("DB connected");
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello From Jahan Parts Shop!");
});

app.listen(port, () => {
  console.log(`Jahan Parts app listening on port ${port}`);
});
