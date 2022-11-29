const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

let shortUrlId = Math.random().toString(36).substring(2, 8);

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
delete urlDatabase["9sm5xK"];
res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const newObj = {
    [shortUrlId]: req.body.longURL,
  }
  console.log(req.body); // Log the POST request body to the console
  console.log(urlDatabase);
  urlDatabase[shortUrlId] = req.body.longURL;
  // Object.assign(urlDatabase, req.body);
  console.log(urlDatabase);
  res.redirect("/urls/:id"); // Respond with 'Ok' (we will replace this)

});



app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: req.body.longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
const longURL = urlDatabase[shortUrlId];
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

