function loglog(){
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    // Basic email and password check
    if (email === 'bob12$$@gmail.com' && password === 'bob12$$') {
    window.location.href="bob12$$secureity.html"
    } else {
        alert("Invalid username or password")
    }

}