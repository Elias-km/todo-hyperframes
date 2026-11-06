const STORAGE_KEY = 'todo-react:theme';
const THEMES = ['light', 'dark', 'radioactive'];

export function loadTheme(storage) {
  try {
    const theme = (storage ?? localStorage).getItem(STORAGE_KEY);
    return THEMES.includes(theme) ? theme : 'radioactive';
  } catch {
    return 'radioactive';
  }
}

export function saveTheme(theme, storage) {
  if (!THEMES.includes(theme)) return false;

  try {
    (storage ?? localStorage).setItem(STORAGE_KEY, theme);
    return true;
  } catch {
    return false;
  }
}
