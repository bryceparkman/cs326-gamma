let globColor = "FF0000";

/*
* Checks if a users given email doesn't currently exist in the database.
*/
async function checkEmail(){
  const email = document.getElementById('exampleEmail').value;
  const emailRequest = await fetch('/email/'+email);
  const unique = emailRequest.ok ? await emailRequest.json() : [];
  if(unique === "true"){
    return true;
  }
  else {
    alert("This email is already registered to an account");
    window.location.href = "signup.html";
    return false;
  }
}

/*
* Posts the new user's data to the database
*/
async function postData(){
  let check = checkEmail();

  if(check === false)
    return;

    const response = await fetch('/userProfile', {
        method: 'POST',
        body: JSON.stringify({
            fname: document.getElementById("exampleFirstName").value,
            lname: document.getElementById("exampleLastName").value,
            email: document.getElementById("exampleEmail").value,
            password: document.getElementById("exampleInputPassword1").value,
            phoneNumber: document.getElementById("phoneNumber").value,
            color: globColor,
            aptCode: document.getElementById("exampleFirstName2").value
        }),
        headers: {
          'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
        console.error("Could not save the user profile to the server.");
        alert("Could not save profile");
    }
    else{
      if(document.getElementById("exampleFirstName2").value === '')
        window.location.href = "apt-creation.html";
      else 
        window.location.href = "apt-overview.html";
    }

}

function setColor(color){
    globColor = color;
}

//Checks which color radio button the user selects
window.addEventListener('load', () => {
    document.getElementById('blackusericon').addEventListener('click', () => setColor("000000"));
    document.getElementById('purpleusericon').addEventListener('click', () => setColor("800080"));
    document.getElementById('greenusericon').addEventListener('click', () => setColor("008000"));
    document.getElementById('yellowusericon').addEventListener('click', () => setColor("FFFF00"));
    document.getElementById('redusericon').addEventListener('click', () => setColor("FF0000"));


    const submit = document.getElementById('submit');
    submit.addEventListener('click', () => postData());

});