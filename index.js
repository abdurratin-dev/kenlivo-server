import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config'
import cors from 'cors';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(`${process.env.MONGODB_URI}`);
async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}
connectToMongoDB()

const db = client.db('kenlivo-web-app');
const productsCollection = db.collection('products');
const ordersCollection = db.collection('productOrders')

app.get('/' , (req,res)=>{
    res.send({massage : 'server running!'})
})

app.get('/products' ,async(req,res)=>{
    const data = await productsCollection.find().toArray();
    res.send(data)
})

app.get('/products/:id' , async(req,res)=>{
  const id = req.params.id;
  const quary = {_id : new ObjectId(id)};
  const result = await productsCollection.findOne(quary);
  res.send(result);
})

app.delete('/products/:id' , async(req,res)=>{
  const id = req.params.id;
  const quary = {_id : new ObjectId(id)};
  const result = await productsCollection.deleteOne(quary);
  res.send(result);
})

app.patch("/products/:id", async(req,res)=>{
  const id = req.params.id;
  const body = req.body;
  const quary = {_id : new ObjectId(id)};
  const result = await productsCollection.updateOne(quary,{
    $set:body
  })
  res.json(result);
})

app.post('/products',async(req,res)=>{
    const body = req.body;
    const result = await productsCollection.insertOne(body);
    console.log(result);
    res.send(result)
})

app.get('/product-orders' ,async(req,res)=>{
    const data = await ordersCollection.find().toArray();
    res.send(data)
})

app.get('/product-orders/:email' , async(req,res)=>{
  const email = req.params.email;
  const quary = {email : email};
  const result = await ordersCollection.find(quary).toArray();
  res.send(result);
})

app.post('/product-orders', async(req,res)=>{
  const body = req.body;
  console.log(body);
  const result = await ordersCollection.insertOne(body);
  res.send(result);
})

app.delete('/product-orders/:id' , async(req,res)=>{
  const id = req.params.id;
  const quary = {_id : new ObjectId(id)};
  const result = await ordersCollection.deleteOne(quary);
  res.send(result);
})

app.listen(port , ()=>{
    console.log('server creat sucsessfull');
})