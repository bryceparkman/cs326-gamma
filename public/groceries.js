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
        {
            name: 'Eggs',
            amount: '1 dozen',
            requestedBy: 'Bryce'
        },
        {
            name: 'Soccer ball cupcakes',
            amount: null,
            requestedBy: 'Leon'
        },
        {
            name: 'Tropicana OJ',
            amount: '1 gallon',
            requestedBy: 'Hannah'
        },
        {
            name: 'Russet Potatoes',
            amount: '1 bag',
            requestedBy: 'Bryce'
        },
    ],
    inventory: [
        {
            name: 'Orange bell pepper',
            amount: '2',
            requestedBy: 'Bryce'
        },
        {
            name: '2% Milk',
            amount: 'Half gallon',
            requestedBy: 'Leon'
        },
        {
            name: 'Ben & Jerry\'s',
            amount: '1 pint',
            requestedBy: 'Hannah'
        },
        {
            name: 'Paprika',
            amount: null,
            requestedBy: 'Bryce'
        },
    ]
}

function htmlToNode(html) { //https://stackoverflow.com/a/35385518
    const template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

function moneySpent() {
    return data.bills[currentUser];
}

function getWidthString() {
    return Math.min(100, 100 * (moneySpent() / budget)) + '%';
}

function addGrocery() {
    const input = document.getElementById('groceryBill');
    const progress = document.getElementById('progressBarMain');
    let billValue = parseFloat(input.value);
    if (!isNaN(billValue) && billValue >= 0) {
        if (moneySpent() + billValue > budget) {
            progress.classList.remove(currentUser.toLowerCase() + 'BgColor');
            progress.style.backgroundColor = '#ff0000';
        }
        data.bills[currentUser] += billValue;
    }
    calculatePage();
}

function editGrocery(element){
    console.log(element)
}

function removeGrocery(element){
    const index = data.groceries.indexOf(element);
    data.groceries.splice(index,1);
    getGroceries();
}

function editInventory(element){
    console.log(element)
}

function removeInventory(element){
    const index = data.inventory.indexOf(element);
    data.inventory.splice(index,1);
    getInventory();
}

function getGroceries(){
    const paymentsWrapper = document.getElementById('paymentsWrapper');
    paymentsWrapper.innerHTML = '';
    let htmlString = '';
    const nodes = []
    for (let i = 0; i < data.groceries.length; i++) {
        if (i % 2 === 0) {
            if (i > 0) {
                htmlString += '</div>';
                nodes.push(htmlString);
                htmlString = '';
            }
            htmlString += "<div class='row mx-1'>";
        }
        htmlString += "<div class='col px-1'><div class='card mb-2'><div class='card-block px-4 my-4'><p class='card-title mb-1'> " + data.groceries[i].name + "</p><p class='card-subtitle text-muted mb-1 fontTwelve'>" + (data.groceries[i].amount !== null ? data.groceries[i].amount : 'Quantity not specified') + "</p><p class='card-subtitle percentContributed " + data.groceries[i].requestedBy.toLowerCase() + "Color'>Requested by " + data.groceries[i].requestedBy + "</p></div><div class='card-footer text-muted'><a href='#_' class='card-link' onclick='editGrocery(data.groceries[" + i + "])'>Edit</a><a href='#_' class='card-link float-right' onclick='removeGrocery(data.groceries[" + i + "])'>Remove</a></div></div></div>";
    }
    htmlString += '</div>';
    nodes.push(htmlString);
    for (node of nodes) {
        paymentsWrapper.appendChild(htmlToNode(node));
    }
}

function getInventory(){
    const paymentsWrapper = document.getElementById('inventoryWrapper');
    paymentsWrapper.innerHTML = '';
    let htmlString = '';
    const nodes = []
    for (let i = 0; i < data.inventory.length; i++) {
        if (i % 2 === 0) {
            if (i > 0) {
                htmlString += '</div>';
                nodes.push(htmlString);
                htmlString = '';
            }
            htmlString += "<div class='row mx-1'>";
        }
        htmlString += "<div class='col px-1'><div class='card mb-2'><div class='card-block px-4 my-4'><p class='card-title mb-1'> " + data.inventory[i].name + "</p><p class='card-subtitle text-muted mb-1 fontTwelve'>" + (data.inventory[i].amount !== null ? data.inventory[i].amount : 'Quantity not specified') + "</p><p class='card-subtitle percentContributed " + data.inventory[i].requestedBy.toLowerCase() + "Color'>Bought by " + data.inventory[i].requestedBy + "</p></div><div class='card-footer text-muted'><a href='#_' class='card-link' onclick='editInventory(data.inventory[" + i + "])'>Edit</a><a href='#_' class='card-link float-right' onclick='removeInventory(data.inventory[" + i + "])'>Remove</a></div></div></div>";
    }
    htmlString += '</div>';
    nodes.push(htmlString);
    for (node of nodes) {
        paymentsWrapper.appendChild(htmlToNode(node));
    }
}

function openModal(type){
    const modal = document.getElementById(type + 'Modal');
    modal.style.display = 'block';
}

function closeModal(type){
    const modal = document.getElementById(type + 'Modal');
    modal.style.display = 'none';
}

function submitModal(type){
    const modal = document.getElementById(type + 'Modal');
    const inputItem = document.getElementById('input' + type + 'Item');
    const inputAmount = document.getElementById('input' + type + 'Amount');
    if(inputItem.value.length > 0){
        console.log(data[type])
        data[type].push({
            name: inputItem.value,
            amount: (inputAmount.value.length > 0 ? inputAmount.value : null),
            requestedBy: currentUser
        });
        modal.style.display = 'none';
        inputItem.value = ''
        inputAmount.value = '';
        getInventory();
    }    
}

function calculatePage() {
    const money = document.getElementById('money');
    money.innerHTML = "<span id='bigMoney'>$" + moneySpent('Bryce').toFixed(2) + "</span>/ $" + budget.toFixed(2);

    const progress = document.getElementById('progressBarMain');
    progress.classList.add(currentUser.toLowerCase() + 'BgColor');
    const width = getWidthString();
    progress.style.width = width;

    getGroceries();
    getInventory();
}

window.addEventListener('load', () => {
    const addBill = document.getElementById('rentButton');
    addBill.addEventListener('click', () => addGrocery());

    calculatePage();
});

window.addEventListener('click', (event) => {
    const modal = document.getElementById('groceryModal');
    if(event.target === modal) {
        modal.style.display = 'none';
    }
})