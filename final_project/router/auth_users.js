const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    {
        "username": "Jon",
        "password": "9999"
    }
];

const isValid = (username) => {
    const user = users.find((user) => user.username === username);
      if (user) {
      return true;
    }
    return false;
  };
  
  const authenticatedUser = (username, password) => {
    const user = users.find((user) => user.username === username);
    if (username && user.password === password) {
      return true;
    }
    return false;
  };

regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;

    if (isValid(username)) {
      if (authenticatedUser(username, password)) {
        req.session.user = { username };
        const token = jwt.sign({ username }, "access", { expiresIn: 60 * 60 });
        req.session.token = token;
        return res.json({message: 'Login successful!', token });
      }
    }
});

regd_users.get("/auth/review/", (req,res) => {
    if (!req.session.token) {
      return res.json({ message: 'Unauthorised' });
    }
    try {
      const tokenExist = jwt.verify(req.session.token, "access");
      const { username } = tokenExist;
      return res.json({ message: 'Hello ${username}, you are authenticated for access.' });
    } catch (err) {
      return res.json({ message: 'You are unauthorised' });
    }
  });

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;
    const username = req.session.authorization.username;
    console.log("add review: ", req.params, req.body, req.session);
    if (books[isbn]) {
        let book = books[isbn];
        book.reviews[username] = review;
        return res.send("Review successfully posted");
    }
    else {
        return res.json({message: `ISBN ${isbn} not found`});
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const token = req.headers["authorisation"];
    const { isbn } = req.params;

    if (!token) return res.json({ message: "Token not found" });
  
    jwt.verify(token, "access", (err, decoded) => {
      if (err)
        return res.json({ message: "You are unauthorised" });
  
      const username = decoded.username;
      const book = books[isbn];
  
      if (book) {
        if (book.reviews[username]) {
        
          delete book.reviews[username];
          return res.json({ message: "Review successfully deleted" });
        } else {
          return res.json({ message: "No such review" });
        }
      } else {
        return res.json({ message: "No such book" });
      }
    });
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
