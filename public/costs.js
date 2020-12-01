let currentUser = 'bparkman@umass.edu';
let users;
let currentMode = 'Rent';

async function moneySpent(email = null){
    const data = await fetch('/payments/' + currentMode);
    const json = await data.json();
    let total = 0;
    for(const payment of json){
        if(email === null || payment.email === email){
            total += payment.payment / 100;
        }
    }
    return total;
}

async function shareAmount(email){
    const response = await fetch('/share/' + email);
    const json = await response.json();
    return json;
}

async function getCost(){
    const response = await fetch('/cost/' + currentMode);
    const json = await response.json();
    return json;
}

async function calculateOwe(){
    const moneyData = await moneySpent(currentUser);
    const share = await shareAmount(currentUser);
    const totalCost = await getCost();
    const diff = (totalCost * share / 100) - moneyData;
    if(parseFloat(diff.toFixed(2)) > 0){
        return 'You still owe $' + diff.toFixed(2);
    }
    return 'Great job! You have paid your share of the ' + currentMode.toLowerCase()  + ' bill this month.';
}

async function calculatePersonalPercent(){
    const moneyData = await moneySpent(currentUser);
    const share = await shareAmount(currentUser);
    const totalCost = await getCost();
    const diff = (totalCost * share / 100) - moneyData;
    if(parseFloat(diff.toFixed(2)) > 0){
        return moneyData / (totalCost * share / 100);
    }
    return 1;
}

async function calculateOverallPercent(user){
    const moneyData = await moneySpent(user);
    const totalCost = await getCost();
    const diff = totalCost - moneyData;
    if(diff > 0){
        return moneyData / totalCost;
    }
    return 1;
}

