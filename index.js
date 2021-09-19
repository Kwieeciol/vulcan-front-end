const PING_TIMEOUT = 3000; // 3 seconds
let websockets = [];
let intervals = [];

window.onbeforeunload = () => {
    for (let ws of websockets) {
        ws.send(JSON.stringify({event: "CLOSE"}));
    }
}

function run_ws(name) {
    const URL = "wss://vulcan-websocket-api.herokuapp.com";
    let endpoints = [`/${name}/oceny`, `/${name}/pieniadze`, `/${name}/wszystkie-pieniadze`];

    console.log("Starting websockets in 700ms...");
    setTimeout(() => {
        console.log("Starting websockets...");
        for (let endpoint of endpoints) {
            let ws = new WebSocket(`${URL}${endpoint}`);
            websockets.push(ws);
        }

        for (let ws of websockets) {
            start_ping(ws);
        }

        for (let ws of websockets) {
            setup_websocket(ws);
        }
        console.log("Successfully started websockets.");
    }, 700); // start the websocket connections after 700ms of loading the page
}

function start_ping(ws) {
    let interval = setInterval(() => {
        ws.send(JSON.stringify({event: "PING"}));
    }, PING_TIMEOUT);
    intervals.push(interval);
}

function setup_websocket(ws) {
    ws.onmessage = (message) => {
        let raw_data = message.data;
        let data = JSON.parse(raw_data);
        console.log(data);
        process_data(data);
    }

    ws.onerror = (event) => {
        for (let interval of intervals) {
            clearInterval(interval);
        }
    }
}

function process_data(payload) {
    if (payload.event == "MONEY") {
        build_money_table(payload.data);
    } else if (payload.event == "GRADES") {
        build_grades_table(payload.data);
    } else if (payload.event == "TOTAL_MONEY") {
        build_total_money(payload.data);
    } else if (payload.event == "READY") {
        setTimeout(() => {
            $(".loader-wrapper").fadeOut("slow");
        }, 500)
    }
}

function filter_date() {
    let date = document.getElementById("filter-date").value;
    let data = {event: "FILTER_DATE", data: date}
    for (let ws of websockets) {
        ws.send(JSON.stringify(data));
    }
}

function reset_date() {
    document.getElementById("filter-date").value = "";
    let data = {event: "RESET_FILTER_DATE"}
    for (let ws of websockets) {
        ws.send(JSON.stringify(data));
    }
}

function build_total_money(data) {
    let value = data["total_money"];
    document.getElementById("total-money-pln").innerHTML = value + " zł";
}

function build_money_table(data) {
    $("#money-table tr").remove(); // remove all rows from table    

    let height = 0;
    // Calculate no. of rows
    for (let value of Object.values(data)) {
        if (value.length > height) {
            height = value.length;
        }
    }

    let table = document.getElementById("money-table");

    // Create head
    let thead = table.tHead;
    let trow = thead.insertRow();
    for (let subject of Object.keys(data)) {
        let th = document.createElement("th");
        let text = document.createTextNode(subject);
        th.appendChild(text);
        trow.appendChild(th);
    }

    // Create body
    let raw_rows = [];
    let arrays = Object.values(data);
    for (let i = 0; i < height; i++) {
        let row = [];
        for (let elem of arrays) {
            row.push(elem[i]);
        }
        raw_rows.push(row);
    }

    for (let values of Object.values(raw_rows)) {
        let row = table.insertRow();
        for (let grade of values) {
            if (grade == null) {
                grade = "";
            }

            let cell = row.insertCell();
            let text = document.createTextNode(grade);
            cell.appendChild(text);
        }
    }
}

function build_grades_table(data) {
    $("#grades-table tr").remove(); // remove all rows from table    

    let height = 0;
    // Calculate no. of rows
    for (let value of Object.values(data)) {
        if (value.length > height) {
            height = value.length;
        }
    }

    let table = document.getElementById("grades-table");

    // Create head
    let thead = table.tHead;
    let trow = thead.insertRow();
    for (let subject of Object.keys(data)) {
        let th = document.createElement("th");
        let text = document.createTextNode(subject);
        th.appendChild(text);
        trow.appendChild(th);
    }
    // Create body
    let raw_rows = [];
    let arrays = Object.values(data);
    for (let i = 0; i < height; i++) {
        let row = [];
        for (let elem of arrays) {
            row.push(elem[i]);
        }
        raw_rows.push(row);
    }

    for (let values of Object.values(raw_rows)) {
        let row = table.insertRow();
        for (let grade of values) {
            if (grade == null) {
                grade = "";
            }

            let cell = row.insertCell();
            let text = document.createTextNode(grade);
            cell.appendChild(text);
        }
    }
}