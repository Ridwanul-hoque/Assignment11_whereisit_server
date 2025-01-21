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
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const lostfindCollection = client.db('lostandfound').collection('non-recovered')
        const recoverCollection = client.db('lostandfound').collection('recovered')


        app.get('/non-recovered/full', async (req, res) => {
            const cursor = lostfindCollection.find().limit(4)
            const result = await cursor.toArray();
            res.send(result)
        })
        app.get('/non-recovered/allItems', async (req, res) => {
            const cursor = lostfindCollection.find()
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


        // app.get('/non-recovered/full/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) }
        //     const result = await lostfindCollection.findOne(query)
        //     res.send(result)
        // })
        app.get('/non-recovered/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await lostfindCollection.findOne(query)
            res.send(result)
        })
        // app.get('/non-recovered/found/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) }
        //     const result = await lostfindCollection.findOne(query)
        //     res.send(result)
        // })
        // app.get('/non-recovered/lost/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) }
        //     const result = await lostfindCollection.findOne(query)
        //     res.send(result)
        // })

        app.get('/non-recovered', async(req, res) => {
            const email = req.query.email;
            const query = {email: email}
            const result = await lostfindCollection.find(query).toArray();
            res.send(result)
        })
        


        app.post('/non-recovered', async (req, res) => {
            const newBook = req.body;
            const result = await lostfindCollection.insertOne(newBook)
            res.send(result)
        })



       

        app.put('/non-recovered/:id', async (req, res, next) => {
            const id = req.params.id;
            const updatedItem = req.body;
        
            const result = await lostfindCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedItem }
            );
        
            if (result.modifiedCount === 0) {
                return res.status(404).send({ message: 'Item not found or no changes made' });
            }
        
            res.status(200).send({ message: 'Item updated successfully' });
        });
        
        app.delete('/non-recovered/:id', async (req, res, next) => {
            const id = req.params.id;
        
            const result = await lostfindCollection.deleteOne({ _id: new ObjectId(id) });
        
            if (result.deletedCount === 0) {
                return res.status(404).send({ message: 'Item not found' });
            }
        
            res.status(200).send({ message: 'Item deleted successfully' });
        });
        
        // Error-handling middleware
        app.use((err, req, res, next) => {
            console.error('Error:', err);
            res.status(500).send({ message: 'An error occurred while processing your request' });
        });
        
        
        





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

            const result = await recoverCollection.insertOne(newRecoveredItem);
            res.status(201).send({ message: "Recovered item added successfully.", result });
        });


        app.get('/recovered', async (req, res) => {
            const email = req.query.email;
            if (!email) {
                return res.status(400).send({ message: "Email query parameter is required." });
            }
            const query = { "recoveredBy.email": email };
            const cursor = recoverCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
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

