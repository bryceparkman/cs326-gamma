let currentUser = 'bparkman@umass.edu';
let users;

async function moneySpent(email = null){
    const data = await fetch('/rentPayments');
    const json = await data.json();
    let total = 0;
    for(const payment of json){
        if(name === null || payment.email === email){
            total += payment.payment;
        }
    }
    return total;
}

async function rentShare(email){
    const response = await fetch('/rentShare/' + email);
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
    if(!isNaN(rentValue) && rentValue > 0){
        if(moneyData + rentValue > (totalRent * share / 100)){
            rentValue = (totalRent * share / 100) - moneyData;
        }
        await fetch('/addPayment', {
            method: 'POST',
            body: JSON.stringify({
                email: currentUser,
                amount: rentValue          
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    if(rentValue > 0){
        const data = await fetch('/rentPayments');
        const json = await data.json();
        const payments = document.getElementById('payments');
        const userColor = users.find(user => user.email === currentUser).color;
        const className = currentUser.replace(/@/,'')
        const htmlString = '<div class="card mb-3 border-0"><div class="row no-gutters"><div class="col-auto"><img src="https://via.placeholder.com/100/' + userColor + '/FFFFFF" class="img-fluid rounded-circle" alt=""> </div><div class="col"><div class="card-block px-4 my-4"> <p class="card-text mb-0">' + currentUser + ' paid $' + rentValue.toFixed(2) + '</p><p class="card-text percentContributed ' + className +  'Color">Contributing ' + ((rentValue / totalRent) * 100).toFixed(2) + '%</p></div></div></div></div>'
        const node = htmlToNode(htmlString);
        await payments.appendChild(node);
        const progressBar = document.getElementsByClassName(className + 'Color').item(json.length - 1);
        progressBar.style.color = '#' + userColor;
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
        for(let i=0;i<json.length;i++){
            const payment = json[i];
            const payments = document.getElementById('payments');
            const userColor = users.find(user => user.email === payment.email).color;
            const className = payment.email.replace(/@/,'')
            const htmlString = '<div class="card mb-3 border-0"><div class="row no-gutters"><div class="col-auto"><img src="https://via.placeholder.com/100/' + userColor + '/FFFFFF" class="img-fluid rounded-circle" alt=""> </div><div class="col"><div class="card-block px-4 my-4"> <p class="card-text mb-0">' + payment.name + ' paid $' + payment.payment.toFixed(2) + '</p><p class="card-text percentContributed ' + className + 'Color">Contributing ' + ((payment.payment / totalRent) * 100).toFixed(2) + '%</p></div></div></div></div>'    
            const node = htmlToNode(htmlString);
            await payments.appendChild(node);
            const progressBar = document.getElementsByClassName(className + 'Color').item(i);
            progressBar.style.color = '#' + userColor;
        }
    }
}

async function calculatePage(){
    const total = document.getElementById('money');
    const owe = document.getElementById('amountToOwe');
    const share = document.getElementById('amountShared');
    const mainbar = document.getElementById('mainBar');

    await checkPayments();

    const moneyData = await moneySpent();
    const shareVal = await rentShare(currentUser);
    const totalRent = await getRent();
    
    total.innerHTML = "<span id='bigMoney'>$" + moneyData.toFixed(2) + "</span>/$" + totalRent.toFixed(2);
    owe.innerHTML = await calculateOwe();
    share.innerHTML = "out of your " + shareVal.toFixed(2) + "% share";

    const personalProgress = document.getElementById('personalProgress');
    const userColor = users.find(user => user.email === currentUser).color;
    personalProgress.style.backgroundColor = '#' +  userColor;
    personalProgress.style.width = await calculatePersonalPercent() * 100 + '%';
    if(personalProgress.style.width === '100%'){      
        personalProgress.classList.add('progress-bar-striped');
    }
    for(const user of users){
        const htmlStringProgress = '<div class="progress-bar progress-bar-animated" id="' + user.firstName + 'BgColor' + '" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="' + totalRent +'"></div>'
        const nodeProgress = htmlToNode(htmlStringProgress);
        mainbar.appendChild(nodeProgress);
        const subProgressBar = document.getElementById(user.firstName + 'BgColor');
        subProgressBar.style.backgroundColor = '#' + userColor;

        const moneyDataUser = await moneySpent(user.email);
        const shareUser = await rentShare(user.email);

        subProgressBar.style.width = (await calculateOverallPercent(user.email) * 100) + '%';
        if(moneyDataUser >= totalRent * shareUser / 100){      
            subProgressBar.classList.add('progress-bar-striped');
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