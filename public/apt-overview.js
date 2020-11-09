
function loadUsers(code) { // load users in aprtment group woth given code

    // back end stuff
    let users = [];

    /*

    users
    [
        { id: 'leon@gmail.com', name: 'leon', color: '' }, 
        { id: 'hannah@gmail.com', percent: 'hannah', color: '' }, 
        { id: 'bryce@gmail.com', percent: 'bryce', color: '' }
    ]

    */

    // front end stuff
    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        addUser(user.name);
    }

}

function loadUtilities(code) { // load users in apartment group woth given code

    // back end stuff
    let utilities = [];

    // front end stuff
    for (let i = 0; i < utilities.length; i++) {
        let utility = utilities[i];
        addUtility(i, utility.name, utility.cost, utility.contributions);
    }

    /*

    utility.contributions
    [
        { user: { id: 'leon@gmail.com', name: 'leon', color: '' }, percent: 33 }, 
        { user: { id: 'hannah@gmail.com', percent: 'hannah', color: '' }, percent: 33 }, 
        { user: { id: 'bryce@gmail.com', percent: 'bryce', color: '' }, percent: 34 }
    ]

    */

}

function addUser(user) {
    let container = document.getElementById('aptMatesBox');
    let containerItem = document.createElement('div');
    let icon = document.createElement('i');
    icon.className = 'fa fa-user-circle fa-lg';
    icon.style.color = user.color;
    let nameLabel = document.createElement('label');
    nameLabel.className = 'aptMatesBoxItemLbl';
    nameLabel.innerHTML = user.name;
    nameLabel.style.color = user.color;
    containerItem.appendChild(icon);
    containerItem.appendChild(nameLabel);
    container.appendChild(containerItem);
}

function addUtility(index, name, cost, contributions) {
    let container = document.getElementById('aptUtilitiesBox');
    let column = document.createElement('div');
    column.className = 'col px-3 mr-2';
    let card = document.createElement('div');
    card.className = 'card-block px-4 my-4 utilityCardHeader';
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
    for (contribution in contributions) {
        // add contributing percentages for each user
        let subBar = document.createElement('div');
        subBar.className = 'progress-bar';
        subBar.style.width = contribution.percent;
        subBar.style.color = contribution.user.color;
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