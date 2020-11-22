
let utilities = []
let user = { id: 'bryce@gmail.com', name: 'bryce', color: '' }

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

    if (rentCost === '') {
        return;
    }

    utilities.push(rent)

    for (let i = 0; i < utilities.length; i++) {
        let utility = utilities[i];
        await fetch('/addAptCost', {
            method: 'POST',
            body: JSON.stringify({
                name: utility.name,
                cost: utility.cost,
                contributors: []
            })
        })
    }

    let id = generateAptCode();

    await fetch('/createApartment', {
        method: 'POST',
        body: JSON.stringify({
            id: id,
            rent: rentCost,
        })
    })

    window.location.href = "apt-creation.html";

}

async function generateAptCode() {
    let data = await fetch('/allAptCodes/' + id);
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
    inputName.value = ''
    inputCost.value = '';
}