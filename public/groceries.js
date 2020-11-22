let currentUser = 'hnoordeen@umass.edu';
let currentElement = null;
let users;

function htmlToNode(html) { //https://stackoverflow.com/a/35385518
    const template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

async function moneySpent() {
    const moneySpent = await fetch('/bill/' + currentUser);
    const json = await moneySpent.json();
    return json;
}

async function addBill(user, amount) {
    await fetch('/addBill', {
        method: 'PUT',
        body: JSON.stringify({
            email: user,
            amount: amount * 100
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

async function getBudget() {
    const userBudget = await fetch('/budget/' + currentUser);
    const json = await userBudget.json();
    return json;
}

async function getWidthString() {
    const moneyCount = await moneySpent();
    const budget = await getBudget();
    return Math.min(100, 100 * (moneyCount / budget)) + '%';
}

async function addGrocery() {
    const moneyCount = await moneySpent();
    const budget = await getBudget();
    const input = document.getElementById('groceryBill');
    const progress = document.getElementById('progressBarMain');
    let billValue = parseFloat(input.value);
    if (!isNaN(billValue) && billValue >= 0) {
        if (moneyCount + billValue > budget) {
            progress.classList.remove(currentUser.replace(/@/,'') + 'BgColor');
            progress.style.backgroundColor = '#ff0000';
            progress.innerHTML = "Over budget"
        }
        await addBill(currentUser, billValue);
    }
    await calculatePage();
}

function editItem(isGrocery, element) {
    const type = (isGrocery ? 'grocery' : 'inventory')
    const modal = document.getElementById(type + 'ModalEdit');
    const inputItem = document.getElementById('input' + type + 'ItemEdit');
    const inputAmount = document.getElementById('input' + type + 'AmountEdit');
    inputItem.value = element.name;
    inputAmount.value = element.amount;
    modal.style.display = 'block';
    currentElement = element;
}

async function removeItem(type, element) {
    const t = (type === 'groceries' ? 'Grocery' : 'Inventory')
    await fetch('/remove' + t + '/' + element.id, {
        method: 'DELETE'
    })
    await getTable(type);
}

async function getTable(type) {
    const data = await fetch('/' + type);
    const json = await data.json();
    const id = (type === 'groceries' ? 'paymentsWrapper' : 'inventoryWrapper');
    const paymentsWrapper = document.getElementById(id);
    paymentsWrapper.innerHTML = '';
    let htmlString = '';
    const nodes = [];
    if(json.length > 0){
        for (let i = 0; i < json.length; i++) {
            if (i % 2 === 0) {
                if (i > 0) {
                    htmlString += '</div>';
                    nodes.push(htmlString);
                    htmlString = '';
                }
                htmlString += "<div class='row mx-1'>";
            }
            let stringify = JSON.stringify(json[i]);
            stringify = stringify.replace('\'', '&apos');
            const res = await fetch('/name/' + json[i].requestedby);
            const firstName = await res.json();
            console.log(json[i].amount)
            htmlString += "<div class='col px-1'><div class='card mb-2'><div class='card-block px-4 my-4'><p class='card-title mb-1'> " + json[i].name + "</p><p class='card-subtitle text-muted mb-1 fontTwelve'>" + (json[i].amount.length > 0 ? json[i].amount : 'Quantity not specified') + "</p><p class='card-subtitle percentContributed " + json[i].requestedby.replace(/@/,'') + "Color'>Requested by " + firstName + "</p></div><div class='card-footer text-muted'><a href='#_' class='card-link' onclick='editItem(" + (type === 'groceries') + "," + stringify +  ")'>Edit</a><a href='#_' class='card-link float-right' onclick='removeItem(\"" + type + "\", " + stringify +  ")'>Remove</a></div></div></div>";
        }
        htmlString += '</div>';
        nodes.push(htmlString);
        for (const node of nodes) {
            paymentsWrapper.appendChild(htmlToNode(node));
        }
        for(const user of users){
            const userColor = users.find(dataUser => dataUser.email === user.email).color;
            const elements = document.getElementsByClassName(user.email.replace(/@/,'') + 'Color');
            for(let i=0;i<elements.length;i++){
                const node = elements.item(i);
                node.style.color = '#' + userColor;
            }
        }
    }
}

function openModal(type, isAdd) {
    const modal = document.getElementById(type + 'Modal' + (isAdd ? '' : 'Edit'));
    modal.style.display = 'block';
}

function closeModal(type, isAdd) {
    const modal = document.getElementById(type + 'Modal' + (isAdd ? '' : 'Edit'));
    modal.style.display = 'none';
}

async function submitModal(type, isAdd) {
    let fetchType = type;
    if(type === 'grocery'){
        fetchType = 'groceries';
    }
    const data = await fetch('/' + fetchType);
    const json = await data.json();
    const modal = document.getElementById(type + 'Modal' + (isAdd ? '' : 'Edit'));
    const inputItem = document.getElementById('input' + type + 'Item' + (isAdd ? '' : 'Edit'));
    const inputAmount = document.getElementById('input' + type + 'Amount' + (isAdd ? '' : 'Edit'));
    if (type === 'grocery') {
        type = 'groceries';
    }
    if (inputItem.value.length > 0) {  
        if (isAdd) {
            const t = (type === 'groceries' ? 'Grocery' : 'Inventory');
            await fetch('/add' + t, {
                method: 'POST',
                body: JSON.stringify({
                    name: inputItem.value,
                    amount: inputAmount.value,
                    requestedBy: currentUser
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
        else {
            const t = (type === 'groceries' ? 'Grocery' : 'Inventory');
            await fetch('/edit' + t, {
                method: 'PUT',
                body: JSON.stringify({
                    id: currentElement.id,
                    name: inputItem.value,
                    amount: inputAmount.value
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    }
    modal.style.display = 'none';
    inputItem.value = ''
    inputAmount.value = '';
    await getTable(type);
}

async function calculatePage() {
    const moneyCount = await moneySpent();
    const budget = await getBudget();
    const money = document.getElementById('money');
    money.innerHTML = "<span id='bigMoney'>$" + moneyCount.toFixed(2) + "</span>/ $" + budget.toFixed(2);

    const progress = document.getElementById('progressBarMain');
    progress.style.backgroundColor = '#' +  users.find(user => user.email === currentUser).color;
    if(moneyCount > budget){
        progress.innerHTML = "Over budget"
    }
    const width = await getWidthString();
    progress.style.width = width;

    await getTable('groceries');
    await getTable('inventory');
}

window.addEventListener('load', async () => {
    const addBill = document.getElementById('rentButton');
    addBill.addEventListener('click', () => addGrocery());

    const response = await fetch('/profiles');
    users = await response.json();

    await calculatePage();
});

window.addEventListener('click', (event) => {
    const modal = document.getElementById('groceryModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
})