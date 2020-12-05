/*
* Verifies the password of a given email, if authenticated routes to apartment overview page
*/
async function verifyData(){
    const email = document.getElementById('exampleEmail').value;
    const userEnteredPassword = document.getElementById('exampleInputPassword1').value;
    const login = {email, userEnteredPassword};

    const passwordRequest = await fetch('/loginProfile/' + email + '/pass/' +userEnteredPassword);

    const valid = passwordRequest.ok ? await passwordRequest.json() : [];
    if(valid === "true"){
        window.location.href = "apt-overview.html";
    }
    else {
        alert("Password Incorrect");
    }   
}

window.addEventListener('load', () => {
    const login = document.getElementById('login');
    login.addEventListener('click', () => verifyData());

});