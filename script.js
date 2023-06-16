const playerContainer = document.getElementById('all-players-container');
const newPlayerFormContainer = document.getElementById('new-player-form');
const teamPageContainer = document.getElementById('teamsContainer');
const playersPageContainer = document.getElementById('playersContainer');
const tButton = document.getElementById("tButton");
const pButton = document.getElementById("pButton");
// Add your cohort name to the cohortName variable below, replacing the 'COHORT-NAME' placeholder
const cohortName = '2302-acc-et-web-pt-a';
// Use the APIURL variable for fetch requests
const APIURL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}/`;
const APITEAMS = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}/teams`;

/**
 * It fetches all players from the API and returns them
 * @returns An array of objects.
 */
const fetchAllPlayers = async () => {
    try {
        const response = await fetch(
            `${APIURL}players`
          );
          const result = await response.json();
          console.log(result);
          return result.data.players;
    } catch (error) {
        console.error('Uh oh, trouble fetching players!', error);
    }
};

const fetchSinglePlayer = async (playerId) => {
    try {
        const response = await fetch(
            `${APIURL}players/${playerId}`
          );
          const result = await response.json();
          console.log(result);  
          return result.data.player;   
    } catch (error) {
        console.error(`Oh no, trouble fetching player #${playerId}!`, error);
    }
};

