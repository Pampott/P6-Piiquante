const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/user');


const app = express();
app.use(express.json());

mongoose.connect("mongodb+srv://Pampott:Mimitoss@cluster0.qzfen.mongodb.net/?retryWrites=true&w=majority",
{ useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("MongoDB connecté !"))
.catch(() => console.log(("Connexion à MongoDB échouée. ")));

app.use(cors({
  origin: "http://localhost:4200"
}));

app.use('/api/auth/', userRoutes);
/*




app.get('/api/sauces', (req, res) => {

});

app.get('/api/sauces/:id', (req, res) => {

});

app.post('api/sauces', (req, res) => {

});

app.post('/api/auth/signup', (req, res) => {

});

app.post('api/auth/login', (req, res) => {

});

*/
module.exports = app;