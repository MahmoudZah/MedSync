// Theme Management for MedSync
(function() {
  // Initialize theme from localStorage or system preference
  function initTheme() {
    const savedTheme = localStorage.getItem('medsync_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(theme, false);
    
    // Create theme toggle button
    createThemeToggle();
  }

  // Set theme
  function setTheme(theme, save = true) {
    document.documentElement.setAttribute('data-theme', theme);
    
    if (save) {
      localStorage.setItem('medsync_theme', theme);
    }
    
    // Update toggle button icon
    updateToggleIcon(theme);
  }

  // Toggle theme
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }

  // Create theme toggle button
  function createThemeToggle() {
    // Check if button already exists
    if (document.getElementById('theme-toggle')) return;
    
    const button = document.createElement('button');
    button.id = 'theme-toggle';
    button.className = 'theme-toggle';
    button.setAttribute('aria-label', 'Toggle dark mode');
    button.innerHTML = '<i class="bi bi-moon-fill"></i>';
    
    button.addEventListener('click', toggleTheme);
    
    document.body.appendChild(button);
  }

  // Update toggle button icon
  function updateToggleIcon(theme) {
    const button = document.getElementById('theme-toggle');
    if (!button) return;
    
    const icon = button.querySelector('i');
    if (theme === 'dark') {
      icon.className = 'bi bi-sun-fill';
    } else {
      icon.className = 'bi bi-moon-fill';
    }
  }

  // Listen for system theme changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const savedTheme = localStorage.getItem('medsync_theme');
      // Only auto-switch if user hasn't manually set a preference
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light', false);
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }
})();
