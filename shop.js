let allProducts = [];
let cart = [];

export async function loadProducts() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = "Loading products..."; 
    
    try {
        // Requirements: Filter by 1 category (ID 1 = Clothes)
        const response = await fetch('https://api.escuelajs.co/api/v1/products/?categoryId=1');
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
                <button onclick="updateQty(${item.id}, 1)">+</button>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    document.getElementById('cart-total').innerText = total.toFixed(2);
}

export function handleCheckout() {
    // Requirements: Get user data from localStorage
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const email = user ? user.email : "Guest";

    if (cart.length === 0) return alert("Your cart is empty!");

    const status = document.getElementById('checkout-status');
    status.innerHTML = "<span style='color: blue;'>Processing...</span>";

    // Requirements: Create 1 nested object literal (payload)
    const payload = {
        userInfo: user,
        cartItems: cart,
        totalPrice: cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    };

    // Requirements: setTimeout to simulate request
    setTimeout(() => {
        try {
            // Requirements: Save to localStorage
            localStorage.setItem('checkoutData', JSON.stringify(payload));
            
            status.innerHTML = "<span style='color: green;'>Success! Order Placed.</span>";
            console.log("Final Payload:", payload);
            cart = [];
            renderCart();
        } catch (e) {
            status.innerHTML = "<span style='color: red;'>Error during checkout.</span>";
        }
    }, 2000);
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