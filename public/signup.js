/*document.getElementById('submit').addEventListener('click', async() => {
    checkFormRequired();
    //post user profile data
});

function checkFormRequired() {
    //check all required fields
  }*/

async function postData(){
    
    const response = await fetch('/userProfile', {
        method: 'POST',
        body: JSON.stringify({
            fname: document.getElementById("exampleFirstName").value,
            lname: document.getElementById("exampleLastName").value,
            email: document.getElementById("exampleEmail").value,
            password: document.getElementById("exampleInputPassword1").value,
            phoneNumber: document.getElementById("phoneNumber").value,
            aptCode: document.getElementById("exampleFirstName2").value
        })
    });

    if (!response.ok) {
        console.error("Could not save the turn score to the server.");
    }

}


window.addEventListener('load', () => {
    const submit = document.getElementById('submit');
    submit.addEventListener('click', () => postData());

});