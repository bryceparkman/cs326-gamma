let user = 'bparkman@umass.edu';
let utilities = []

function addUtility(name, cost) { // if cost = 0, then cost varies month to month
    let container = document.getElementById('aptCreationBox');
    let containerItem = document.createElement('div');
    containerItem.className = 'aptCreationBoxItem aptPrimaryColorBG';
    let leftLabel = document.createElement('label');
    let rightLabel = document.createElement('label');
    leftLabel.className = 'aptCreationUtilityTypeLbl';
    rightLabel.className = 'aptCreationUtilityCostLbl';
    leftLabel.innerHTML = name;
    rightLabel.innerHTML = '$' + cost;
    containerItem.appendChild(leftLabel);
    containerItem.appendChild(rightLabel);
    container.appendChild(containerItem);
    let utility = {
        name: name,
        cost: cost
    };
    utilities.push(utility);
}

async function createApartment() {

    let rentCost = document.getElementById('rentInput').value;
    let id = await generateAptCode();

    if (rentCost === '') {
        return;
    }

    let rent = {
        name: 'rent',
        cost: rentCost
    }

    let aptCosts = [];
    aptCosts.push(rent);

    for (let i = 0; i < utilities.length; i++) {
        let utility = utilities[i];
        aptCosts.push(utility);
    }

    for (let i = 0; i < aptCosts.length; i++) {
        let item = aptCosts[i];
        await fetch('/addAptCost', {
            method: 'POST',
            body: JSON.stringify({
                id: id,
                name: item.name,
                cost: item.cost,
                contributors: [user],
            })
        })
    }

    await fetch('/createApartment', {
        method: 'POST',
        body: JSON.stringify({
            id: id,
            rent: rentCost,
        })
    })

    window.location.href = "apt-overview.html";

}

async function generateAptCode() {
    let data = await fetch('/allAptCodes');
    let allAptCodes = await data.json();
    let newCode = '_' + Math.random().toString(36).substr(2, 9);
    while (allAptCodes.includes(newCode)) {
        newCode = '_' + Math.random().toString(36).substr(2, 9);
    }
    return newCode
}

function openModal() {
    const modal = document.getElementById('utilityModal');
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('utilityModal');
    modal.style.display = 'none';
}

function submitModal() {
    const modal = document.getElementById('utilityModal');
    const inputName = document.getElementById('inputName');
    const inputCost = document.getElementById('inputCost');
    addUtility(inputName.value, inputCost.value)
    modal.style.display = 'none';
    inputName.value = '';
    inputCost.value = '';
}