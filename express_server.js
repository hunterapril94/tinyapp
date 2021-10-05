const express = require("express");
const app = express();
const PORT = 8080;

// outside functions stored for modularity
const {  emailLookup, urlsForUserId, getRandomString} = require('./helperFunctions.js');

//middleware
const cookieSession = require('cookie-session');
app.use(cookieSession({name: 'session', keys: ['secrets secrets hurt no one']}));
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const bcrypt = require('bcryptjs');

//database
const urlDatabase = {

};
const users = {

};

// begin post results

app.post('/register', (req, res) => {
  //check for email in database
  let email = emailLookup(req.body.email, users);
  //handle errors
  if (email) {
    return res.status(400).send("User already exists. Please visit login page.");
  }
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Email or password cannot be blank");
  }
  let userId = getRandomString();
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  //sets new user in database
  users[userId] = {
    userId: userId,
    email: req.body.email,
    password: hashedPassword
  };
  req.session.userId = userId;
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  //resets session to null if user Id is not in database. Mostly in case the server restarts
  if(!users[req.session.userId]) {
    req.session = null;
  }
  let shortUrl = getRandomString();
  urlDatabase[shortUrl] = {
    longUrl: req.body.longURL,
    userId: req.session.userId
  };
  res.redirect(`urls`);
});

app.post("/u/:shortURL", (req, res) => {
  if(!users[req.session.userId]) {
    req.session = null;
  }

  // handle errors
  if (!req.session) {
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
  //handle errors
  if(!users[req.session.userId]) {
    req.session = null;
  } else if (!req.session.userId) {
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
  if(!users[req.session.userId]) {
    req.session = null;
  }
  let email = emailLookup(req.body.email, users);
  if (!email) {
    return res.status(403).send('this user does not exist');
  }

  if (!bcrypt.compareSync(req.body.password, email.password)) {
    return res.status(403).send('Password incorrect');
  }
  req.session = {userId: email.userId}
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//end post results. Begin get results

app.get('/login', (req, res) => {
  if(req.session) {
    req.session = null;
  }
  const templateVars = {  userId: req.session ? req.session.userId : "", email: req.session ? users[req.session.userId].email : "" };
  if (req.session) {
    res.redirect('/urls');
  }
  res.render('login', templateVars);
});

app.get('/register', (req, res) => {
  if(!users[req.session.userId]) {
    req.session = null;
  }
  const templateVars = {  userId: req.session ? req.session.userId : "", email: req.session ? users[req.session.userId].email : "" };
  if (req.session) {
    res.redirect('/urls');
  }
  res.render("user-registration", templateVars);

});

app.get("/urls", (req, res) => {
  if(!users[req.session.userId]) {
    req.session = null;
  } 
  const templateVars = { urls: req.session ? urlsForUserId(req.session.userId, urlDatabase) : "", userId: req.session ? req.session.userId : "", email: req.session ? users[req.session.userId].email : ""};

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if(!users[req.session.userId]) {
    req.session = null;
  }
  const templateVars = {  userId: req.session ? req.session.userId : "", email: req.session ? users[req.session.userId].email : "" };
  if (!req.session) {
    res.redirect("../login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  if(!users[req.session.userId]) {
    req.session = null;
  }
  //runs error if typed url doesn't match database
  if (!urlDatabase[req.params.shortURL]) {
    return res.send('This Tiny URL does not exist. Please try again.');
  }
  const longURL = urlDatabase[req.params.shortURL].longUrl;

  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  if(!users[req.session.userId]) {
    req.session = null;
  }
  const templateVars = { shortURL: urlDatabase[req.params.shortURL] ? req.params.shortURL : "", longURL: urlDatabase[req.params.shortURL] ? urlDatabase[req.params.shortURL].longUrl : "", userId: req.session ? req.session.userId : "", email: req.session ? users[req.session.userId].email : ""};
  //handle errors
  if (!urlDatabase[req.params.shortURL]) {
    res.send("URL does not exist in database. Please try again.")
  } else if (!req.session || req.session.userId !== urlDatabase[req.params.shortURL].userId) {
    res.send('Cannot make changes to a URL you do not own.');
  }
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  if(!users[req.session.userId]) {
    req.session = null;
  } 
  if (!req.session) {
    return res.redirect('/login');
  }
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//end get

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});