const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jeukq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        const database = client.db('assignment_11');
        const productCollection = database.collection('products');
        const productShop = database.collection('storedProduct');
        const reviewLog = database.collection('reviews');
        const usersCollection = database.collection('users');


        app.get('/exploreAll', async (req, res) => {
            const email = req.query.email;
            const query = {email: email};
            // console.log(query);
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.json(products);
        })
        
        app.get('/exploreAll/admin', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.json(products);
        })

        app.delete('/exploreAll/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result = await productCollection.deleteOne(query);
            res.json(result);
        })
       

        app.get('/storedProduct', async (req, res) => {
            const cursor = productShop.find({});
            const products = await cursor.toArray();
            res.json(products);
        })

        app.get('/storedProduct/homePage', async (req, res) => {
            const cursor = productShop.find({});
            const products = await cursor.limit(6).toArray();
            res.json(products);
        })
        
        app.post('/storedProduct', async (req, res) => {
            const addingProduct = req.body;
            const result = await productShop.insertOne(addingProduct);
            console.log(result);
            res.json(result);
        });
        app.delete('/storedProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result = await productShop.deleteOne(query);
            res.json(result);
        })

        app.get('/reviews', async (req, res) => {
            const cursor = reviewLog.find({});
            const reviews = await cursor.toArray();
            res.json(reviews);
        })

        app.post('/reviews', async (req, res) => {
            const addingReview = req.body;
            const result = await reviewLog.insertOne(addingReview);
            console.log(result);
            res.json(result);
        });

        

        app.post('/explore', async (req, res) => {
            const exploreProduct = req.body;
            const result = await productCollection.insertOne(exploreProduct);
            // console.log(result);
            res.json(result);
        });

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if(user?.role === 'admin') {
                isAdmin= true;
            }
            res.json({admin: isAdmin});
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            // console.log(result);
            res.json(result);
        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email};
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email};
            const updateDoc = { $set: {role: 'admin'} };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

    }
    finally{
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello ASS12!')
})

app.listen(port, () => {
  console.log(`Listening at ${port}`)
})