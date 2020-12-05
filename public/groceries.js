let currentUser;
let currentElement = null;
let users;

/**
 * Converts a string of html into a DOM element
 * https://stackoverflow.com/a/35385518
 * @param {string} html The html code in string form
*/
function htmlToNode(html) {
    const template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

/**
 * Calculates money spent for the current user
 */
async function moneySpent() {
    const moneySpent = await fetch('/bill/');
    const json = await moneySpent.json();
    return json;
}

/**
 * Adds a bill into the database via POST request.
 * @param {email} user The email address of the user
 * @param {number} amount The amount the user has spent on the grocery bill
 */
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

/**
 * Gets the current user's grocery budget
 */
async function getBudget() {
    const userBudget = await fetch('/budget/');
    const json = await userBudget.json();
    return json;
}

/**
 * Gets a string for the width of the budget progress bar
 */
async function getWidthString() {
    const moneyCount = await moneySpent();
    const budget = await getBudget();
    return Math.min(100, 100 * (moneyCount / budget)) + '%';
}

/**
 * Gets input from user, validates it, then adds bill. Updates bar if the user goes over budget.
 */
async function addGrocery() {
    //User data
    const moneyCount = await moneySpent();
    const budget = await getBudget();

    //HTML Nodes
    const input = document.getElementById('groceryBill');
    const progress = document.getElementById('progressBarMain');

    const billValue = parseFloat(input.value);
    //Validate input
    if (!isNaN(billValue) && billValue >= 0) {
        if (moneyCount + billValue > budget) {
            progress.classList.remove((currentUser.replace('@', '')).replace('.', '') + 'BgColor');
            progress.style.backgroundColor = '#ff0000';
            progress.innerHTML = "Over budget";
        }
        await addBill(currentUser, billValue);
    }
    await calculatePage();
}

/**
 * Opens edit grocery modal and prefills values
 * @param {boolean} isGrocery True if grocery, false if inventory
 * @param {object} element JSON object representing element to edit
 */
function editItem(isGrocery, element) {
    const type = (isGrocery ? 'Grocery' : 'Inventory');
    const modal = document.getElementById(type.toLowerCase() + 'ModalEdit');
    const inputItem = document.getElementById('input' + type + 'ItemEdit');
    const inputAmount = document.getElementById('input' + type + 'AmountEdit');
    inputItem.value = element.name;
    inputAmount.value = element.amount;
    modal.style.display = 'block';
    currentElement = element;
}

/**
 * Removes grocery item from database and updates HTML
 * @param {string} type Type of element, ('groceries' or 'inventory') 
 * @param {object} element JSON object representing element to remove
 */
async function removeItem(type, element) {
    const t = (type === 'groceries' ? 'Grocery' : 'Inventory');
    await fetch('/remove' + t + '/' + element.id, {
        method: 'DELETE'
    });
    await getTable(type);
}

/**
 * Gets data from database and fills HTML
 * @param {string} type Type of information getting gathered ('groceries' or 'inventory') 
 */
async function getTable(type) {
    //Gets grocery or inventory data
    const data = await fetch('/' + type);
    const json = await data.json();

    const id = (type === 'groceries' ? 'paymentsWrapper' : 'inventoryWrapper');
    const paymentsWrapper = document.getElementById(id);
    paymentsWrapper.innerHTML = '';
    let htmlString = '';
    const nodes = [];
    if (json.length > 0) {
        //Fills table with data collected
        for (let i = 0; i < json.length; i++) {
            //2 columns
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
            //Creates string for table entry
            htmlString += "<div class='col px-1'><div class='card mb-2'><div class='card-block px-4 my-4'><p class='card-title mb-1'> " + json[i].name + "</p><p class='card-subtitle text-muted mb-1 fontTwelve'>" + (json[i].amount.length > 0 ? json[i].amount : 'Quantity not specified') + "</p><p class='card-subtitle percentContributed " + (json[i].requestedby.replace('@', '')).replace('.', '') + "Color'>Requested by " + firstName + "</p></div><div class='card-footer text-muted'><a href='#_' class='card-link' onclick='editItem(" + (type === 'groceries') + "," + stringify + ")'>Edit</a><a href='#_' class='card-link float-right' onclick='removeItem(\"" + type + "\", " + stringify + ")'>Remove</a></div></div></div>";
        }
        htmlString += '</div>';
        nodes.push(htmlString);
        //Append all collected nodes to html
        for (const node of nodes) {
            paymentsWrapper.appendChild(htmlToNode(node));
        }
        //Sets text to correct user colors
        for (const user of users) {
            const userColor = users.find(dataUser => dataUser.email === user.email).color;
            const elements = document.getElementsByClassName((user.email.replace('@', '')).replace('.', '') + 'Color');
            for (let i = 0; i < elements.length; i++) {
                const node = elements.item(i);
                node.style.color = '#' + userColor;
            }
        }
    }
}

/**
 * Opens modal for adding
 * @param {string} type Type of data ('grocery' or 'inventory')
 */
function openAddModal(type) {
    const modal = document.getElementById(type + 'Modal');
    modal.style.display = 'block';
}

/**
 * Closes modal
 * @param {string} type Type of data ('grocery' or 'inventory')
 * @param {boolean} isAdd True if adding, false if editing
 */
function closeModal(type, isAdd) {
    const modal = document.getElementById(type + 'Modal' + (isAdd ? '' : 'Edit'));
    modal.style.display = 'none';
}

/**
 * Submits modal, adding to or editing the database appropiately
 * @param {string} type Type of data ('grocery' or 'inventory')
 * @param {boolean} isAdd True if adding, false if editing
 */
async function submitModal(type, isAdd) {
    //HTML nodes
    const t = (type === 'groceries' ? 'Grocery' : 'Inventory');
    const modal = document.getElementById(t.toLowerCase() + 'Modal' + (isAdd ? '' : 'Edit'));
    const inputItem = document.getElementById('input' + t + 'Item' + (isAdd ? '' : 'Edit'));
    const inputAmount = document.getElementById('input' + t + 'Amount' + (isAdd ? '' : 'Edit'));
    console.log('input' + t + 'Item' + (isAdd ? '' : 'Edit'));
    if (inputItem.value.length > 0) {
        //If adding to database...
        if (isAdd) {
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
        //Else if editing database...
        else {
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
    //Hide modal and reset values and HTML table
    modal.style.display = 'none';
    inputItem.value = ''
    inputAmount.value = '';
    await getTable(type);
}

/**
 * Rewrites grocery information with data from server
 */
async function calculatePage() {
    //Update large progress text
    const moneyCount = await moneySpent();
    const budget = await getBudget();
    const money = document.getElementById('money');
    money.innerHTML = "<span id='bigMoney'>$" + moneyCount.toFixed(2) + "</span>/ $" + budget.toFixed(2);

    //Update large progress bar width and color
    const progress = document.getElementById('progressBarMain');
    progress.style.backgroundColor = '#' + users.find(user => user.email === currentUser).color;
    if (moneyCount > budget) {
        progress.innerHTML = "Over budget";
    }
    const width = await getWidthString();
    progress.style.width = width;

    //Rewrite information
    await getTable('groceries');
    await getTable('inventory');
}

window.addEventListener('load', async () => {
    //Get button and create event listener
    const addBill = document.getElementById('inputButton');
    addBill.addEventListener('click', () => addGrocery());

    //Get current user
    const currResponse = await fetch('/userInfo');
    const currentUserObject = await currResponse.json();
    currentUser = currentUserObject.email;

    //Get user information
    const response = await fetch('/profiles');
    users = await response.json();

    await calculatePage();
});


window.addEventListener('click', (event) => {
    const groceryModal = document.getElementById('groceryModal');
    if (event.target === groceryModal) {
        groceryModal.style.display = 'none';
    }
    const inventoryModal = document.getElementById('inventoryModal');
    if (event.target === inventoryModal) {
        inventoryModal.style.display = 'none';
    }
})