const PING_TIMEOUT = 3000; // 3 seconds
let ws = null;
let interval = null;

window.onbeforeunload = () => {
    ws.send(JSON.stringify({event: "CLOSE", data: {}}));
}

function run_ws() {
    let url = window.location.href.split("/");
    let name = url[url.length - 1];
    
    const URL = `wss://vulcan-websocket-api.herokuapp.com/users/${name}`;

    console.log("Starting websocket in 700ms...");
    setTimeout(() => {
        console.log("Starting websocket...");

        ws = new WebSocket(URL);

        interval = setInterval(() => {
            ws.send(JSON.stringify({event: "PING", data: {}}));
        }, PING_TIMEOUT);

        ws.onmessage = (message) => {
            let raw_data = message.data;
            let data = JSON.parse(raw_data);
            console.log(data);
            process_data(data);
        }
    
        ws.onerror = (event) => {
            clearInterval(interval);
        }

        console.log("Successfully started websockets.");
    }, 700); // start the websocket connections after 700ms of loading the page
}

function on_enter(element) {
    if (event.key == "Enter") {
        filter_date();
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
    let data = {event: "FILTER_DATE", data: {"after": date}};
    ws.send(JSON.stringify(data));
}

function reset_date() {
    document.getElementById("filter-date").value = "";
    let data = {event: "RESET_FILTER_DATE", data: {}}
    ws.send(JSON.stringify(data));
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
            } else {
                grade = grade + " zł";
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