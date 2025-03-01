const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios').default;

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
      return res.send("username and/or password are not provided");
    }
      const user = users.find((user) => user.username === username);
  
    if (user) {
      return res.send("user already exists");
    }
  
    const registeredUser = {
      username: req.body.username,
      password: req.body.password,
    };
  
    users.push(registeredUser);
  
    return res.json(users);
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify({books}, null, 4));
    });

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const ISBN = req.params.isbn;
      res.send(books[ISBN])
   });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    const book = Object.values(books).filter((book)=>book.author===author);
    if (book.length>0){
        return res.json(book);
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    const book = Object.values(books).filter((book)=>book.title===title);
    if (book.length>0){
        return res.json(book);
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const ISBN = req.params.isbn;
  res.send({Reviews: books[ISBN].reviews})
});


//
//task 10
public_users.get("/", async (req, res) => {
    try {
      const response = await axios.get("http://localhost:5000/booklist");
      res.send(JSON.stringify(response.data));
    } catch {
      res.send.json({ message: 'Error' });
    }
  });

  
//task 11
public_users.get("/isbn/:isbn", async (req, res) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/isbn/${req.params.isbn}`
      );
      res.send(JSON.stringify(response.data));
    } catch {
      res.send.json({ message: 'Error' });
    }
  });
  
//task 12
public_users.get("/author/:author", async (req, res) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/author/${req.params.author}`
      );
      res.send(JSON.stringify(response.data));
    } catch {
      res.send.json({ message: 'Error' });
    }
  });
  
//task 13
public_users.get("/title/:title", (req, res) => {
    const response = axios
      .get(`http://localhost:5000/title/${req.params.title}`)
      .then((response) => {
        res.send(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
        res.send.json({ message: 'Error' });
      });
  });
  
module.exports.general = public_users;
