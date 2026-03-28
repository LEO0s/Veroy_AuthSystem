let allProducts = [];
let cart = [];

export async function loadProducts() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = "Loading products..."; 
    
    try {
        // Requirements: Filter by 1 category (ID 1 = Clothes)
        const response = await fetch('https://api.escuelajs.co/api/v1/products/?categoryId=2');
        const data = await response.json();
        
        allProducts = data.slice(0, 25); // Min 25 products
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
    const cartDiv = document.getElementById('cart-items');
    cartDiv.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div>
                <strong>${item.name}</strong><br>
                $${item.price} x ${item.quantity}
            </div>
            <div>
                <button onclick="updateQty(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQty(${item.id}, 1)">+</button>
                <button onclick="removeFromCart(${item.id})" style="background:none; border:none; color:red; cursor:pointer; margin-left:10px;">Remove</button>
            </div>
        </div>
    `).join('');
    
    calculateTotal(); // Auto-updates total 
}

// Add this function to shop.js
export function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    renderCart();
}

export function handleCheckout() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!cart.length) return alert("Your cart is empty!");

    const status = document.getElementById('checkout-status');
    status.innerHTML = "<span style='color: blue;'>Loading...</span>"; // Loading state [cite: 54]

    // EXACT Payload Format from Requirement [cite: 61-67]
    const payload = {
        user: user,             // user info [cite: 46]
        cart: cart,             // cart items [cite: 48]
        total: calculateTotal(), // total price [cite: 50]
        date: new Date()        // date [cite: 67]
    };

    setTimeout(() => {
        try {
            // Save to localStorage [cite: 59, 110]
            localStorage.setItem('checkoutData', JSON.stringify(payload));
            
            status.innerHTML = "<span style='color: green;'>Success! Order Placed.</span>"; // Success message [cite: 55]
            console.log("Final Payload:", payload);
            cart = [];
            renderCart();
        } catch (e) {
            status.innerHTML = "<span style='color: red;'>Something went wrong.</span>"; // Fail message [cite: 57]
        }
    }, 2000); // Simulate request [cite: 51]
}

// Add event listener for filtering
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

// Add this to your shop.js to satisfy "Total cost is auto-update" [cite: 40, 98]
export function calculateTotal() {
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalSpan = document.getElementById('cart-total');
    if (totalSpan) {
        totalSpan.innerText = total.toFixed(2);
    }
    return total; // Returns as a number [cite: 66]
}