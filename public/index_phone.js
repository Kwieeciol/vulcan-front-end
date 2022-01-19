const PING_TIMEOUT = 3000; // 3 seconds
let ws = null;
let interval = null;

function run_ws() {
    let url = window.location.href.split("/");
    let name = url[url.length - 1];
    
    const URL = `wss://vulcan-websocket-api.herokuapp.com/users/${name}`;

    setTimeout(() => {
        ws = new WebSocket(URL);

        interval = setInterval(() => {
            ws.send(JSON.stringify({event: "PING", data: {}}))
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
    }, 700); // start ws connection after 700ms
}

function process_data(data) {
    if (data.event == "GRADES" || data.event == "MONEY") {
        build_table(data.event, data.data);
    } else if (data.event == "TOTAL_MONEY") {
        build_total_money(data.data);
    }
}

function build_total_money(data) {
    let wszystkie_pieniadze = document.getElementById("wszystkie-pieniadze");
    wszystkie_pieniadze.innerHTML = `Wszystkie pieniądze: ${data.total_money} zł`;
}

function build_table(event, data) {
    let name = "grades-table";
    if (event == "MONEY") {
        name = "money-table";
    }
    let table = document.getElementById(name);
    $(`#${name} tr`).remove();

    Object.keys(data).forEach((key) => {
        let value = data[key].join(", ");
        if (event == "MONEY") {
            value = data[key].join("zł, ") + "zł";
        }
        let row = table.insertRow();
        // insert two cells in the row with key and value
        let cell1 = row.insertCell();
        let cell2 = row.insertCell();
        // insert text into the cells
        let text1 = document.createTextNode(key);
        let text2 = document.createTextNode(value);
        // add text to the cells
        cell1.appendChild(text1);
        cell2.appendChild(text2);
        // add the row to the table
        table.appendChild(row);
    });
}
