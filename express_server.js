const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


let getshortUrlId = () => Math.random().toString(36).substring(2, 8);
const getnewUserId = () => Math.random().toString(36).substring(2, 8);

const getUserbyEmail = (email) => {
  // let foundUser = null;

  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
}

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
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  // console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {

  res.render("urls_register");
});

app.post("/register", (req, res) => {
  // const userId = req.cookies.user_id;
  const newUserId = getnewUserId();

  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("need to input email and password");
  }

  let foundUser = getUserbyEmail(req.body.email);
  if (foundUser) {
    return res.status(400).send("user already exists");
  }

  res.cookie("user_id", newUserId);
  const { email, password } = req.body;
  const user = { id: newUserId, email: req.body.email, password: req.body.password }
  users[newUserId] = user

  // console.log(res.cookie);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
const userDetails = (users[req.cookies["user_id"]]);
console.log(users);
if (userDetails) {
  return res.redirect("/urls");
} else
  return res.render("urls_login");
});

app.post("/login", (req, res) => {

  let foundUser = getUserbyEmail(req.body.email);
  if (foundUser) {
    if (req.body.password !== foundUser.password) {
      return res.status(403).send("password is incorrect")
    } else {
      res.cookie("user_id", foundUser.id);
      return res.redirect("/urls");
    }
  }
  return res.status(403).send("email cannot be found")
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
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
})

app.get("/urls/:id", (req, res) => {
  // console.log(req.params);
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});


app.get("/u/:id", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
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
