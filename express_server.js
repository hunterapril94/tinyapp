const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const getRandomString = function () {
  let random = ""
  const options = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  for(let i = 0; i < 5; i++) {
    num = Math.floor(Math.random() * 62)
    random += options[num]
  }
  return random;
}
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let shortUrl = getRandomString();
  urlDatabase[shortUrl] = req.body.longURL
  res.redirect(`urls/${shortUrl}`);         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:url/delete", (req, res) => {
  const templateVars = { urls: urlDatabase }
  let shortURL = req.params.url
  delete urlDatabase[shortURL]
  res.redirect("/urls")
})

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
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