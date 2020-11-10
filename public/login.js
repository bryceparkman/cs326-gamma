async function verifyData(){
    const email = document.getElementById('exampleEmail').value;
    const userEnteredPassword = document.getElementById('exampleInputPassword1').value;
    const password = await fetch('/loginProfile/'+email);
    const realPassword = await password.json();
    if(realPassword === userEnteredPassword)
        window.location.href = "apt-creation.html";
    else
        alert("Password Incorrect")

}

window.addEventListener('load', () => {
    const login = document.getElementById('login');
    login.addEventListener('click', () => verifyData());

});