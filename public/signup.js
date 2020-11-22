let globColor = "FF0000";

async function postData(){
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
        })
    });

    if (!response.ok) {
        console.error("Could not save the user profile to the server.");
    }
    else{
        window.location.href = "apt-creation.html";
    }

}

function setColor(color){
    globColor = color;
}

window.addEventListener('load', () => {
    document.getElementById('blackusericon').addEventListener('click', () => setColor("000000"));
    document.getElementById('purpleusericon').addEventListener('click', () => setColor("800080"));
    document.getElementById('greenusericon').addEventListener('click', () => setColor("008000"));
    document.getElementById('yellowusericon').addEventListener('click', () => setColor("FFFF00"));
    document.getElementById('redusericon').addEventListener('click', () => setColor("FF0000"));


    const submit = document.getElementById('submit');
    submit.addEventListener('click', () => postData());

});