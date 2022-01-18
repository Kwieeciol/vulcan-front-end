const express = require("express");
const path = require("path");
const axios = require("axios");

// Init app
const app = express();

// Variables
const REST_API_URL = "https://vulcan-websocket-api.herokuapp.com/";
const PORT = process.env.PORT || 3000;

// Load view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine('html', require('ejs').renderFile);

// Load static assets
app.use("/static", express.static(path.join(__dirname, "public")))

// Helper function
function is_on_phone(req) {
    return req.headers["user-agent"].match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i);
}

// Home route
app.get("/", (req, res) => {
    let is_phone = is_on_phone(req);
    let url = REST_API_URL + "users";
    axios.get(url).then(r => {
        const users = r.data;
        let page = "";
        if (is_phone) {
            page = "index_phone.html";
        } else {
            page = "index.html";
        }
        res.render(page, {users: users});
    }).catch(err => {
        console.log(err);
    });
});


// Any user route (valid one)
axios.get(REST_API_URL + "users").then(r => {
    const users = r.data;
    for (let user of users) {
        app.get(`/${user}`, (req, res) => {
            let is_phone = is_on_phone(req);
            let page = "";
            if (is_phone) {
                page = "user_phone";
            } else {
                page = "user";
            }
            res.render(page, {user: user});
        });
    }
}).catch(err => {
    console.log(err);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}...`);
});