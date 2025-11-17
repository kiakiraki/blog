function getThemePreference() {
  if (typeof localStorage !== 'undefined') {
    const theme = localStorage.getItem('theme');
    if (theme) {
      return theme;
    }
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function isDark() {
  return getThemePreference() === 'dark';
}

function updateTheme() {
  const theme = getThemePreference();
  document.documentElement.classList[isDark() ? 'add' : 'remove']('dark');

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('theme', theme);
  }
}

updateTheme();

document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('theme-toggle');
  if (button) {
    button.addEventListener('click', () => {
      const currentTheme = getThemePreference();
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('theme', newTheme);
      }

      updateTheme();
    });
  }
});

document.addEventListener('astro:after-swap', updateTheme);
