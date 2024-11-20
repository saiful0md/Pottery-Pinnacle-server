const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://sparkling-paletas-aeb127.netlify.app",
    ],
    credentials: true,
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xes5bsh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
app.get("/", (req, res) => {
  res.send("art and craft");
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const productCollection = client
      .db("Art&CraftStoreDB")
      .collection("product");
    const productCollectionAll = client
      .db("Art&CraftStoreDB")
      .collection("productAll");

    // POST route to add a new craft item
    app.post("/addCraft", async (req, res) => {
      try {
        const query = req.body;
        const result = await productCollection.insertOne(query);
        res.send(result);
      } catch (error) {
        console.error("Error adding craft:", error);
        res.status(500).send("Failed to add craft.");
      }
    });

    // GET route to fetch user's own items by email
    app.get("/myArtAndCraft/:email", async (req, res) => {
      try {
        const result = await productCollection
          .find({ email: req.params.email })
          .toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching user's crafts:", error);
        res.status(500).send("Failed to fetch user's crafts.");
      }
    });

    // GET route to fetch all craft items
    app.get("/craftItemSection", async (req, res) => {
      try {
        const result = await productCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching craft items:", error);
        res.status(500).send("Failed to fetch craft items.");
      }
    });

    // GET route to fetch all categories from 'productAll'
    app.get("/artAndCraftCategoriesSection", async (req, res) => {
      try {
        const result = await productCollectionAll.find().toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).send("Failed to fetch categories.");
      }
    });

    // GET route to fetch all products
    app.get("/allArtAndCraft", async (req, res) => {
      try {
        const result = await productCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching all products:", error);
        res.status(500).send("Failed to fetch all products.");
      }
    });

    // GET route to fetch a single product by its ID
    app.get("/singleProduct/:id", async (req, res) => {
      try {
        const productId = new ObjectId(req.params.id);
        const result = await productCollection.findOne({ _id: productId });
        if (result) {
          res.send(result);
        } else {
          res.status(404).send({ message: "Product not found." });
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).send("Failed to fetch product.");
      }
    });

    // PUT route to update a product by its ID
    app.put("/update/:id", async (req, res) => {
      try {
        const query = { _id: new ObjectId(req.params.id) };
        const options = { upsert: true };
        const getUpdateInfo = req.body;
        const updatedProductInfo = {
          $set: {
            photoUrl: getUpdateInfo.photoUrl,
            itemName: getUpdateInfo.itemName,
            subCategory: getUpdateInfo.subCategory,
            description: getUpdateInfo.description,
            price: getUpdateInfo.price,
            rating: getUpdateInfo.rating,
            customization: getUpdateInfo.customization,
            processing: getUpdateInfo.processing,
            stockStatus: getUpdateInfo.stockStatus,
          },
        };
        const result = await productCollection.updateOne(
          query,
          updatedProductInfo,
          options
        );
        res.send(result);
      } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send("Failed to update product.");
      }
    });

    // DELETE route to delete a product by its ID
    app.delete("/delete/:id", async (req, res) => {
      try {
        const result = await productCollection.deleteOne({
          _id: new ObjectId(req.params.id),
        });
        res.send(result);
      } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).send("Failed to delete product.");
      }
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
