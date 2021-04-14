import {PushSwapApp} from "./PushSwapApp"

let numbersGen = []
let textarea = null

document.getElementById('genButton').onclick = generate

function generate(){
    const numbersDiv = document.getElementById('genNum')
    if (textarea === null)
        textarea = document.createElement("TEXTAREA");
    const numbers = generateArray(document.getElementById('val_from').value, document.getElementById('val_to').value)
    shuffle(numbers)
    numbersGen = numbers
    textarea.value = numbers.toString().replaceAll(',', ' ')
    numbersDiv.appendChild(textarea)
}

document.getElementById('runPushSwap').onclick = runApp
function runApp(){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            runPushSwap(JSON.parse(this.responseText))
        }
    };
    xhttp.open("POST", "/push_swap", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("data=" + textarea.value);
}

function runPushSwap(commands){
    document.getElementById('test').lastChild.remove()
    const app = new PushSwapApp(
        {
            numbers: numbersGen,
            commands: commands
        },
        document.getElementById('test'))
    app.init()
    app.run()
}


function shuffle(a) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

const generateArray = (valueFrom, valueTo) => {
    const arr = []
    for (let i = valueFrom; i <= valueTo; i++) {
        arr.push(i)
    }
    shuffle(arr)
    return arr;
}

const pushSwapData = {
    timeExec: Date.now(),
    commands: ["ra","pb","pb","pb","rb","pb","ra","ra","ra","pb","ra","ra","pb","pb","ra","pb","pb","ra","ra","pb","rra","pa","pa","ra","pa","ra","pa","rra","rra","rra","pa","rr","pa","rra","pa","pa","ra","ra","pa","ra","ra","ra","ra","pa","ra","ra","ra","ra","ra","ra"],
    numbers: [1, 2, 3, 4, 6, 10, 9, 7, 8, 13, 12, 5, 11]
}

pushSwapData.numbers.length

const app = new PushSwapApp(pushSwapData, document.getElementById('test'))
app.init()
app.run()