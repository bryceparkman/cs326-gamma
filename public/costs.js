const currentUser = 'bparkman@umass.edu';
let users;
let currentMode = 'Rent';

/**
 * Gets either total money spent or individual user money spent for certain cost/utility
 *
 * @param {string} email The email of the user, null by default
*/
async function moneySpent(email = null) {
    const data = await fetch('/payments/' + currentMode);
    const json = await data.json();
    let total = 0;
    for (const payment of json) {
        if (email === null || payment.email === email) {
            total += payment.payment / 100;
        }
    }
    return total;
}

/**
 * Gets percentage share for a user (For example, 4 members in an apartment may pay 25% each)
 * @param {string} email The email of the user
*/
async function shareAmount(email) {
    const response = await fetch('/share/' + email);
    const json = await response.json();
    return json;
}

/**
 * Get cost of rent or utility
*/
async function getCost() {
    const response = await fetch('/cost/' + currentMode);
    const json = await response.json();
    return json;
}

/**
 * Calculate how much a user owes for the currently select cost/utility
*/
async function calculateOwe() {
    const moneyData = await moneySpent(currentUser);
    const share = await shareAmount(currentUser);
    const totalCost = await getCost();
    const diff = (totalCost * share / 100) - moneyData;
    if (parseFloat(diff.toFixed(2)) > 0) {
        return 'You still owe $' + diff.toFixed(2);
    }
    return 'Great job! You have paid your share of the ' + currentMode.toLowerCase() + ' bill this month.';
}

/**
 * Calculates the percentage the current user has paid towards their own expenses
*/
async function calculatePersonalPercent() {
    const moneyData = await moneySpent(currentUser);
    const share = await shareAmount(currentUser);
    const totalCost = await getCost();
    const diff = (totalCost * share / 100) - moneyData;
    if (parseFloat(diff.toFixed(2)) > 0) {
        return moneyData / (totalCost * share / 100);
    }
    return 1;
}

/**
 * Calculates the percentage a certain user has paid towards the apartment's total expenses
 * @param {string} email The email of the user
*/
async function calculateOverallPercent(email) {
    const moneyData = await moneySpent(email);
    const totalCost = await getCost();
    const diff = totalCost - moneyData;
    if (diff > 0) {
        return moneyData / totalCost;
    }
    return 1;
}

