const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const getRandomString = function() {
  let random = "";
  const options = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < 5; i++) {
    let num = Math.floor(Math.random() * 62);
    random += options[num];
  }
  return random;
};



const cookieParser = require('cookie-parser')
app.use(cookieParser())
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {
  "G57F3": {
    userId: "G57F3",
    email: "hi@hi.com",
    password: "4321"
  },
};
const emailLookup = (email) => {
  let answer = false;
  for(const userId in users) {
    if(users[userId].email === email) {
      answer = true;
    }
  }
  return answer;
} 
app.post('/register', (req, res) => {

  let email = emailLookup(req.body.email);

  if(email) {
    return res.status(400).send("user already exists. Please visit login page.")
  }
  if(!req.body.email || req.body.password) {
    return res.status(400).send("email or password cannot be blank")
  }


  let userId = getRandomString();

  users[userId] = {
    userId: userId,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie("userId", userId)
  res.redirect('/urls')
})

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let shortUrl = getRandomString();
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect(`urls/${shortUrl}`);         // Respond with 'Ok' (we will replace this)
});

app.post("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls');
});


app.post("/urls/:url/delete", (req, res) => {
  const templateVars = { urls: urlDatabase };
  let shortURL = req.params.url;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res.cookie("userId", req.body.userId);
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  res.clearCookie("userId", req.cookies["userId"])
  res.redirect("/urls");
})

app.get('/register', (req, res) => {
  const templateVars = {  userId: req.cookies["userId"] ? req.cookies["userId"] : "", email: req.cookies["userId"] ? users[req.cookies['userId']].email : "" };
  res.render("user-registration", templateVars);

})

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, userId: req.cookies["userId"] ? req.cookies["userId"] : "", email: req.cookies["userId"] ? users[req.cookies['userId']].email : ""};

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {  userId: req.cookies["userId"] ? req.cookies["userId"] : "", email: req.cookies["userId"] ? users[req.cookies['userId']].email : "" };
  
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];

  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], userId: req.cookies["userId"] ? req.cookies["userId"] : "", email: req.cookies["userId"] ? users[req.cookies['userId']].email : ""};

  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
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