function htmlToNode(html){ //https://stackoverflow.com/a/35385518
    const template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

async function contributeCost(){
    const paymentsWrapper = document.getElementById('paymentsWrapper');
    if(paymentsWrapper.children[0].id === 'blankPayments'){
        const node = htmlToNode("<div id='payments' class='pre-scrollable'></div>")
        paymentsWrapper.replaceChild(node,paymentsWrapper.children[0])
    }

    const input = document.getElementById('contrinput');
    const moneyData = await moneySpent(currentUser);
    const share = await shareAmount(currentUser);
    let inputValue = parseFloat(input.value);
    const totalCost = await getCost();
    if(!isNaN(inputValue) && inputValue > 0){
        if(moneyData + inputValue > (totalCost * share / 100)){
            inputValue = (totalCost * share / 100) - moneyData;
        }
        await fetch('/addPayment', {
            method: 'POST',
            body: JSON.stringify({
                email: currentUser,
                amount: inputValue * 100,
                billname: currentMode,
                billtype: currentMode
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    if(inputValue > 0){
        const data = await fetch('/payments/' + currentMode);
        const json = await data.json();
        const payments = document.getElementById('payments');
        const userColor = users.find(user => user.email === currentUser).color;
        const className = (currentUser.replace('@','')).replace('.','');
        const res = await fetch('/name/' + currentUser);
        const firstName = await res.json();
        const htmlString = '<div class="card mb-3 border-0"><div class="row no-gutters"><div class="col-auto"><img src="https://via.placeholder.com/100/' + userColor + '/FFFFFF" class="img-fluid rounded-circle" alt=""> </div><div class="col"><div class="card-block px-4 my-4"> <p class="card-text mb-0">' + firstName + ' paid $' + inputValue.toFixed(2) + '</p><p class="card-text percentContributed ' + className +  'Color">Contributing ' + ((inputValue / totalCost) * 100).toFixed(2) + '%</p></div></div></div></div>'
        const node = htmlToNode(htmlString);
        await payments.appendChild(node);
        const progressBar = document.getElementsByClassName('percentContributed').item(json.length - 1);
        progressBar.style.color = '#' + userColor;
    }
    
    await calculatePage();
}

async function checkPayments(){
    const data = await fetch('/payments/' + currentMode);
    const json = await data.json();
    const paymentsWrapper = document.getElementById('paymentsWrapper');
    if(json.length > 0){
        const totalCost = await getCost();     
        const node = htmlToNode("<div id='payments' class='pre-scrollable'></div>");
        paymentsWrapper.replaceChild(node, paymentsWrapper.children[0]);
        for(let i=0;i<json.length;i++){
            const payment = json[i];
            const payments = document.getElementById('payments');
            const userColor = users.find(user => user.email === payment.email).color;
            const className = (payment.email.replace('@','')).replace('.','')
            const htmlString = '<div class="card mb-3 border-0"><div class="row no-gutters"><div class="col-auto"><img src="https://via.placeholder.com/100/' + userColor + '/FFFFFF" class="img-fluid rounded-circle" alt=""> </div><div class="col"><div class="card-block px-4 my-4"> <p class="card-text mb-0">' + payment.name + ' paid $' + (payment.payment / 100).toFixed(2) + '</p><p class="card-text percentContributed ' + className + 'Color">Contributing ' + (((payment.payment / 100) / totalCost) * 100).toFixed(2) + '%</p></div></div></div></div>'    
            const node = htmlToNode(htmlString);
            await payments.appendChild(node);
            const percentContributed = document.getElementsByClassName('percentContributed').item(i);
            percentContributed.style.color = '#' + userColor;
        }
    }
    else {
        const node = htmlToNode("<div id='blankPayments'><h2>No payments have been made yet</h2></div>");
        paymentsWrapper.replaceChild(node, paymentsWrapper.children[0]);
    }
}

async function calculatePage(){
    const total = document.getElementById('money');
    const owe = document.getElementById('amountToOwe');
    const share = document.getElementById('amountShared');
    const mainbar = document.getElementById('mainBar');

    await checkPayments();

    const moneyData = await moneySpent();
    const shareVal = await shareAmount(currentUser);
    const totalCost = await getCost();

    total.innerHTML = "<span id='bigMoney'>$" + moneyData.toFixed(2) + "</span>/$" + totalCost.toFixed(2);
    owe.innerHTML = await calculateOwe();
    share.innerHTML = "out of your " + shareVal.toFixed(2) + "% share";

    const personalProgress = document.getElementById('personalProgress');
    personalProgress.classList.remove('progress-bar-striped');
    const personalUserColor = users.find(user => user.email === currentUser).color;
    personalProgress.style.backgroundColor = '#' +  personalUserColor;
    personalProgress.style.width = await calculatePersonalPercent() * 100 + '%';
    if(personalProgress.style.width === '100%'){      
        personalProgress.classList.add('progress-bar-striped');
    }
    for(const user of users){
        const htmlStringProgress = '<div class="progress-bar progress-bar-animated" id="' + (user.email.replace('@','')).replace('.','') + 'BgColor' + '" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="' + totalCost +'"></div>'
        const nodeProgress = htmlToNode(htmlStringProgress);
        mainbar.appendChild(nodeProgress);
        const subProgressBar = document.getElementById((user.email.replace('@','')).replace('.','') + 'BgColor');
        subProgressBar.classList.remove('progress-bar-striped');
        const userColor = users.find(userVal => userVal.email === user.email).color;
        subProgressBar.style.backgroundColor = '#' + userColor;

        const moneyDataUser = await moneySpent(user.email);
        const shareUser = await shareAmount(user.email);
        subProgressBar.style.width = (await calculateOverallPercent(user.email) * 100) + '%';
        console.log(totalCost * shareUser / 100)
        if(moneyDataUser >= parseFloat((totalCost * shareUser / 100).toFixed(2))){      
            subProgressBar.classList.add('progress-bar-striped');
        }
    }
}

window.addEventListener('load', async () => {
    const contributeButton = document.getElementById('inputButton');
    contributeButton.addEventListener('click', () => contributeCost());

    const response = await fetch('/profiles');
    users = await response.json();

    const dropdown = document.getElementById('selectMode');

    dropdown.addEventListener('change', () => {
        currentMode = dropdown.value;
        calculatePage();
    });

    const rentElement = document.createElement('option');
    rentElement.innerHTML = 'Rent';
    dropdown.appendChild(rentElement);
    const res = await fetch('/aptCosts/0');
    const bills = await res.json();
    for(const bill of bills){
        const element = document.createElement('option');
        element.innerHTML = bill.billname;
        dropdown.appendChild(element);
    }

    calculatePage();
})