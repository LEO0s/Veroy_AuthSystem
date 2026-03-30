const currentUser = JSON.parse(localStorage.getItem('currentUser'));
const cartKey = currentUser ? `cart_${currentUser.email}` : 'cart_guest';

let allProducts = [];
let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

export async function loadProducts() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = "Loading products..."; 
    
    try {
        const response = await fetch('https://api.escuelajs.co/api/v1/products/?categoryId=37');
        const data = await response.json();
        
        allProducts = data.slice(0, 25);
        displayProducts(allProducts);
    } catch (error) {
        grid.innerHTML = "Error loading products.";
    }
}

function displayProducts(products) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = products.map(p => `
        <div class="card">
            <img src="${p.images[0]}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/150'">
            <h4>${p.title}</h4>
            <p>$${p.price}</p>
            <button onclick="addToCart(${p.id}, '${p.title.replace(/'/g, "")}', ${p.price})">Add to Cart</button>
        </div>
    `).join('');
}

export function addToCart(id, name, price) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity++;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    renderCart();
}

export function updateQty(id, change) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);
    }
    renderCart();
}

function renderCart() {
    localStorage.setItem(cartKey, JSON.stringify(cart));

    const cartDiv = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartDiv.innerHTML = '<p style="text-align:center; color:gray;">Your cart is empty.</p>';
    } else {
        cartDiv.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div>
                    <strong>${item.name}</strong><br>
                    $${item.price.toFixed(2)} x ${item.quantity} 
                </div>
                <div>
                    <button onclick="updateQty(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQty(${item.id}, 1)">+</button>
                    
                    <button onclick="removeFromCart(${item.id})" 
                            style="background:none; border:none; color:red; cursor:pointer; margin-left:10px;">
                        Remove
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    calculateTotal(); 
}

export function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    renderCart();
}

export function handleCheckout() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!cart.length) return alert("Your cart is empty!");

    const status = document.getElementById('checkout-status');
    status.innerHTML = "<span style='color: blue;'>Loading...</span>"; 

    const payload = {
        user: user,             
        cart: cart,             
        total: calculateTotal(),
        date: new Date()        
    };

    setTimeout(() => {
        try {
            localStorage.setItem('checkoutData', JSON.stringify(payload));
            
            status.innerHTML = "<span style='color: green;'>Success! Order Placed.</span>"; 
            console.log("Final Payload:", payload);
            localStorage.removeItem(cartKey);
            cart = [];
            renderCart();
        } catch (e) {
            status.innerHTML = "<span style='color: red;'>Something went wrong.</span>";
        }
    }, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
    const filterBtn = document.getElementById('filterBtn');
    if(filterBtn) {
        filterBtn.addEventListener('click', () => {
            const min = Number(document.getElementById('minPrice').value) || 0;
            const max = Number(document.getElementById('maxPrice').value) || Infinity;
            const filtered = allProducts.filter(p => p.price >= min && p.price <= max);
            displayProducts(filtered);
        });
    }
});

export function calculateTotal() {
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalSpan = document.getElementById('cart-total');
    if (totalSpan) {
        totalSpan.innerText = total.toFixed(2);
    }
    return total;
}

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});