/**
 * Converts a string of HTML into a DOM element
 * https://stackoverflow.com/a/35385518
 * @param {string} html The HTML code in string form
*/
function htmlToNode(html) {
    const template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

/**
 * Contributes cost towards specific bill in the apartment
*/
async function contributeCost() {
    const paymentsWrapper = document.getElementById('paymentsWrapper');
    if (paymentsWrapper.children[0].id === 'blankPayments') { //If no payments have been made, replace blank message with empty scrollable div
        const node = htmlToNode("<div id='payments' class='pre-scrollable'></div>");
        paymentsWrapper.replaceChild(node, paymentsWrapper.children[0]);
    }

    const input = document.getElementById('contrinput');
    const moneyData = await moneySpent(currentUser);
    const share = await shareAmount(currentUser);
    let inputValue = parseFloat(input.value);
    const totalCost = await getCost();
    if (!isNaN(inputValue) && inputValue > 0) { //If the user inputs a valid decimal number to the text field, add it
        if (moneyData + inputValue > (totalCost * share / 100)) { //Checks for overshoot, and replaces data with exact amount to meet goal
            inputValue = (totalCost * share / 100) - moneyData;
        }
        await fetch('/addPayment', { //POST payment data to server
            method: 'POST',
            body: JSON.stringify({
                email: currentUser,
                amount: inputValue * 100, //Server stored in cents
                billname: currentMode,
                billtype: currentMode === 'Rent' ? currentMode : 'Utility'
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (inputValue > 0) { //If the payments still contributed something (even after overshoot), add it to the list of payments html
            //Get JSON data
            const data = await fetch('/payments/' + currentMode);
            const json = await data.json();

            //Get HTML node, color, and create class name
            const payments = document.getElementById('payments');
            const userColor = users.find(user => user.email === currentUser).color;
            const className = (currentUser.replace('@', '')).replace('.', '');

            //Get user's first name
            const res = await fetch('/name/' + currentUser);
            const firstName = await res.json();

            //Append data to payments
            const htmlString = '<div class="card mb-3 border-0"><div class="row no-gutters"><div class="col-auto"><img src="https://via.placeholder.com/100/' + userColor + '/FFFFFF" class="img-fluid rounded-circle" alt=""> </div><div class="col"><div class="card-block px-4 my-4"> <p class="card-text mb-0">' + firstName + ' paid $' + inputValue.toFixed(2) + '</p><p class="card-text percentContributed ' + className + 'Color">Contributing ' + ((inputValue / totalCost) * 100).toFixed(2) + '%</p></div></div></div></div>';
            const node = htmlToNode(htmlString);
            payments.appendChild(node);

            //Find payment that was just added and set its color
            const contributed = document.getElementsByClassName('percentContributed').item(json.length - 1);
            contributed.style.color = '#' + userColor;
        }
    }

    //"Redraw" page
    await calculatePage();
}

/**
 * Rewrites payment HTML section with data from server
 */
async function checkPayments() {
    //Get payments
    const data = await fetch('/payments/' + currentMode);
    const json = await data.json();

    const paymentsWrapper = document.getElementById('paymentsWrapper');
    if (json.length > 0) {
        const totalCost = await getCost();
        const node = htmlToNode("<div id='payments' class='pre-scrollable'></div>");
        paymentsWrapper.replaceChild(node, paymentsWrapper.children[0]);

        //For each payment, append to the HTML DOM
        for (let i = 0; i < json.length; i++) {
            const payment = json[i];
            const payments = document.getElementById('payments');
            const userColor = users.find(user => user.email === payment.email).color;
            const className = (payment.email.replace('@', '')).replace('.', '');

            //Append node
            const htmlString = '<div class="card mb-3 border-0"><div class="row no-gutters"><div class="col-auto"><img src="https://via.placeholder.com/100/' + userColor + '/FFFFFF" class="img-fluid rounded-circle" alt=""> </div><div class="col"><div class="card-block px-4 my-4"> <p class="card-text mb-0">' + payment.name + ' paid $' + (payment.payment / 100).toFixed(2) + '</p><p class="card-text percentContributed ' + className + 'Color">Contributing ' + (((payment.payment / 100) / totalCost) * 100).toFixed(2) + '%</p></div></div></div></div>';
            const node = htmlToNode(htmlString);
            payments.appendChild(node);

            //Set color of percent contributed text
            const contributed = document.getElementsByClassName('percentContributed').item(i);
            contributed.style.color = '#' + userColor;
        }
    }
    else {
        //If no payments have been made, then set it to the blank apyments element
        const node = htmlToNode("<div id='blankPayments'><h2>No payments have been made yet</h2></div>");
        paymentsWrapper.replaceChild(node, paymentsWrapper.children[0]);
    }
}

/**
 * Redraws page, updating all progress bars and payments section
 */
async function calculatePage() {
    //Get HTML nodes
    const total = document.getElementById('money');
    const owe = document.getElementById('amountToOwe');
    const share = document.getElementById('amountShared');
    const mainbar = document.getElementById('mainBar');

    //Update payments
    await checkPayments();

    //Get monetary info
    const moneyData = await moneySpent();
    const shareVal = await shareAmount(currentUser);
    const totalCost = await getCost();

    //Update big progress bar text and personal progress bar text
    total.innerHTML = "<span id='bigMoney'>$" + moneyData.toFixed(2) + "</span>/$" + totalCost.toFixed(2);
    owe.innerHTML = await calculateOwe();
    share.innerHTML = "out of your " + shareVal.toFixed(2) + "% share";

    //Update personalProgress width and color
    const personalProgress = document.getElementById('personalProgress');
    personalProgress.classList.remove('progress-bar-striped');
    const personalUserColor = users.find(user => user.email === currentUser).color;
    personalProgress.style.backgroundColor = '#' + personalUserColor;
    personalProgress.style.width = await calculatePersonalPercent() * 100 + '%';
    if (personalProgress.style.width === '100%') {
        personalProgress.classList.add('progress-bar-striped');
    }
    //Check each user in order to update large progress bar at top
    for (const user of users) {
        //Add sub progress bar
        const htmlStringProgress = '<div class="progress-bar progress-bar-animated" id="' + (user.email.replace('@', '')).replace('.', '') + 'BgColor' + '" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="' + totalCost + '"></div>';
        const nodeProgress = htmlToNode(htmlStringProgress);
        mainbar.appendChild(nodeProgress);

        //Update sub progress bars
        const subProgressBar = document.getElementById((user.email.replace('@', '')).replace('.', '') + 'BgColor');
        subProgressBar.classList.remove('progress-bar-striped');
        const userColor = users.find(userVal => userVal.email === user.email).color;
        subProgressBar.style.backgroundColor = '#' + userColor;
        const moneyDataUser = await moneySpent(user.email);
        const shareUser = await shareAmount(user.email);
        subProgressBar.style.width = (await calculateOverallPercent(user.email) * 100) + '%';
        console.log(totalCost * shareUser / 100)
        if (moneyDataUser >= parseFloat((totalCost * shareUser / 100).toFixed(2))) {
            subProgressBar.classList.add('progress-bar-striped');
        }
    }
}

window.addEventListener('load', async () => {
    const contributeButton = document.getElementById('inputButton');
    contributeButton.addEventListener('click', () => contributeCost());

    //Get user data
    const response = await fetch('/profiles');
    users = await response.json();

    //Create dropdown and event listener
    const dropdown = document.getElementById('selectMode');
    dropdown.addEventListener('change', async () => {
        currentMode = dropdown.value;
        await calculatePage();
    });

    //Create initial dropdown option
    const rentElement = document.createElement('option');
    rentElement.innerHTML = 'Rent';
    dropdown.appendChild(rentElement);

    //Populate dropdown options with server data
    const res = await fetch('/aptCosts/0');
    const bills = await res.json();
    for (const bill of bills) {
        const element = document.createElement('option');
        element.innerHTML = bill.billname;
        dropdown.appendChild(element);
    }

    await calculatePage();
})