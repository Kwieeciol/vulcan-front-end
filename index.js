const PING_TIMEOUT = 3500; // 3.5 seconds
let interval = null;

function run_ws() {
    const HOST = "wss://vulcan-websocket-api.herokuapp.com";
    const URL = `${HOST}/ws`;

    const ws = new WebSocket(URL);
    start_ping(ws);

    ws.onmessage = (m) => {
        let raw_data = m.data;
        if (raw_data == "PING" || raw_data == "PONG") {
            console.log("GOT PONG RESPONSE");
        } else {
            let data = JSON.parse(raw_data);
            console.log(data);
            build_grades_table(data);
        }
    }

    ws.onerror = (event) => {
        clearInterval(interval);
    }
}

function start_ping(ws) {
    interval = setInterval(() => {
        ws.send("PING");
    }, PING_TIMEOUT);
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
    let rows = [];
    let arrays = Object.values(data);
    for (let i = 0; i < height; i++) {
        let row = [];
        for (let elem of arrays) {
            row.push(elem[i]);
        }
        rows.push(row);
    }

    for (let values of Object.values(rows)) {
        let row = table.insertRow();
        for (let grade of values) {
            let actual_grade = "";
            if (typeof(grade) != "undefined") {
                try {
                    actual_grade = grade[1];
                } catch (error) {
                    actual_grade = grade; // TIMEOUT
                }
            }
            let cell = row.insertCell();
            let text = document.createTextNode(actual_grade);
            cell.appendChild(text);
        }
    }
}