const budget = 200;
let currentUser = 'Bryce';
const data = {
    users: [
        {
            name: 'Bryce',
            color: '9400D3'
        },
        {
            name: 'Hannah',
            color: 'daa520'
        },
        {
            name: 'Leon',
            color: '20b2aa'
        }
    ],
    bills: {
        'Bryce': 100
    },
    groceries: [

    ],
    inventory: [

    ]
}

function htmlToNode(html){ //https://stackoverflow.com/a/35385518
    const template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

function moneySpent(){
    return data.bills[currentUser];
}

function getWidthString(){
    return Math.min(100,100 * (moneySpent() / budget)) + '%';
}

function addGrocery(){
    const input = document.getElementById('groceryBill');
    const progress = document.getElementById('progressBarMain');
    let billValue = parseFloat(input.value);
    if(!isNaN(billValue) && billValue >= 0){
        if(moneySpent() + billValue > budget){
            progress.classList.remove(currentUser.toLowerCase() + 'BgColor');
            progress.style.backgroundColor = '#ff0000';
        }
        data.bills[currentUser] += billValue;
    }  
    calculatePage();
}

function calculatePage(){
    const money = document.getElementById('money');
    money.innerHTML = "<span id='bigMoney'>$" + moneySpent('Bryce').toFixed(2) + "</span>/ $" + budget.toFixed(2);

    const progress = document.getElementById('progressBarMain');
    progress.classList.add(currentUser.toLowerCase() + 'BgColor');
    const width = getWidthString();
    console.log(width)
    progress.style.width = width;
}

window.addEventListener('load', () => {
    const addBill = document.getElementById('rentButton');
    addBill.addEventListener('click', () => addGrocery());

    calculatePage();
});