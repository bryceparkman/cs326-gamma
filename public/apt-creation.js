
let utilities = []

function addUtility(name, cost) { // if cost = 0, then cost varies month to month
    let container = document.getElementById('aptCreationBox');
    let containerItem = document.createElement('div');
    containerItem.className = 'aptCreationBoxItem';
    let leftLabel = document.createElement('label');
    let rightLabel = document.createElement('label');
    leftLabel.className = 'aptCreationUtilityTypeLbl';
    rightLabel.className = 'aptCreationUtilityCostLbl';
    leftLabel.innerHTML = name;
    if (cost > 0) {
        rightLabel.innerHTML = '$' + cost;
    } else {
        rightLabel.innerHTML = 'month to month';
    }
    container.appendChild(leftLabel);
    container.appendChild(rightLabel);
    container.appendChild(containerItem);
    let utility = {
        name: name,
        cost: cost
    };
    utilities.push(utility);
}

function createApartment() {

    let rentCost = document.getElementById('rentInput').value;

    if (rentCost === null) {
        return;
    }

    let rent = {
        name: 'rent',
        cost: rentCost
    };
    utilities.push(rent)

    // back end stuff

    // send user to apartment overview page

}