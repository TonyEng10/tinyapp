const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = 8080; // default port 8080
// const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");


app.set("view engine", "ejs");
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ["user_id"]
}));

const getUserbyEmail = require("./helpers.js");

let getshortUrlId = () => Math.random().toString(36).substring(2, 8);
const getnewUserId = () => Math.random().toString(36).substring(2, 8);



// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
const urlsForUser = (userID, urlDatabase) => {
  const urls = {}
  console.log("urlDatabase", urlDatabase);
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userID) {
      urls[shortURL] = urlDatabase[shortURL].longURL
    }
  }

  return urls
}

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};
// const passwordUser2 = "aa";
// const user2HashedPassword = bcrypt.hashSync(passwordUser2, 10);

const users = {
  

  'm75t54': {
    id: 'm75t54',
    email: '123@123.com',
    password: '$2a$10$bZzqDIZ5HuO5.q2DzaTBXuW3bzUD66TakpcJXj07AKqxP5jhojKta'
  },
  
  '4ljtye': {
    id: '4ljtye',
    email: 'neo@gmail.com',
    password: '$2a$10$LQN2WVqXcTupAhhOdEwyoOxKgPx/DxPYBl7aA5e181kpo/Aam3wDO'
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



app.get("/urls", (req, res) => {
  const userDetails = (users[req.session["user_id"]]);

  if (!userDetails) {
    return res.status(401).send('unable to access. please register or login first')
  }
  console.log("userDetails", userDetails);
  const userOwnedURLs = urlsForUser(userDetails.id, urlDatabase)
  const templateVars = { urls: userOwnedURLs, user: users[req.session["user_id"]] };

  // if(Object.keys(userOwnedURLs).length > 0) {
  //   templateVars.urls = userOwnedURLs
  // }   

  // console.log(urlsForUser(userDetails));

  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const userDetails = (users[req.session["user_id"]]);
  // console.log(users);
  if (userDetails) {
    return res.redirect("/urls");
  } else
    res.render("urls_register");
});

app.post("/register", (req, res) => {
  // const userId = req.cookies.user_id;
  const newUserId = getnewUserId();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10)

  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("need to input email and password");
  }

  let foundUser = getUserbyEmail(req.body.email, users);
  if (foundUser) {
    return res.status(400).send("user already exists");
  }

  req.session.user_id = newUserId;
  // const { email, password } = req.body;
  const user = { id: newUserId, email: req.body.email, password: hashedPassword }
  users[newUserId] = user
  // console.log("test users", users);

  // console.log(res.cookie);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const userDetails = (users[req.session.user_id]);
  // console.log("userDetails", userDetails);
  if (userDetails) {
    return res.redirect("/urls");
  } else
    return res.render("urls_login");
});

app.post("/login", (req, res) => {
  const password = req.body.password;
  const userEmail = req.body.email;
  const foundUser = getUserbyEmail(userEmail, users);
  // console.log("foundUser", foundUser);
  const isPasswordCorrect = bcrypt.compareSync(password, foundUser.password);

  // console.log("foundUser", foundUser);
  // console.log("password", password);
  if (foundUser) {
    if (!isPasswordCorrect) {
      return res.status(403).send("password is incorrect")
    } else {
      req.session["user_id"] = foundUser.id;
      return res.redirect("/urls");
    }
  }
  return res.status(403).send("email cannot be found")
});

app.post(`/urls/:id/delete`, (req, res) => {
  const userDetails = (users[req.session["user_id"]]);
  if (!userDetails) {
    return res.status(401).send('unable to delete URL that is not yours')
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const userDetails = (users[req.session["user_id"]]);
  if (!userDetails) {
    return res.status(401).send("please register to access Create New URL")
  }
  console.log("test this thing", req.body);
  const shortUrlId = getshortUrlId();
  urlDatabase[shortUrlId] = {
    longURL: req.body.longURL,
    userID: userDetails.id
  }
  // console.log(urlDatabase);
  res.redirect(`/urls/${shortUrlId}`);

});
app.post("/urls/:id", (req, res) => {
  // console.log("test line 171", urlDatabase[req.params.id]);
  // console.log("test line 172", { longURL: req.body.longURL });
  urlDatabase[req.params.id].longURL = req.body.longURL;

  res.redirect("/urls");

});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.session["user_id"]] };
  const userDetails = (users[req.session["user_id"]]);
  if (!userDetails) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

// app.get("/urls", (req, res) => {
//   const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
//   res.render("urls_index", templateVars);
// })

app.get("/urls/:id", (req, res) => {
  const userDetails = (users[req.session["user_id"]]);
  // console.log("userid test", urlDatabase[req.params.id].userID);
  // console.log("userDetails test", userDetails.id);
  if (!userDetails) {
    return res.status(401).send('Unable to access. login first to see URLs')
  }
  if (userDetails.id !== urlDatabase[req.params.id].userID) {
    return res.status(401).send("cannot view URL that you do not own")
  }
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.session["user_id"]] };
  res.render("urls_show", templateVars);
});


app.get("/u/:id", (req, res) => {
  const userDetails = users[req.session["user_id"]];
  // console.log("typeof check", typeof userDetails);
  // console.log("check req params", req.params);
  // console.log("userDetails", userDetails);
  if (req.params.id === "undefined") {
    return res.status(404).send("short URL not found")
  }

  const templateVars = { urls: urlDatabase, user: users[req.session["user_id"]] };
  const longURL = urlDatabase[req.params.id].longURL;
  // console.log(longURL);

  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
