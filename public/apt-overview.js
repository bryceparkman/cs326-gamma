let users = []
let utilities = []
let currentUser = {
    name: 'bryce',
    email: 'bparkman@umass.edu',
    aptID: '123',
    color: '00ff00'
}
tempID = '123';

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

async function getUsers(id) {
    const data = await fetch('/allUsersInApt/' + id);
    const json = await data.json();
    if (isEmpty(json) === true) {
        return [];
    }
    return [];
}

async function getAptCosts(id) {
    let data = await fetch('/aptCosts/' + id);
    let json = await data.json();
    if (isEmpty(json) === true) {
        return [];
    }
    return json;
}

function loadUsers() { // load users in apartment group with given code
    // front end stuff
    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        addUser(user);
    }
}

function loadAptCosts() { // load users in apartment group with given code
    // front end stuff
    for (let i = 0; i < utilities.length; i++) {
        let utility = utilities[i];
        console.log(utility)
        addUtility(i, utility.billname, utility.cost, utility.contributors);
    }
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

function addUtility(index, name, cost, contributors) {
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
    for (let i = 0; i < contributors.length; i++) {
        let userEmail = contributors[i];
        let subBar = document.createElement('div');
        subBar.className = 'progress-bar';
        subBar.style.width = 100/contributors.length;
        let user = users.find(user => user.email === userEmail);
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
    footer.appendChild(editBtn);
    if (index !== 0) {
        let removeBtn = document.createElement('a');
        removeBtn.href = '#';
        removeBtn.className = 'card-link aptSecondaryColor float-right';
        removeBtn.innerHTML = 'remove';
        removeBtn.addEventListener('click', function() { removeUtility(index); });
        footer.appendChild(removeBtn);
    }
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
            id: tempID,
            name: utility.billname,
        })
    })
    loadAptCosts();
}

function copyApartmentCode() {
    return tempID;
}

function openModal(isAdd, index) {
    const modal = document.getElementById('utilityModal' + (isAdd ? '' : 'Edit'));
    // add contributing percentage fields for the amount of users in apt
    if (isAdd === false) {
        let content = document.getElementById('utilityModalEditContent');
        content.removeChild(content.lastChild);
        content.removeChild(content.lastChild);
        let itemLbl = document.getElementById('itemLbl');
        itemLbl.innerHTML = 'edit ' + utilities[index].billname;
        let inputCost = document.getElementById('inputCostEdit');
        inputCost.value = utilities[index].cost;
        let utility = utilities[index];
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

            // if id is in utility.contributors, add check mark next to name
            let utility = utilities[index];
            console.log(utility)
            if (utility.contributors.includes(users[i].email)) {
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
    const inputCost = document.getElementById('inputCost' + (isAdd ? '' : 'Edit'));

    if (inputCost.value.length > 0 && typeof(inputCost.value === 'number')) {  
        if (isAdd) {
            if (inputName.value.length > 0) {
                const inputName = document.getElementById('inputName' + (isAdd ? '' : 'Edit'));
                let utility = { 
                    name: inputName.value, 
                    cost: parseInt(inputCost.value), 
                    contributors: []
                };
                
                for (let i = 0; i < users.length; i++) {
                    let user = users[i];
                    utility.contributors.push(user.email);
                }
                utilities.push(utility);
                addUtility(utilities.length-1, utility.billname, utility.cost, utility.contributors);

                await fetch('/addAptCost', {
                    method: 'POST',
                    body: JSON.stringify({
                        id: tempID,
                        name: utility.billname,
                        cost: utility.cost,
                        contributors: utility.contributors,
                    })
                })
            }
        } else {

            let utility = utilities[index];
            utility.cost = parseInt(inputCost.value);
            let oldContributors = utility.contributors;
            let contributorsAdded = [];
            let contributorsDropped = [];
            utility.contributors = [];
            for (let i = 0; i < users.length; i++) {
                let user = users[i];
                let input = document.getElementById('contributer' + i);
                if (input.checked === true) {
                    utility.contributors.push(user.email);
                }
                if (input.checked === true && !oldContributors.includes(user.email)) {
                    contributorsAdded.push(user.email);
                } else if (input.checked === false && oldContributors.includes(user.email)) {
                    contributorsDropped.push(user.email);
                }
            }

            await fetch('/editAptCost', {
                method: 'PUT',
                body: JSON.stringify({
                    id: tempID,
                    name: utility.billname,
                    cost: utility.cost,
                    contributors: utility.contributors,
                    contributorsAdded: contributorsAdded,
                    contributorsDropped: contributorsDropped
                })
            });

        }
    }
    modal.style.display = 'none';
    inputName.value = '';
    inputCost.value = '';
}

window.addEventListener('load', async () => {
    //users = await getUsers(tempID);
    users = [currentUser];
    utilities = await getAptCosts(tempID);
    //utilities = [];
    loadUsers();
    loadAptCosts();
});