// Light/dark toggle. With no saved choice the page follows the system setting
// (via prefers-color-scheme in portfolio.css), falling back to light.
(function () {
  var root = document.documentElement;
  var KEY = 'theme';

  function saved() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function systemDark() {
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }
  function current() {
    return root.getAttribute('data-theme') || (systemDark() ? 'dark' : 'light');
  }
  function label(button) {
    var next = current() === 'dark' ? 'light' : 'dark';
    button.textContent = next === 'dark' ? '☾ Dark' : '☀ Light';
    button.setAttribute('aria-label', 'Switch to ' + next + ' theme');
  }

  var choice = saved();
  if (choice === 'light' || choice === 'dark') root.setAttribute('data-theme', choice);

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      label(button);
      button.addEventListener('click', function () {
        var next = current() === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem(KEY, next); } catch (e) {}
        document.querySelectorAll('[data-theme-toggle]').forEach(label);
      });
    });
  });
})();
