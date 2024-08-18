document.getElementById('loginButton').addEventListener('click', function(event) {
    event.stopPropagation();
    var form = document.getElementById('loginForm');
    form.style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
});

document.getElementById('registerButton').addEventListener('click', function(event) {
    event.stopPropagation();
    var form = document.getElementById('registerForm');
    form.style.display = 'block';
    document.getElementById('loginForm').style.display = 'none';
});

document.addEventListener('click', function(event) {
    var loginForm = document.getElementById('loginForm');
    var registerForm = document.getElementById('registerForm');
    var loginButton = document.getElementById('loginButton');
    var registerButton = document.getElementById('registerButton');
    if (!loginForm.contains(event.target) && !registerForm.contains(event.target) && event.target !== loginButton && event.target !== registerButton) {
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
    }
});

const roleButtons = document.querySelectorAll('.role-btn');
roleButtons.forEach(button => {
    button.addEventListener('click', function() {
        roleButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        const selectedRole = this.getAttribute('data-role');
        document.getElementById('selectedRole').value = selectedRole;
        document.getElementById('selectedRoleRegister').value = selectedRole;

        document.getElementById('emailInput').disabled = false;
        document.getElementById('usernameInput').disabled = false;
        document.getElementById('passwordInput').disabled = false;
        document.getElementById('submitBtn').disabled = false;
    });
});
