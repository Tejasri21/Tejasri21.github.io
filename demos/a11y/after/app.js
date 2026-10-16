/* Demo Storefront - AFTER (fixed) */
'use strict';

var PRODUCTS = [
  { id: 'headphones', name: 'Wireless Headphones', price: 79.99 },
  { id: 'keyboard',   name: 'Mechanical Keyboard', price: 129.99 },
  { id: 'mouse',      name: 'Ergonomic Mouse',     price: 49.99 },
  { id: 'monitor',    name: '27" 4K Monitor',      price: 349.99 }
];

/**
 * Escape HTML special characters. Defense-in-depth helper for any code path
 * that must interpolate a string into HTML (e.g. server-rendered templates).
 * Client-side rendering below prefers textContent / DOM APIs instead.
 */
function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c];
  });
}

// FIXED: the URL hash is rendered as *text* — markup in it cannot execute.
function renderWelcome() {
  var name = decodeURIComponent(location.hash.slice(1) || 'guest');
  var banner = document.getElementById('welcome');
  banner.textContent = '';
  var strong = document.createElement('strong');
  strong.textContent = 'Welcome, ' + name + '! ';
  var link = document.createElement('a');
  link.href = '#deals';
  link.textContent = "See today's deals";
  banner.appendChild(strong);
  banner.appendChild(link);
}

// FIXED: results are built with DOM APIs; the query only ever becomes text.
function liveSearch(q) {
  var box = document.getElementById('results');
  box.textContent = '';
  var query = q.trim().toLowerCase();
  if (!query) {
    return;
  }
  var hits = PRODUCTS.filter(function (p) {
    return p.name.toLowerCase().indexOf(query) !== -1;
  });
  var p = document.createElement('p');
  p.textContent = 'Results for "' + q.trim() + '": ' + hits.length + ' found.';
  var ul = document.createElement('ul');
  hits.forEach(function (prod) {
    var li = document.createElement('li');
    li.textContent = prod.name + ' \u2014 $' + prod.price.toFixed(2);
    ul.appendChild(li);
  });
  box.appendChild(p);
  box.appendChild(ul);
}

function addToCart(id) {
  var status = document.getElementById('results');
  status.textContent = 'Added to cart: ' + id + '.';
}

// FIXED: validation errors are announced as text in an aria-live region —
// never by color alone — and focus moves to the invalid field.
function subscribe(e) {
  e.preventDefault();
  var input = document.getElementById('newsletter-email');
  var err = document.getElementById('form-error');
  var email = input.value.trim();
  if (email.indexOf('@') === -1 || email.indexOf('.') === -1) {
    input.setAttribute('aria-invalid', 'true');
    err.textContent = 'Error: please enter a valid email address, like you@example.com.';
    input.focus();
    return;
  }
  input.removeAttribute('aria-invalid');
  err.textContent = '';
  var ok = document.getElementById('results');
  ok.textContent = 'Thanks for subscribing with ' + email + '!';
  input.value = '';
}

document.addEventListener('DOMContentLoaded', function () {
  renderWelcome();
  document.getElementById('search').addEventListener('input', function (e) {
    liveSearch(e.target.value);
  });
  document.getElementById('signup').addEventListener('submit', subscribe);
  Array.prototype.forEach.call(
    document.querySelectorAll('.card-btn[data-id]'),
    function (btn) {
      btn.addEventListener('click', function () {
        addToCart(btn.getAttribute('data-id'));
      });
    }
  );
});

window.addEventListener('hashchange', renderWelcome);

// Export for the offline test-suite (harmless in browsers).
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { escapeHTML: escapeHTML };
}
