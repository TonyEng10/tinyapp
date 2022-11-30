const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser =require('cookie-parser');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

let getshortUrlId = () => Math.random().toString(36).substring(2, 8);
const getnewUserId = () => Math.random().toString(36).substring(2, 8);

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  // console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {

  res.render("urls_register");
});

app.post("/register", (req, res) => {
console.log(req.body);
const newUserId = getnewUserId();
const newUser = {
  id: newUserId,
    email: req.body.email,
    password: req.body.password,
}
users[newUserId] = newUser;
res.cookie("user_id", newUserId);
console.log(users);
  res.redirect("/urls");
}) 

app.post("/login", (req, res) => {
res.cookie("username", req.body.username);
// console.log(req.body);
res.redirect("/urls");
});

app.post(`/urls/:id/delete`, (req, res) => {
delete urlDatabase[req.params.id];
res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  // console.log(urlDatabase);
  const shortUrlId = getshortUrlId();
  urlDatabase[shortUrlId] = req.body.longURL;
  // console.log(urlDatabase);
  res.redirect(`/urls/${shortUrlId}`); 

});
app.post("/urls/:id", (req, res) => {
  // console.log(req.params);
  // console.log(req.body);
  urlDatabase[req.params.id] = req.body.longURL;
 
  res.redirect("/urls"); 

});

app.post("/logout", (req, res) => {
res.clearCookie("username");
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
})

app.get("/urls/:id", (req, res) => {
  // console.log(req.params);
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});


app.get("/u/:id", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  const longURL = urlDatabase[req.params.id];
  // console.log(longURL);
  
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