const addNewPlayer = async (puppy) => {
    try {
        const response= await fetch(`${APIURL}players`,{
            method: 'POST',
            headers :{
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(puppy),
        } );
        const player = await response.json();
        console.log(player);
        fetchAllPlayers();
    } catch (error) {
        console.error('Oops, something went wrong with adding that player!', error);
    }
};

const removePlayer = async (playerId) => {
    try {
        const response = await fetch(`${APIURL}players/${playerId}`,{ 
            method: 'DELETE'
        });
        const players = await response.json();
        fetchAllPlayers();
        window.location.reload();
    } catch (error) {
        console.error(
            `Whoops, trouble removing player #${playerId} from the roster!`,
            error
        );
    }
};

/**
 * It takes an array of player objects, loops through them, and creates a string of HTML for each
 * player, then adds that string to a larger string of HTML that represents all the players. 
 * 
 * Then it takes that larger string of HTML and adds it to the DOM. 
 * 
 * It also adds event listeners to the buttons in each player card. 
 * 
 * The event listeners are for the "See details" and "Remove from roster" buttons. 
 * 
 * The "See details" button calls the `fetchSinglePlayer` function, which makes a fetch request to the
 * API to get the details for a single player. 
 * 
 * The "Remove from roster" button calls the `removePlayer` function, which makes a fetch request to
 * the API to remove a player from the roster. 
 * 
 * The `fetchSinglePlayer` and `removePlayer` functions are defined in the
 * @param playerList - an array of player objects
 * @returns the playerContainerHTML variable.
 */
const renderAllPlayers = async (playerList) => {
    try {
        playerContainer.innerHTML = '';
        playerList.forEach((player) => {
            const puppyElement = document.createElement('div');
            puppyElement.classList.add('player');
            puppyElement.innerHTML = `
                <h1>${player.name}<h1>
                <img src="${player.imageUrl}" width="500px"><br>
                <button class="details-button" data-id="${player.id}">See Details</button>
                <button class="remove-button" data-id="${player.id}">Remove Puppy</button>
            `;
            playerContainer.appendChild(puppyElement);

            const detailsButton = puppyElement.querySelector('.details-button');
            detailsButton.addEventListener('click', async (event) => {
                event.preventDefault();
                renderSinglePlayerById(player.id, puppyElement, detailsButton);
                detailsButton.disabled = true;
            });
          
            const deleteButton = puppyElement.querySelector('.remove-button');
            deleteButton.addEventListener('click', async (event) => {
                event.preventDefault();
                removePlayer(player.id);
            });   
    
        });
       
    } catch (error) {
        console.error('Uh oh, trouble rendering players!', error);
    }
};

const renderSinglePlayerById = async (playerId, puppyElement, detailsButton) => {
    try {
        const player = await fetchSinglePlayer(playerId);
        let teamDetailsTemplate ='';
        if (player.team) {
            teamDetailsTemplate = `
            <div>
                <h3>Team Details:</h3>
                <p>Team Name: ${player.team.name}</p>
                <p>Team ID: ${player.team.id}</p>
                <h4>Team Members: </h4>
                ${player.team.players
                    .map(
                        (players) => `
                        <ul>
                            <li>${players.name} -- ${players.status}</li>
                        </ul>`
                    )
                    .join('')}
            </div>`
        };

        const puppyDetailsElement = document.createElement('div');
        puppyDetailsElement.classList.add('puppy-details');
        puppyDetailsElement.innerHTML = `
            <h2>Details:</h2>
            <p>Breed: ${player.breed}<p>
            <p>Status: ${player.status}<p>
            <p>Puppy ID: ${player.id}<p>
            ${teamDetailsTemplate}
            <button class="close-button">Close</button>`;

        puppyElement.appendChild(puppyDetailsElement);

        const closeButton = puppyDetailsElement.querySelector('.close-button');
        closeButton.addEventListener('click', () => {
            puppyDetailsElement.remove();
            detailsButton.disabled = false;
    });
    } catch (error) {
        console.error('trouble rendering single player', error);
    }
}

/**
 * It renders a form to the DOM, and when the form is submitted, it adds a new player to the database,
 * fetches all players from the database, and renders them to the DOM.
 */
const renderNewPlayerForm = () => {
    try {
        let formHtml = `
            <form>
            <h3>Create your own puppy players!</h3>
                <label for ="name">Name</label>
                <input type="text" id="name" placeholder="Name">
                <br>
                <label for="teamId">Team ID</label>
                <input type="text" id="teamId" name="teamId" placeholder="Team ID">
                <br>
                <label for="status">Status</label>
                <select name="status">
                    <option value="bench">Bench</option>
                    <option value="field">Field</option>
                </select>
                
                <br>
                <label for="image_url">Image URL</label>
                <input type="text" id="imageUrl" name="imageUrl" placeholder="Image URL">
                <br>
                <label for="breed">Breed</label>
                <input type="text" id="breed" name="breed" placeholder="Breed">
                <br>
                <button type="submit" class="createButton">Create</button>
            </form>
    `;
    newPlayerFormContainer.innerHTML = formHtml;

    let form = newPlayerFormContainer.querySelector('form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        let puppy = {
            name: form.name.value,
            teamId: form.teamId.value,
            status: form.status.value,
            imageUrl: form.imageUrl.value,
            breed: form.breed.value,
        };
        await addNewPlayer(puppy);
        const players = await fetchAllPlayers();
        renderAllPlayers(players);

        form.name.value = '';
        form.teamId.value = '';
        form.status.value = '';
        form.imageUrl.value = '';
        form.breed.value = '';
        console.log(puppy);
    });
    } catch (error) {
        console.error('Uh oh, trouble rendering the new player form!', error);
    }
}

//extra stuff Jessica is working on

