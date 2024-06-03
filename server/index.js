const express = require('express');
const cors = require("cors");
const app = express();
const port = 3001;
const Book = require('./book');
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://admin:aKSHw2njjioupAYz@cluster0.bxkhk0r.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('connected to MongoDB....'))
        .catch(err => console.log("Couldn't connect to MongoDB!!"));


app.use(express.json());
app.use(cors());

let books = [];

app.post('/books', async (req, res) => {
    let book = new Book({ title: req.body.title, author: req.body.author});
    book = await book.save();
    res.send(book);
});

app.get('/books', async(req,res)=> {
    const books = await Book.find();
    res.send(books);
});

app.get('/books/:id', async(req, res) => {
    const book = await Book.findById(req.params.id);
    if(!book) {
        res.status(404).send("Book not Found!!");
    };

    res.send(book);
});

app.put('/books/:id', async(req, res) => {
    const book = await Book.findByIdAndUpdate(req.params.id, {title: req.body.title, author: req.body.author}, {new: true});
    if(!book) {
        res.status(404).send("Book not Found!!");
    }

    res.send(book);
})

app.delete('/books/:id', async(req, res) => {
    const bookIndex = await Book.findByIdAndDelete(req.params.id);
    if (!bookIndex) {
        res.status(404).send("Book not Found!");
    }

    res.status(204).send()
    console.log("Sucessfully deleted")
})

app.listen(port);