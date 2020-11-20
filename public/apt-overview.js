let users = []
let utilities = []

function getUsers() {

    users = [
        { id: 'leon@gmail.com', name: 'leon', color: '' }, 
        { id: 'hannah@gmail.com', name: 'hannah', color: '' }, 
        { id: 'bryce@gmail.com', name: 'bryce', color: '' }
    ]

    return users;
}

async function getAptCosts() {
    let data = await fetch('/aptCosts');
    let json = await data.json();
    return json;
}

function loadUsers() { // load users in apartment group with given code

    // front end stuff
    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        addUser(user);
    }

    return users;
}

function loadAptCosts() { // load users in apartment group with given code

    utilities = [
        { name: 'Rent', cost: 3000, contributers: ['leon@gmail.com', 'hannah@gmail.com', 'bryce@gmail.com']},
        { name: 'Gas', cost: 50, contributers: ['leon@gmail.com', 'hannah@gmail.com', 'bryce@gmail.com']}
    ]

    // front end stuff
    for (let i = 0; i < utilities.length; i++) {
        let utility = utilities[i];
        addUtility(i, utility.name, utility.cost, utility.contributers);
    }

    return utilities;
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

function addUtility(index, name, cost, contributers) {
    let container = document.getElementById('aptUtilitiesBox');
    let column = document.createElement('div');
    column.className = 'col px-3 mr-2';
    let card = document.createElement('div');
    card.className = 'card aptPrimaryColorBG mb-2 mt-2';
    let cardBlock = document.createElement('div');
    cardBlock.className = 'card-block px-4 my-4 utilityCardHeader';
    let utilityInfoLabelsBox = document.createElement('div');
    let utilityLbl = document.createElement('label');
    utilityLbl.className = 'utilityLbl';
    utilityLbl.innerHTML = name;
    let priceLbl = document.createElement('label');
    priceLbl.className = 'priceLbl';
    priceLbl.innerHTML = '$' + cost;
    utilityInfoLabelsBox.appendChild(utilityLbl);
    utilityInfoLabelsBox.appendChild(priceLbl);
    let utilityContributionBar = document.createElement('div');
    utilityContributionBar.className = 'progress contributionPercentageBar';
    for (let i = 0; i < contributers.length; i++) {
        let id = contributers[i];
        let subBar = document.createElement('div');
        subBar.className = 'progress-bar';
        subBar.style.width = 100/contributers.length;
        let user = users.find(user => user.id === id);
        subBar.style.color = user.color;
    }
    let footer = document.createElement('div');
    footer.className = 'card-footer text-muted'
    let editBtn = document.createElement('a');
    editBtn.href = '#_';
    editBtn.addEventListener('click', function() { openModal(false, index); });
    let editSpan = document.createElement('span');
    editSpan.className = 'ml-3 aptSecondaryColor';
    let icon = document.createElement('i');
    icon.className = 'fa fa-cogs';
    editSpan.appendChild(icon);
    editBtn.appendChild(editSpan);
    let removeBtn = document.createElement('a');
    removeBtn.href = '#';
    removeBtn.className = 'card-link aptSecondaryColor float-right';
    removeBtn.innerHTML = 'remove';
    removeBtn.addEventListener('click', function() { removeUtility(index); });
    footer.appendChild(editBtn);
    footer.appendChild(removeBtn);
    cardBlock.appendChild(utilityInfoLabelsBox);
    cardBlock.appendChild(utilityContributionBar);
    card.appendChild(cardBlock);
    card.append(footer);
    column.appendChild(card);
    if (index % 2 == 0) {
        let row = document.createElement('div');
        row.className = 'row mb-3';
        row.id = 'utilityRow' + index/2;
        row.appendChild(column);
        container.appendChild(row);
    } else {
        let row = document.getElementById('utilityRow' + (index/2 - 0.5));
        row.appendChild(column);
        container.appendChild(row);
    }
}

async function removeUtility(index) {
    let utility = utilities[index];
    utilities = utilities.splice(index, 1);
    await fetch('/removeAptCost', {
        method: 'DELETE',
        body: JSON.stringify({
            name: utility.name,
            cost: utility.cost,
            contributions: utility.contributions
        })
    })
    loadAptCosts();
}

function copyInviteLink() {
    
}

function openModal(isAdd, index) {
    const modal = document.getElementById('utilityModal' + (isAdd ? '' : 'Edit'));
    // add contributing percentage fields for the amount of users in apt
    if (isAdd === false) {
        let content = document.getElementById('utilityModalEditContent');
        content.removeChild(content.lastChild);
        content.removeChild(content.lastChild);
        let inputName = document.getElementById('inputNameEdit');
        inputName.value = utilities[index].name;
        let inputCost = document.getElementById('inputCostEdit');
        inputCost.value = utilities[index].cost;
        let utility = utilities[index]
        for (let i = 0; i < users.length; i++) {
            let span = document.createElement('span');
            let label = document.createElement('label');
            let input = document.createElement('input');
            span.className = 'inputMb'
            label.innerHTML = users[i].name;
            input.type = 'checkbox';
            input.id = 'contributer' + i;
            span.appendChild(label);
            span.appendChild(input);
            content.appendChild(span);

            // if id is in utility.contributers, add check mark next to name
            if (utility.contributers.includes(users[i].id)) {
                input.checked = true;
            } else {
                input.checked = false;
            }

        }
        let button = document.createElement('button');
        button.innerHTML = 'save';
        button.className = 'btn aptPrimaryColorBG';
        button.addEventListener('click', () => { submitModal(false, index); });
        content.appendChild(button);
    }
    modal.style.display = 'block';
    loadAptCosts();
}

function closeModal(isAdd) {
    const modal = document.getElementById('utilityModal' + (isAdd ? '' : 'Edit'));
    modal.style.display = 'none';
}

async function submitModal(isAdd, index) {
    const modal = document.getElementById('utilityModal' + (isAdd ? '' : 'Edit'));
    const inputName = document.getElementById('inputName' + (isAdd ? '' : 'Edit'));
    const inputCost = document.getElementById('inputCost' + (isAdd ? '' : 'Edit'));

    if (inputName.value.length > 0 && inputCost.value.length > 0) {  
        if (isAdd) {

            let utility = { 
                name: inputName.value, 
                cost: parseInt(inputCost.value), 
                contributers: []
            };
            for (user in users) {
                utility.contributers.push(user.id);
            }
            utilities.push(utility);

            await fetch('/addAptCost', {
                method: 'POST',
                body: JSON.stringify({
                    name: utility.name,
                    cost: utility.cost,
                    contributers: utility.contributers
                })
            })

        } else {

            let utility = utilities[index];
            utility.name = inputName.value;
            utility.cost = parseInt(inputCost.value);
            utility.contributers = [];
            for (let i = 0; i < users.length; i++) {
                let user = users[i];
                let input = document.getElementById('contributer' + i);
                if (input.checked == true) {
                    utility.contributers.push(user.id);
                }
            }

            await fetch('/editAptCost', {
                method: 'PUT',
                body: JSON.stringify({
                    name: utility.name,
                    cost: utility.cost,
                    contributers: utility.contributers
                })
            });

        }
    }
    modal.style.display = 'none';
    inputName.value = '';
    inputCost.value = '';
}

window.addEventListener('load', () => {
    users = getUsers();
    utilities = getAptCosts();
    loadUsers();
    loadAptCosts();
});