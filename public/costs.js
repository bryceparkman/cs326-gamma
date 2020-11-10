let currentUser = 'Bryce';
let users;

async function moneySpent(name = null){
    const data = await fetch('/rentPayments');
    const json = await data.json();
    let total = 0;
    for(const payment of json){
        if(name === null || payment.name === name){
            total += payment.amount;
        }
    }
    return total;
}

async function rentShare(user){
    const response = await fetch('/rentShare/' + user);
    const json = await response.json();
    return json;
}

async function getRent(){
    const response = await fetch('/rent');
    const json = await response.json();
    return json;
}

async function calculateOwe(){
    const moneyData = await moneySpent(currentUser);
    const share = await rentShare(currentUser);
    const totalRent = await getRent();
    const diff = (totalRent * share / 100) - moneyData;
    if(diff > 0){
        return 'You still owe $' + diff.toFixed(2);
    }
    return 'Great job! You have paid your share of the rent this month.';
}

async function calculatePersonalPercent(){
    const moneyData = await moneySpent(currentUser);
    const share = await rentShare(currentUser);
    const totalRent = await getRent();
    const diff = (totalRent* share / 100) - moneyData;
    if(diff > 0){
        return moneyData / (totalRent * share / 100);
    }
    return 1;
}

async function calculateOverallPercent(user){
    const moneyData = await moneySpent(user);
    const totalRent = await getRent();
    const diff = totalRent - moneyData;
    if(diff > 0){
        return moneyData / totalRent;
    }
    return 1;
}

function htmlToNode(html){ //https://stackoverflow.com/a/35385518
    const template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

async function contributeRent(){
    const paymentsWrapper = document.getElementById('paymentsWrapper');
    if(paymentsWrapper.children[0].id === 'blankPayments'){
        const node = htmlToNode("<div id='payments' class='pre-scrollable'></div>")
        paymentsWrapper.replaceChild(node,paymentsWrapper.children[0])
    }

    const input = document.getElementById('contrinput');
    const moneyData = await moneySpent(currentUser);
    const share = await rentShare(currentUser);
    let rentValue = parseFloat(input.value);
    const totalRent = await getRent();
    if(!isNaN(rentValue) && rentValue >= 0){
        if(moneyData + rentValue > (totalRent * share / 100)){
            rentValue = (totalRent * share / 100) - moneyData;
        }
        await fetch('/addPayment', {
            method: 'POST',
            body: JSON.stringify({
                name: currentUser,
                amount: rentValue
            })
        })
    }

    if(rentValue > 0){
        const payments = document.getElementById('payments');

        const htmlString = '<div class="card mb-3 border-0"><div class="row no-gutters"><div class="col-auto"><img src="https://via.placeholder.com/100/' + users.find(user => user.firstName === currentUser).color + '/FFFFFF" class="img-fluid rounded-circle" alt=""> </div><div class="col"><div class="card-block px-4 my-4"> <p class="card-text mb-0">' + currentUser + ' paid $' + rentValue.toFixed(2) + '</p><p class="card-text percentContributed ' + currentUser.toLowerCase() + 'Color">Contributing ' + ((rentValue / totalRent) * 100).toFixed(2) + '%</p></div></div></div></div>'
    
        const node = htmlToNode(htmlString);
        payments.appendChild(node)
    }
    
    await calculatePage();
}

async function checkPayments(){
    const data = await fetch('/rentPayments');
    const json = await data.json();
    if(json.length > 0){
        const totalRent = await getRent();
        const paymentsWrapper = document.getElementById('paymentsWrapper');
        const node = htmlToNode("<div id='payments' class='pre-scrollable'></div>")
        paymentsWrapper.replaceChild(node,paymentsWrapper.children[0]);
        for(const payment of json){
            const payments = document.getElementById('payments');

            const htmlString = '<div class="card mb-3 border-0"><div class="row no-gutters"><div class="col-auto"><img src="https://via.placeholder.com/100/' + users.find(user => user.firstName === payment.name).color + '/FFFFFF" class="img-fluid rounded-circle" alt=""> </div><div class="col"><div class="card-block px-4 my-4"> <p class="card-text mb-0">' + payment.name + ' paid $' + payment.amount.toFixed(2) + '</p><p class="card-text percentContributed ' + payment.name.toLowerCase() + 'Color">Contributing ' + ((payment.amount / totalRent) * 100).toFixed(2) + '%</p></div></div></div></div>'
        
            const node = htmlToNode(htmlString);
            payments.appendChild(node)
        }
    }
}

async function calculatePage(){
    const total = document.getElementById('money');
    const owe = document.getElementById('amountToOwe');
    const share = document.getElementById('amountShared');

    await checkPayments();

    const moneyData = await moneySpent();
    const shareVal = await rentShare(currentUser);
    const totalRent = await getRent();
    
    total.innerHTML = "<span id='bigMoney'>$" + moneyData.toFixed(2) + "</span>/$" + totalRent.toFixed(2);
    owe.innerHTML = await calculateOwe();
    share.innerHTML = "out of your " + shareVal.toFixed(2) + "% share";

    const personalProgress = document.getElementById('personalProgress');
    personalProgress.classList.add(currentUser.toLowerCase() + 'BgColor');
    personalProgress.style.width = await calculatePersonalPercent() * 100 + '%';
    if(personalProgress.style.width === '100%'){      
        personalProgress.classList.add('progress-bar-striped');
    }
    for(const user of users){
        const moneyDataUser = await moneySpent(user.firstName);
        const shareUser = await rentShare(user.firstName);
        const overallProgress = document.getElementsByClassName('progress' + user.firstName)[0];
        overallProgress.style.width = (await calculateOverallPercent(user.firstName) * 100) + '%';
        if(moneyDataUser >= totalRent * shareUser / 100){      
            overallProgress.classList.add('progress-bar-striped');
        }
    }
}

window.addEventListener('load', async () => {
    const contributeButton = document.getElementById('rentButton');
    contributeButton.addEventListener('click', () => contributeRent());

    const response = await fetch('/profiles');
    users = await response.json();

    calculatePage();
})