const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.PROT || 5000;

// middleware
app.use(cors({
    origin: ["http://localhost:5173", "https://sparkling-paletas-aeb127.netlify.app/"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    withCredentials: true,
}
))
app.use(express.json())


app.get('/', (req, res) => {
    res.send('art and craft')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xes5bsh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        const productCollection = client.db('Art&CraftStoreDB').collection('product')

        app.get('/myArtAndCraft/:email', async (req, res) => {
            const result = await productCollection.find({ email: req.params.email }).toArray()
            res.send(result)
        })
        app.get('/singleProduct/:id', async (req, res) => {
            console.log(req.params.id);
            const result = await productCollection.findOne({ _id: new ObjectId(req.params.id) });
            res.send(result)
        })
        app.put('/update/:id', async (req, res) => {
            console.log(req.params.id);
            const query = { _id: new ObjectId(req.params.id) };
            const options = { upsert: true };
            const getUpdateInfo = req.body
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
                }
            };
            const result = await productCollection.updateOne(query, updatedProductInfo, options);
            res.send(result)
        })

        app.post('/addCraft', async (req, res) => {
            const product = req.body
            console.log('new product', product);
            const result = await productCollection.insertOne(product)
            res.send(result)
        })
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log('prot is running ', port);
})
