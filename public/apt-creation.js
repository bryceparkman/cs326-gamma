let currentUser = 'bparkman@umass.edu';
let costs = []

/**
 * adds cost to costs box
 * @param {string} name name of cost
 * @param {number} cost cost per month
 */
function addCost(name, cost) { // if cost = 0, then cost varies month to month
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
    let cost = {
        name: name,
        cost: cost
    };
    costs.push(cost);
}

/**
 * creates apartment with randomly generated id and costs added in costs box
 */
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

    let costsWithRent = [];
    costsWithRent.push(rent);

    for (let i = 0; i < costs.length; i++) {
        let cost = costs[i];
        costsWithRent.push(cost);
    }

    for (let i = 0; i < costsWithRent.length; i++) {
        let item = costsWithRent[i];
        await fetch('/addAptCost', {
            method: 'POST',
            body: JSON.stringify({
                id: id,
                name: item.name,
                cost: item.cost,
                contributors: [currentUser],
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

/**
 * helper function to generate apartment code
 */
async function generateAptCode() {
    let data = await fetch('/allAptCodes');
    let allAptCodes = await data.json();
    let newCode = '_' + Math.random().toString(36).substr(2, 9);
    while (allAptCodes.includes(newCode)) {
        newCode = '_' + Math.random().toString(36).substr(2, 9);
    }
    return newCode
}

/**
 * opens modal editing or adding cost info
 */
function openModal() {
    const modal = document.getElementById('utilityModal');
    modal.style.display = 'block';
}

/**
 * closes modal
 */
function closeModal() {
    const modal = document.getElementById('utilityModal');
    modal.style.display = 'none';
}

/**
 * submits modal, adding to or editing the database appropriately
 */
function submitModal() {
    const modal = document.getElementById('utilityModal');
    const inputName = document.getElementById('inputName');
    const inputCost = document.getElementById('inputCost');
    addCost(inputName.value, inputCost.value)
    modal.style.display = 'none';
    inputName.value = '';
    inputCost.value = '';
}