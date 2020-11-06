const totalRent = 660;
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
    shares: {
        'Bryce': 33.3333,
        'Hannah': 33.3333,
        'Leon': 33.3333
    },
    payments: [

    ]
};

function moneySpent(name = null){
    let total = 0;
    for(const payment of data.payments){
        if(name === null || payment.name === name){
            total += payment.amount;
        }
    }
    return total;
}

function calculateOwe(){
    const diff = (totalRent * data.shares[currentUser] / 100) - moneySpent(currentUser);
    if(diff > 0){
        return 'You still owe $' + diff.toFixed(2);
    }
    return 'Great job! You have paid your share of the rent this month.';
}

function calculatePersonalPercent(){
    const diff = (totalRent* data.shares[currentUser] / 100) - moneySpent(currentUser);
    if(diff > 0){
        return moneySpent(currentUser) / (totalRent* data.shares[currentUser] / 100);
    }
    return 1;
}

function calculateOverallPercent(user){
    const diff = totalRent - moneySpent(user);
    if(diff > 0){
        return moneySpent(user) / totalRent;
    }
    return 1;
}

function htmlToNode(html){ //https://stackoverflow.com/a/35385518
    const template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

function contributeRent(){
    const input = document.getElementById('contrinput');
    let rentValue = parseFloat(input.value);
    if(!isNaN(rentValue) && input.value >= 0){
        if(moneySpent(currentUser) + rentValue > (totalRent * data.shares[currentUser] / 100)){
            rentValue = (totalRent * data.shares[currentUser] / 100) - moneySpent(currentUser);
        }
        data.payments.push({
            name: currentUser,
            amount: rentValue
        });
    }

    if(rentValue > 0){
        const payments = document.getElementById('payments');

        const htmlString = '<div class="card mb-3 border-0"><div class="row no-gutters"><div class="col-auto"><img src="https://via.placeholder.com/100/' + data.users.find(user => user.name === currentUser).color + '/FFFFFF" class="img-fluid rounded-circle" alt=""> </div><div class="col"><div class="card-block px-4 my-4"> <p class="card-text mb-0">' + currentUser + ' paid $' + rentValue.toFixed(2) + '</p><p class="card-text percentContributed ' + currentUser.toLowerCase() + 'Color">Contributing ' + ((rentValue / totalRent) * 100).toFixed(2) + '%</p></div></div></div></div>'
    
        const node = htmlToNode(htmlString);
        payments.appendChild(node)
    }
    
    calculatePage();
}

function calculatePage(){
    const total = document.getElementById('money');
    const owe = document.getElementById('amountToOwe');
    const share = document.getElementById('amountShared');
    
    total.innerHTML = "<span id='bigMoney'>$" + moneySpent().toFixed(2) + "</span>/$" + totalRent.toFixed(2);
    owe.innerHTML = calculateOwe();
    share.innerHTML = "out of your " + data.shares[currentUser].toFixed(2) + "% share";

    const personalProgress = document.getElementById('personalProgress');
    personalProgress.classList.add(currentUser.toLowerCase() + 'BgColor');
    personalProgress.style.width = calculatePersonalPercent() * 100 + '%';
    if(personalProgress.style.width === '100%'){      
        personalProgress.classList.add('progress-bar-striped');
    }

    for(const user of data.users){
        const overallProgress = document.getElementsByClassName('progress' + user.name)[0];
        overallProgress.style.width = (calculateOverallPercent(user.name) * 100).toFixed(2) + '%';
        if(overallProgress.style.width === data.shares[user.name].toFixed(2) + '%'){      
            overallProgress.classList.add('progress-bar-striped');
        }
    }
}

window.addEventListener('load', () => {
    const contributeButton = document.getElementById('rentButton');
    contributeButton.addEventListener('click', () => contributeRent());
    console.log(data.payments)
    calculatePage();
})