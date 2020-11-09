
function loadUsers() {

    // back end stuff
    let users = []

    // front end stuff
    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        addUser(user.name);
    }

}

function loadUtilities() {

    // back end stuff
    let utilities = []

    // front end stuff
    for (let i = 0; i < utilities.length; i++) {
        let utility = utilities[i];
        addUtility(i, utility.name, utility.cost, utility.contributingUsers);
    }

}

function addUser(name) {
    let container = document.getElementById('aptMatesBox');
    let containerItem = document.createElement('div');
    let icon = document.createElement('i');
    icon.className = 'fa fa-user-circle fa-lg';
    let nameLabel = document.createElement('label');
    nameLabel.className = 'aptMatesBoxItemLbl';
    nameLabel.innerHTML = name;
    containerItem.appendChild(icon);
    containerItem.appendChild(nameLabel);
    container.appendChild(containerItem);
}

function addUtility(index, name, cost, contributingUsers) {
    let container = document.getElementById('aptUtilitiesBox');
    let column = document.createElement('div');
    column.className = 'col px-3 mr-2';
    let card = document.createElement('div');
    card.className = 'card-block px-4 my-4 utilityCardHeader';
    let utilityContributorsBox = document.createElement('div');
    utilityContributorsBox.className = 'utilityContributorsBox';
    for (user in contributingUsers) {
        // add userLbls
    }
    let utilityInfoLabelsBox = document.createElement('div');
    let utilityLbl = document.createElement('label');
    utilityLbl.className = 'utilityLbl';
    utilityLbl.innerHTML = name;
    let priceLbl = document.createElement('label');
    priceLbl.className = 'priceLbl';
    if (cost > 0) {
        priceLbl.innerHTML = '$' + cost;
    } else {
        priceLbl.innerHTML = '________';
    }
    utilityInfoLabelsBox.appendChild(utilityLbl);
    utilityInfoLabelsBox.appendChild(priceLbl);
    let utilityContributionBar = document.createElement('div');
    utilityContributionBar.className = 'progress contributionPercentageBar';
    for (user in contributingUsers) {
        // add contributing percentages
    }
    card.appendChild(utilityContributorsBox);
    card.appendChild(utilityInfoLabelsBox);
    card.appendChild(utilityContributionBar);
    if (index % 2 == 0) {
        let row = document.createElement('div');
        row.className = 'row mb-3'
        row.appendChild(column);
        container.appendChild(row);
    } else {
        container.appendChild(column);
    }
}

function copyInviteLink() {
    
}