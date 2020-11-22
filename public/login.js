
async function verifyData(){
    const email = document.getElementById('exampleEmail').value;
    const userEnteredPassword = document.getElementById('exampleInputPassword1').value;
    const passwordRequest = await fetch('/loginProfile/'+email);
    const password = passwordRequest.ok ? await passwordRequest.json() : [];
    if(password.password === userEnteredPassword)
        window.location.href = "apt-overview.html";
    else
        alert("Password Incorrect");

}

window.addEventListener('load', () => {
    const login = document.getElementById('login');
    login.addEventListener('click', () => verifyData());

});