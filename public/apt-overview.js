let users = []
let costs = []
let currentUser = {};

/**
 * helper function to check if an object is empty
 * @param {Object} obj the obj to be checked for emptiness
 */
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

/**
 * retrieves user info from database with given email
 */
async function getCurrentUser() {
    const data = await fetch('/userInfo');
    const json = await data.json();
    return json;
}

/**
 * retrieves users from database with give apt id
 * @param {string} id represents id of apt group
 */
async function getUsers(id) {
    const data = await fetch('/allUsersInApt/' + id);
    const json = await data.json();
    if (isEmpty(json) === true) {
        return [];
    }
    return json;
}

/**
 * retrieves apt costs from database with give apt id
 * @param {string} id represents id of apt group
 */
async function getAptCosts(id) {
    const data = await fetch('/aptCosts/' + id);
    const json = await data.json();
    if (isEmpty(json) === true) {
        return [];
    }
    json.cost = json.cost / 100;
    return json;
}

/**
 * loads all apartment costs into apt mates grid
 */
function loadUsers() {
    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        addUser(user);
    }
}

/**
 * loads all apartment costs into costs grid
 */
function loadAptCosts() {

    let aptCostsGrid = document.getElementById('aptUtilitiesBox');
    aptCostsGrid.innerHTML = '';

    for (let i = 0; i < costs.length; i++) {
        let cost = costs[i];
        addCost(i, cost.billname, cost.cost, cost.contributors);
    }
}

/**
 * adds user to apt mates box on left
 * @param {Object<string>} user user object representing a user in this apartment group
 * @param {Object<string>} user.name name of user
 * @param {Object<string>} user.color color associated with user
 * @param {Object<string>} user.aptID apt id of apt group and user
 * @param {Object<string>} user.email email of user
 */
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

/**
 * adds cost to costs grid
 * @param {number} index index of modal item
 * @param {string} name name of cost
 * @param {number} cost total monthly cost
 * @param {Array<string>} contributors array of user emails that are contributing to payment
 */
function addCost(index, name, cost, contributors) {
    let container = document.getElementById('aptUtilitiesBox');
    let column = document.createElement('div');
    column.className = 'col px-3 mr-2';
    let card = document.createElement('div');
    card.className = 'card aptPrimaryColorBG mb-2 mt-2';
    let cardBlock = document.createElement('div');
    cardBlock.className = 'card-block px-4 my-4 utilityCardHeader';
    let costInfoLabelsBox = document.createElement('div');
    let costLbl = document.createElement('label');
    costLbl.className = 'utilityLbl';
    costLbl.innerHTML = name;
    let priceLbl = document.createElement('label');
    priceLbl.className = 'priceLbl';
    priceLbl.innerHTML = '$' + cost;
    costInfoLabelsBox.appendChild(costLbl);
    costInfoLabelsBox.appendChild(priceLbl);
    let costContributionBar = document.createElement('div');
    costContributionBar.className = 'progress contributionPercentageBar';
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
        removeBtn.addEventListener('click', function() { removeCost(index); });
        footer.appendChild(removeBtn);
    }
    cardBlock.appendChild(costInfoLabelsBox);
    cardBlock.appendChild(costContributionBar);
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

/**
 * removes cost from costs grid and database
 * @param {number} index index of modal item
 */
async function removeCost(index) {
    let cost = costs[index];
    costs = costs.splice(index, 1);
    await fetch('/removeAptCost', {
        method: 'DELETE',
        body: JSON.stringify({
            id: currentUser.aptid,
            name: cost.billname,
        })
    })
    loadAptCosts();
}

/**
 * copies apt code to users clipboard
 */
function copyApartmentCode() {
    return currentUser.aptid;
}

/**
 * opens modal editing or adding cost info
 * @param {boolean} isAdd true if adding, false if editing
 * @param {number} index index of modal item
 */
function openModal(isAdd, index) {
    const modal = document.getElementById('utilityModal' + (isAdd ? '' : 'Edit'));
    // add contributing percentage fields for the amount of users in apt
    if (isAdd === false) {
        let content = document.getElementById('utilityModalEditContent');
        content.removeChild(content.lastChild);
        content.removeChild(content.lastChild);
        let itemLbl = document.getElementById('itemLbl');
        itemLbl.innerHTML = 'edit ' + costs[index].billname;
        let inputCost = document.getElementById('inputCostEdit');
        inputCost.value = costs[index].cost;
        let cost = costs[index];
        for (let i = 0; i < users.length; i++) {
            let span = document.createElement('span');
            let label = document.createElement('label');
            let input = document.createElement('input');
            span.className = 'inputMb'
            label.innerHTML = users[i].name;
            input.style.marginLeft = '3vh';
            input.type = 'checkbox';
            input.id = 'contributer' + i;
            span.appendChild(label);
            span.appendChild(input);
            content.appendChild(span);

            // if id is in cost.contributors, add check mark next to name
            if (cost.contributors.includes(users[i].email)) {
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

/**
 * closes modal
 * @param {boolean} isAdd true if adding, false if editing
 */
function closeModal(isAdd) {
    const modal = document.getElementById('utilityModal' + (isAdd ? '' : 'Edit'));
    modal.style.display = 'none';
}

/**
 * submits modal, adding to or editing the database appropriately
 * @param {boolean} isAdd true if adding, false if editing
 * @param {number} index index of modal item
 */
async function submitModal(isAdd, index) {
    const modal = document.getElementById('utilityModal' + (isAdd ? '' : 'Edit'));
    const inputCost = document.getElementById('inputCost' + (isAdd ? '' : 'Edit'));
    let costVal = parseInt(inputCost.value);
    if (inputCost.value.length > 0 && Number.isNaN(costVal) === false) {  
        if (isAdd) {
            const inputName = document.getElementById('inputName' + (isAdd ? '' : 'Edit'));
            if (inputName.value.length > 0) {

                let cost = { 
                    name: inputName.value, 
                    cost: costVal, 
                    contributors: []
                };
                
                for (let i = 0; i < users.length; i++) {
                    let user = users[i];
                    cost.contributors.push(user.email);
                }
                costs.push(cost);
                addCost(costs.length-1, cost.billname, cost.cost, cost.contributors);

                await fetch('/addAptCost', {
                    method: 'POST',
                    body: JSON.stringify({
                        id: currentUser.aptid,
                        name: cost.billname,
                        cost: cost.cost * 100,
                        contributors: cost.contributors,
                    })
                })
            } else {
                alert('name must not be left empty');
            }

            modal.style.display = 'none';
            inputName.value = '';
            inputCost.value = '';

        } else {

            let cost = costs[index];
            cost.cost = parseInt(inputCost.value);
            let oldContributors = cost.contributors;
            let contributorsAdded = [];
            let contributorsDropped = [];
            cost.contributors = [];
            for (let i = 0; i < users.length; i++) {
                let user = users[i];
                let input = document.getElementById('contributer' + i);
                if (input.checked === true) {
                    cost.contributors.push(user.email);
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
                    id: currentUser.aptid,
                    name: cost.billname,
                    cost: cost.cost * 100,
                    contributors: cost.contributors,
                    contributorsAdded: contributorsAdded,
                    contributorsDropped: contributorsDropped
                })
            });

            modal.style.display = 'none';
            inputName.value = '';
            inputCost.value = '';

        }
    } else {
        alert('cost must be a number');
    }
    
}

window.addEventListener('load', async () => {
    currentUser = await getCurrentUser();
    users = await getUsers(currentUser.aptid);
    costs = await getAptCosts(currentUser.aptid);
    loadUsers();
    loadAptCosts();
});