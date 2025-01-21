const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors());
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8gt7g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const lostfindCollection = client.db('lostandfound').collection('non-recovered')
        const recoverCollection = client.db('lostandfound').collection('recovered')


        app.get('/non-recovered/full', async (req, res) => {
            const cursor = lostfindCollection.find()
            const result = await cursor.toArray();
            res.send(result)
        })
        app.get('/non-recovered', async (req, res) => {
            const cursor = lostfindCollection.find().limit(4)
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/non-recovered/lost', async (req, res) => {
            const cursor = lostfindCollection.find({ postType: "Lost" }).limit(4);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/non-recovered/found', async (req, res) => {
            const cursor = lostfindCollection.find({ postType: "Found" }).limit(4);
            const result = await cursor.toArray();
            res.send(result);
        });


        app.get('/non-recovered/full/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await lostfindCollection.findOne(query)
            res.send(result)
        })
        app.get('/non-recovered/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await lostfindCollection.findOne(query)
            res.send(result)
        })
        app.get('/non-recovered/found/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await lostfindCollection.findOne(query)
            res.send(result)
        })
        app.get('/non-recovered/lost/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await lostfindCollection.findOne(query)
            res.send(result)
        })





        // recovered
        app.post('/recovered', async (req, res) => {
            const { recoveredLocation, recoveredDate, recoveredBy } = req.body;

            if (!recoveredLocation || !recoveredDate || !recoveredBy) {
                return res.status(400).send({ message: "All fields are required." });
            }

            const newRecoveredItem = {
                recoveredLocation,
                recoveredDate,
                recoveredBy,
                createdAt: new Date(),
            };

            try {
                const result = await recoverCollection.insertOne(newRecoveredItem);
                res.status(201).send({ message: "Recovered item added successfully.", result });
            } catch (error) {
                console.error("Error adding recovered item:", error);
                res.status(500).send({ message: "Failed to add recovered item." });
            }
        });






    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Where is iT?!')
})

app.listen(port, () => {
    console.log(`it is in ${port}`)
})

