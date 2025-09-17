const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  if (!isValid(username)) {
    return res.status(409).json({message: "User already exists"});
  }
  users.push({username, password});
  return res.status(200).json({message: "User registered successfully"});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const bookList = await Promise.resolve(books);
    return res.send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).json({message: "Error fetching books"});
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const book = await new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject(new Error("Book not found"));
      }
    });
    return res.send(JSON.stringify(book, null, 4));
  } catch (error) {
    return res.status(404).json({message: error.message});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const matchingBooks = await new Promise((resolve) => {
      const result = {};
      Object.keys(books).forEach(isbn => {
        if (books[isbn].author === author) {
          result[isbn] = books[isbn];
        }
      });
      resolve(result);
    });
    if (Object.keys(matchingBooks).length > 0) {
      return res.send(JSON.stringify(matchingBooks, null, 4));
    } else {
      return res.status(404).json({message: "No books found by this author"});
    }
  } catch (error) {
    return res.status(500).json({message: "Error"});
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const matchingBooks = await new Promise((resolve) => {
      const result = {};
      Object.keys(books).forEach(isbn => {
        if (books[isbn].title === title) {
          result[isbn] = books[isbn];
        }
      });
      resolve(result);
    });
    if (Object.keys(matchingBooks).length > 0) {
      return res.send(JSON.stringify(matchingBooks, null, 4));
    } else {
      return res.status(404).json({message: "No books found with this title"});
    }
  } catch (error) {
    return res.status(500).json({message: "Error"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
