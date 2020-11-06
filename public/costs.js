const totalRent = 660;
const currentUser = 'Bryce';
const users = ['Bryce','Hannah','Leon'];
const data = {
    shares: {
        'Bryce': 33.3333,
        'Hannah': 33.3333,
        'Leon': 33.3333
    },
    payments: [
        {
            name: 'Bryce',
            amount: 220
        }
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
    console.log(diff)
    if(diff > 0){
        return moneySpent(user) / totalRent;
    }
    return 1;
}

window.addEventListener('load', () => {
    const total = document.getElementById('money');
    const owe = document.getElementById('amountToOwe');
    const share = document.getElementById('amountShared');
    
    total.innerHTML = "<span id='bigMoney'>$" + moneySpent().toFixed(2) + "</span>/$" + totalRent.toFixed(2);
    owe.innerHTML = calculateOwe();
    share.innerHTML = "out of your " + data.shares[currentUser].toFixed(2) + "% share";

    const personalProgress = document.getElementById('personalProgress');
    personalProgress.style.width = (calculatePersonalPercent() * 100).toFixed(2) + '%';
    if(personalProgress.style.width === '100%'){      
        personalProgress.classList.add('progress-bar-striped')
    }

    for(const user of users){
        const overallProgress = document.getElementsByClassName('progress' + user)[0];
        overallProgress.style.width = (calculateOverallPercent(user) * 100).toFixed(2) + '%';
        console.log(overallProgress.style.width)
        if(overallProgress.style.width === data.shares[user].toFixed(2) + '%'){      
            overallProgress.classList.add('progress-bar-striped')
        }
    }
})