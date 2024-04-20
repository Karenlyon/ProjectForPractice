const admin = require('firebase-admin');
const express = require('express');

const router = express.Router();


const serviceAccount = require("../../firebase.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore();
const booksCollection = db.collection('books');

router.get('/books', async (req, res) => {
    try {
        const snapshot = await booksCollection.get();
        const books = snapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data()

        }));
        console.log(books);
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.get('/books/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        const bookRef = booksCollection.doc(bookId);
        const doc = await bookRef.get();
        if (!doc.exists) {
            res.status(404).json({ error: 'Book not found' });
        } else {
            res.json({ id: doc.id, data: doc.data() });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/books', async (req, res) => {
    try {
        const { author, title, year, description } = req.body;
        if (!author || !title || !year || !description) {
            return res.status(400).json({ error: 'Please complete all required fields' });
        }

        const bookData = {
            author,
            title,
            year,
            description
        };

        const newBookRef = await booksCollection.add(bookData);

        res.status(201).json({ message: 'Book added successfully', id: newBookRef.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/books/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        const bookData = req.body;
        const bookRef = booksCollection.doc(bookId);
        await bookRef.set(bookData, { merge: true });
        res.json({ message: 'Book updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.delete('/books/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        await booksCollection.doc(bookId).delete();
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;