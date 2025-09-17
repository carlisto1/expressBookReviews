const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return !users.find(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  const user = users.find(user => user.username === username && user.password === password);
  return !!user;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ username }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = { accessToken };
    return res.status(200).json({message: "User logged in successfully"});
  } else {
    return res.status(401).json({message: "Invalid credentials"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.user.username;
  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }
  if (!review) {
    return res.status(400).json({message: "Review is required"});
  }
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }
  books[isbn].reviews[username] = review;
  return res.status(200).json({message: "Review added/modified successfully"});
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;
  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }
  if (books[isbn].reviews && books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({message: "Review deleted successfully"});
  } else {
    return res.status(404).json({message: "Review not found"});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