//get teams
const fetchAllTeams = async () => {
    try {
        const response = await fetch(
            APITEAMS
          );
          const teamList = await response.json();
          return teamList.data.teams;
    } catch (error) {
        console.error('Uh oh, trouble fetching teams!', error);
    }
};
//show teams on the page
const renderAllTeams = (teamList) => {
    try {
        teamContainer.innerHTML = '';
        teamList.forEach((teams) => {
            const teamElement = document.createElement('div');
            teamElement.classList.add('team');
            teamElement.innerHTML = `
                <h1>Team Name: ${teams.name}</h1>
                <p>Team ID: ${teams.id}<p>
                <div>
                <h3>Team Members: </h3>
                ${teams.players
                    .map(
                        (players) => `
                        <ul>
                            <li>${players.name} -- ${players.status}</li>
                        </ul>`
                    )
                    .join('')}
                    </div>
            `;
            teamContainer.appendChild(teamElement);
        });
    } catch (error) {
        console.error('Uh oh, trouble rendering teams!', error);
    }
};
//make players and teams into separate pages by adding and removing the "hidden" class from different elements
// function addClassP() {
//     let addP = document.getElementById("playersContainer");
//     addP.classList.add("hidden");
// };
// function addClassT() {
//     let addT = document.getElementById("teamsContainer");
//     addT.classList.add("hidden");
// };
// function addClassPButton() {
//     let addButton = document.getElementById("pButton");
//     addButton.classList.add("hidden");
// };
// function addClassTButton() {
//     let addButton = document.getElementById("tButton");
//     addButton.classList.add("hidden");
// };
// function removeClassP() {
//     let removeP = document.getElementById("playersContainer");
//     removeP.classList.remove("hidden");
// };
// function removeClassT() {
//     let removeT = document.getElementById("teamsContainer");
//     removeT.classList.remove("hidden");
// };
// function removeClassTButton() {
//     let removeT = document.getElementById("tButton");
//     removeT.classList.remove("hidden");
// };
// function removeClassPButton() {
//     let removeP = document.getElementById("pButton");
//     removeP.classList.remove("hidden");
// };
function show(element) {
    element.classList.remove("hidden");
};
function hide(element) {
    element.classList.add("hidden");
};
//attach hiding functions to players and teams buttons
const playersButton = document.querySelector('.playersButton');
playersButton.addEventListener('click', async (event) => {
    event.preventDefault();
    show(playersPageContainer);
    show(tButton);
    hide(teamPageContainer);
    hide(pButton);
    // addClassT();
    // addClassPButton();
    // removeClassP();
    // removeClassTButton();
    const playerList = await fetchAllPlayers();
    renderAllPlayers(playerList);
});
const teamsButton = document.querySelector('.teamsButton');
teamsButton.addEventListener('click', async (event) => {
    event.preventDefault();
    show(teamPageContainer);
    show(pButton);
    hide(playersPageContainer);
    hide(tButton);
    // addClassP();
    // addClassTButton();
    // removeClassT();
    // removeClassPButton();
    const teamList = await fetchAllTeams();
    renderAllTeams(teamList);
});
//View By menu, options are default, alphabetical, status, and player id number
const viewBySelectOption = document.querySelector('.viewBy');
viewBySelectOption.addEventListener('change', async (event) => {
    event.preventDefault();
    const players = await fetchAllPlayers();
    if (viewBySelectOption.value == "Alphabetical") {
        players.sort((a, b) => {
            const nameA = a.name.toUpperCase(); 
            const nameB = b.name.toUpperCase(); 
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }
            return 0;
          });
          renderAllPlayers(players.sort());
     } else if (viewBySelectOption.value == "Status") {
        players.sort((a, b) => {
            const statusA = a.status;
            const statusB = b.status;
            if (statusA == 'bench') {
                return -1;
            } else if (statusB == 'field') {
                return 1;
            } 
            return 0;
        });
        renderAllPlayers(players.sort());
    } else if (viewBySelectOption.value == "id") {
        players.sort((a, b) => {
            const idA = a.id;
            const idB = b.id;
            if (idA < idB) {
                return -1;
            } else if (idA > idB) {
                return 1;
            }
            return 0;
        });
        renderAllPlayers(players.sort());
    } else if (viewBySelectOption.value == "default") {
        renderAllPlayers(players);
    }
 });
//end of Jessica's extra stuff     

const init = async () => {
    const playerList = await fetchAllPlayers();
    renderAllPlayers(playerList);
    renderNewPlayerForm();
};

init(); 