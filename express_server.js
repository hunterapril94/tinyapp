const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const {  emailLookup, urlsForUserId, getRandomString} = require('./helperFunctions.js');

const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
app.use(cookieSession({name: 'session', keys: ['secrets secrets hurt no one']}));
app.use(cookieParser());
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const bcrypt = require('bcryptjs');


const urlDatabase = {
  "b2xVn2": {
    longUrl:"http://www.lighthouselabs.ca",
    userId: "G57F3"
  },
  "9sm5xK": {
    longUrl: "http://www.google.com",
    userId: "G57F3"
  }
};
const users = {
  "G57F3": {
    userId: "G57F3",
    email: "hi@hi.com",
    password: "4321"
  },
};

app.post('/register', (req, res) => {

  let email = emailLookup(req.body.email, users);

  if (email) {
    return res.status(400).send("user already exists. Please visit login page.");
  }
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("email or password cannot be blank");
  }
  let userId = getRandomString();
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[userId] = {
    userId: userId,
    email: req.body.email,
    password: hashedPassword
  };
  console.log(users);
  req.session.userId = userId;
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  if (!req.session.userId) {
    return res.status(403).send("Please login to alter information");
  }
  console.log(req.body);
  let shortUrl = getRandomString();
  urlDatabase[shortUrl] = {
    longUrl: req.body.longURL,
    userId: req.session.userId
  };
  res.redirect(`urls`);
});

app.post("/u/:shortURL", (req, res) => {
  if (!req.session.userId) {
    return res.status(403).send("Please login to alter information");
  } else if (req.session.userId !== urlDatabase[req.params.shortURL].userId) {
    return res.status(403).send("This user does not have authorization to change this information");
  }
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userId: req.session.userId
  };
  res.redirect('/urls');
});


app.post("/urls/:url/delete", (req, res) => {
  if (!req.session.userId) {
    return res.status(403).send("Please login to alter information");
  } else if (req.session.userId !== urlDatabase[req.params.url].userId) {
    return res.status(403).send("This user does not have authorization to change this information");
  }
  const templateVars = { urls: urlDatabase };
  let shortURL = req.params.url;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let email = emailLookup(req.body.email, users);
  if (!email) {
    return res.status(403).send('this user does not exist');
  }

  if (!bcrypt.compareSync(req.body.password, email.password)) {
    return res.status(403).send('Password incorrect');
  }
  req.session.userId = email.userId;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get('/login', (req, res) => {
  const templateVars = {  userId: req.session.userId ? req.session.userId : "", email: req.session.userId ? users[req.session.userId].email : "" };
  if (req.session.userId) {
    res.redirect('/urls');
  }
  res.render('login', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = {  userId: req.session.userId ? req.session.userId : "", email: req.session.userId ? users[req.session.userId].email : "" };
  if (req.session.userId) {
    res.redirect('/urls');
  }
  res.render("user-registration", templateVars);

});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlsForUserId(req.session.userId, urlDatabase) ? urlsForUserId(req.session.userId, urlDatabase) : "", userId: req.session.userId ? req.session.userId : "", email: req.session.userId ? users[req.session.userId].email : ""};

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {  userId: req.session.userId ? req.session.userId : "", email: req.session.userId ? users[req.session.userId].email : "" };
  if (!req.session.userId) {
    res.redirect("../login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {

  if (!urlDatabase[req.params.shortURL]) {
    return res.send('This Tiny URL does not exist. Please try again.');
  }
  const longURL = urlDatabase[req.params.shortURL].longUrl;

  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] ? urlDatabase[req.params.shortURL].longUrl : "", userId: req.session.userId ? req.session.userId : "", email: req.session.userId ? users[req.session.userId].email : ""};
  if (!req.session.userId || req.session.userId === urlDatabase[req.params.shortURL].userId) {
    res.send('Cannot make changes to a URL you do not own.');
  }
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});