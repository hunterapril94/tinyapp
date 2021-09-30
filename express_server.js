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
const emailLookup = (email) => {
  let answer = "";
  for(const userId in users) {
    if(users[userId].email === email) {
      answer = users[userId];
    }
  }
  return answer;
} 
const urlsForUserId = function(userId) {
  let IdUrls = {};
  for(const url in urlDatabase) {
    if(urlDatabase[url].userId === userId) {
      IdUrls[url] = urlDatabase[url].longUrl;
    }
  }
  return IdUrls;
} 

app.post('/register', (req, res) => {

  let email = emailLookup(req.body.email);

  if(email) {
    return res.status(400).send("user already exists. Please visit login page.")
  }
  if(!req.body.email || !req.body.password) {
    return res.status(400).send("email or password cannot be blank")
  }


  let userId = getRandomString();
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[userId] = {
    userId: userId,
    email: req.body.email,
    password: hashedPassword
  }
  console.log(users)
  res.cookie("userId", userId)
  res.redirect('/urls')
})

app.post("/urls", (req, res) => {
  if(!req.cookies['userId']) {
    return res.status(403).send("Please login to alter information")
  }
  console.log(req.body);  // Log the POST request body to the console
  let shortUrl = getRandomString();
  urlDatabase[shortUrl].longURL = req.body.longURL;
  res.redirect(`urls/${shortUrl}`);         // Respond with 'Ok' (we will replace this)
});

app.post("/u/:shortURL", (req, res) => {
  if(!req.cookies['userId']) {
    return res.status(403).send("Please login to alter information")
  } else if(req.cookies['userId'] !== urlDatabase[req.params.url].userId) {
    return res.status(403).send("This user does not have authorization to change this information")
  }
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});


app.post("/urls/:url/delete", (req, res) => {
  if(!req.cookies['userId']) {
    return res.status(403).send("Please login to alter information")
  } else if(req.cookies['userId'] !== urlDatabase[req.params.url].userId) {
    return res.status(403).send("This user does not have authorization to change this information")
  }
  const templateVars = { urls: urlDatabase };
  let shortURL = req.params.url;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let email = emailLookup(req.body.email)
  if(!email) {
    return res.status(403).send('this user does not exist')
  }

  if(!bcrypt.compareSync(req.body.password, email.password)) {
    return res.status(403).send('Password incorrect')
  }
  res.cookie("userId", email.userId);
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  res.clearCookie("userId", req.cookies["userId"])
  res.redirect("/urls");
})

app.get('/login', (req, res) => {
  const templateVars = {  userId: req.cookies["userId"] ? req.cookies["userId"] : "", email: req.cookies["userId"] ? users[req.cookies['userId']].email : "" };
  res.render('login', templateVars)
})

app.get('/register', (req, res) => {
  const templateVars = {  userId: req.cookies["userId"] ? req.cookies["userId"] : "", email: req.cookies["userId"] ? users[req.cookies['userId']].email : "" };
  res.render("user-registration", templateVars);

})

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlsForUserId(req.cookies["userId"]) ? urlsForUserId(req.cookies["userId"]) : "", userId: req.cookies["userId"] ? req.cookies["userId"] : "", email: req.cookies["userId"] ? users[req.cookies['userId']].email : ""};

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {  userId: req.cookies["userId"] ? req.cookies["userId"] : "", email: req.cookies["userId"] ? users[req.cookies['userId']].email : "" };
  if(!req.cookies['userId']) {
    res.redirect("../urls")
  } else {
  res.render("urls_new", templateVars);
}
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longUrl;

  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longUrl, userId: req.cookies["userId"] ? req.cookies["userId"] : "", email: req.cookies["userId"] ? users[req.cookies['userId']].email : ""};

  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
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