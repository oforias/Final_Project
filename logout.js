document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', () => {
        fetch('logout.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = 'login.php';
                } else {
                    console.error('Logout failed:', data.error);
                }
            })
            .catch(error => console.error('Error:', error));
    });
});
