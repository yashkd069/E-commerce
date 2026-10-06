// ---------- Data (rendered dynamically from JS objects) ----------
const products = [
    { id: 1, name: "Wireless Headphones", category: "Electronics", price: 1999, emoji: "🎧" },
    { id: 2, name: "Smart Watch", category: "Electronics", price: 3499, emoji: "⌚" },
    { id: 3, name: "Bluetooth Speaker", category: "Electronics", price: 1499, emoji: "🔊" },
    { id: 4, name: "Running Shoes", category: "Fashion", price: 2299, emoji: "👟" },
    { id: 5, name: "Backpack", category: "Fashion", price: 999, emoji: "🎒" },
    { id: 6, name: "Sunglasses", category: "Fashion", price: 699, emoji: "🕶️" },
    { id: 7, name: "Coffee Mug", category: "Home", price: 299, emoji: "☕" },
    { id: 8, name: "Desk Lamp", category: "Home", price: 849, emoji: "💡" },
    { id: 9, name: "Notebook Set", category: "Home", price: 199, emoji: "📓" }
];

let cart = [];              // [{ id, qty }]
let activeCategory = "All";

const $ = (id) => document.getElementById(id);
const money = (n) => "₹" + n.toLocaleString("en-IN");
const findProduct = (id) => products.find((p) => p.id === id);

// ---------- Products ----------
function renderFilters() {
    const cats = ["All", ...new Set(products.map((p) => p.category))];
    $("filters").innerHTML = cats.map((c) =>
        `<button class="filter ${c === activeCategory ? "active" : ""}" data-cat="${c}">${c}</button>`).join("");
}

function renderProducts() {
    const list = activeCategory === "All" ? products : products.filter((p) => p.category === activeCategory);
    $("productGrid").innerHTML = list.map((p) => `
      <article class="product">
        <div class="emoji">${p.emoji}</div>
        <h3>${p.name}</h3>
        <div class="cat">${p.category}</div>
        <div class="price">${money(p.price)}</div>
        <button class="add-btn" data-add="${p.id}">Add to Cart</button>
      </article>`).join("");
}

// ---------- Cart logic ----------
function addToCart(id) {
    const line = cart.find((l) => l.id === id);
    if (line) line.qty++;
    else cart.push({ id, qty: 1 });
    updateCart();
    showToast(`${findProduct(id).name} added to cart`);
}

function changeQty(id, delta) {
    const line = cart.find((l) => l.id === id);
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) cart = cart.filter((l) => l.id !== id);
    updateCart();
}

function removeItem(id) {
    cart = cart.filter((l) => l.id !== id);
    updateCart();
}

const totalCount = () => cart.reduce((sum, l) => sum + l.qty, 0);
const totalPrice = () => cart.reduce((sum, l) => sum + l.qty * findProduct(l.id).price, 0);

function updateCart() {
    $("cartCount").textContent = totalCount();
    $("cartTotal").textContent = money(totalPrice());
    $("checkoutBtn").disabled = cart.length === 0;

    $("cartItems").innerHTML = cart.length === 0
        ? `<p class="empty">Your cart is empty 🛒</p>`
        : cart.map((l) => {
            const p = findProduct(l.id);
            return `
            <div class="item">
              <div class="emoji">${p.emoji}</div>
              <div class="info">
                <strong>${p.name}</strong><br>
                <small>${money(p.price)} each</small><br>
                <button class="remove" data-remove="${p.id}">Remove</button>
              </div>
              <div class="qty">
                <button data-dec="${p.id}" aria-label="Decrease quantity">−</button>
                <span>${l.qty}</span>
                <button data-inc="${p.id}" aria-label="Increase quantity">+</button>
              </div>
            </div>`;
        }).join("");
}

// ---------- Drawer, modal, toast ----------
function toggleDrawer(open) {
    $("drawer").classList.toggle("open", open);
    $("overlay").classList.toggle("show", open);
}

function openCheckout() {
    const rows = cart.map((l) => {
        const p = findProduct(l.id);
        return `<div class="summary-row"><span>${p.emoji} ${p.name} × ${l.qty}</span><span>${money(p.price * l.qty)}</span></div>`;
    }).join("");
    $("modalBox").innerHTML = `
      <h2>Checkout Preview</h2>
      ${rows}
      <div class="summary-row"><span>Items</span><span>${totalCount()}</span></div>
      <div class="summary-row total"><span>Total</span><span>${money(totalPrice())}</span></div>
      <button class="primary" style="margin-top:18px" id="placeOrder">Place Order</button>
      <button class="secondary" id="closeModal">Back to Cart</button>`;
    $("modal").classList.add("show");
}

function placeOrder() {
    const total = money(totalPrice());
    cart = [];
    updateCart();
    $("modalBox").innerHTML = `
      <div class="success">
        <div class="big">✅</div>
        <h2>Order placed!</h2>
        <p style="color:var(--muted);margin:8px 0 18px">Thank you for shopping. You paid ${total}.</p>
        <button class="primary" id="closeModal">Continue Shopping</button>
      </div>`;
    toggleDrawer(false);
}

function closeModal() { $("modal").classList.remove("show"); }

let toastTimer;
function showToast(text) {
    const t = $("toast");
    t.textContent = text;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 1500);
}

// ---------- Events (event delegation) ----------
document.addEventListener("click", (e) => {
    const t = e.target;
    if (t.dataset.add) addToCart(+t.dataset.add);
    else if (t.dataset.inc) changeQty(+t.dataset.inc, 1);
    else if (t.dataset.dec) changeQty(+t.dataset.dec, -1);
    else if (t.dataset.remove) removeItem(+t.dataset.remove);
    else if (t.dataset.cat) { activeCategory = t.dataset.cat; renderFilters(); renderProducts(); }
    else if (t.id === "placeOrder") placeOrder();
    else if (t.id === "closeModal" || t.id === "modal") closeModal();
});

$("openCart").addEventListener("click", () => toggleDrawer(true));
$("closeCart").addEventListener("click", () => toggleDrawer(false));
$("overlay").addEventListener("click", () => toggleDrawer(false));
$("checkoutBtn").addEventListener("click", openCheckout);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeModal(); toggleDrawer(false); } });

// ---------- Init ----------
renderFilters();
renderProducts();
updateCart();