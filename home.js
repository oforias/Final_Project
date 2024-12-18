// Theme switching functionality
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;
        
// Check for saved theme preference
if (localStorage.getItem('theme') === 'dark') {
    root.setAttribute('data-theme', 'dark');
}

themeToggle.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    root.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
});