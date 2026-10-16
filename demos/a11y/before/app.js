/* Demo Storefront - BEFORE (intentionally vulnerable / inaccessible) */

var PRODUCTS = [
  { id: 'headphones', name: 'Wireless Headphones', price: 79.99 },
  { id: 'keyboard',   name: 'Mechanical Keyboard', price: 129.99 },
  { id: 'mouse',      name: 'Ergonomic Mouse',     price: 49.99 },
  { id: 'monitor',    name: '27" 4K Monitor',      price: 349.99 }
];

// VULNERABLE: reflected XSS — location.hash is written straight into innerHTML.
// Try:  index.html#"><img src=x onerror=alert(1)>
function renderWelcome() {
  var name = location.hash.slice(1) || 'guest';
  document.getElementById('welcome').innerHTML =
    '<strong>Welcome, ' + name + '!</strong>  <a href="#deals">See today\'s deals</a>';
}

// VULNERABLE: DOM XSS — the search query is rendered via innerHTML.
function liveSearch(q) {
  var box = document.getElementById('results');
  var query = q.toLowerCase();
  var hits = PRODUCTS.filter(function (p) {
    return p.name.toLowerCase().indexOf(query) !== -1;
  });
  var html = '<p>Results for "' + q + '":</p><ul>';
  hits.forEach(function (p) {
    html += '<li>' + p.name + ' &mdash; $' + p.price + '</li>';
  });
  box.innerHTML = html + '</ul>';
}

function addToCart(id) {
  alert('Added to cart: ' + id);
}

// INACCESSIBLE: an invalid email is signalled by border color alone —
// screen-reader users get no message at all.
function subscribe(e) {
  e.preventDefault();
  var input = document.getElementById('newsletter-email');
  if (input.value.indexOf('@') === -1) {
    input.style.borderColor = 'red';
    return false;
  }
  input.style.borderColor = '';
  alert('Thanks for subscribing!');
  return false;
}

document.addEventListener('DOMContentLoaded', renderWelcome);
window.addEventListener('hashchange', renderWelcome);
