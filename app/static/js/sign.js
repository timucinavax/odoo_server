document.addEventListener('DOMContentLoaded', function () {
    const roleButtons = document.querySelectorAll('.role-btn');
    const signInRoleInput = document.getElementById('selectedRoleLogin');
    const signUpRoleInput = document.getElementById('selectedRoleRegister');

    roleButtons.forEach(button => {
        button.addEventListener('click', function () {
            roleButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const selectedRole = this.getAttribute('data-role');
            if (this.closest('form').id === 'sign-in-form') {
                signInRoleInput.value = selectedRole;
            } else {
                signUpRoleInput.value = selectedRole;
            }
        });
    });

    // Form visibility toggle events
    document.getElementById('sign-in-btn').addEventListener('click', () => {
        document.querySelector('.container').classList.remove('right-panel-active');
    });

    document.getElementById('sign-up-btn').addEventListener('click', () => {
        document.querySelector('.container').classList.add('right-panel-active');
    });

    document.getElementById('sign-in-link').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.container').classList.remove('right-panel-active');
    });

    document.getElementById('sign-up-link').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.container').classList.add('right-panel-active');
    });
});
