const express = require("express");
const path = require("path");
const axios = require("axios");

// Init app
const app = express();

// Variables
const REST_API_URL = "https://vulcan-websocket-api.herokuapp.com/";
const WS_URL = "wss://vulcan-websocket-api.herokuapp.com/users";
const PORT = process.env.PORT || 8080;

// Load view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Load static assets
app.use("/static", express.static(path.join(__dirname, "public")))

// Home route
app.get("/", (req, res) => {
    let url = REST_API_URL + "users";
    axios.get(url).then(r => {
        const users = r.data;
        res.render("index", {
            users: users,
            api_url: REST_API_URL
        });
    }).catch(err => {
        console.log(err);
    });
});

app.engine('html', require('ejs').renderFile);

// Any user route (valid one)
axios.get(REST_API_URL + "users").then(r => {
    const users = r.data;
    for (let user of users) {
        app.get(`/${user}`, (req, res) => {
            res.render("user", {user: user});
        });
    }
}).catch(err => {
    console.log(err);
});

app.get("/test", (req, res) => {
    res.render("test");
})

// Start server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}...`);
});