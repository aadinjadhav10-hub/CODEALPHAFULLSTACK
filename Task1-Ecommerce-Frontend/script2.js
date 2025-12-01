// =================== FETCH PRODUCTS FROM BACKEND ===================
fetch("http://localhost:5000/api/products")
  .then(res => res.json())
  .then(data => {
    console.log("Products from backend:", data);
    displayProducts(data);
  })
  .catch(err => console.log("Error loading products:", err));

// =================== DISPLAY PRODUCTS ON PAGE ===================
function displayProducts(products) {
  const container = document.getElementById("product-list");
  if (!container) return; // Exit if product-list doesn't exist on this page
  
  container.innerHTML = ""; // clear previous content

  products.forEach(product => {
    const card = document.createElement("div");
    card.classList.add("product-card");

    // Make sure image exists, use placeholder if not
    const productImage = product.image || 'https://via.placeholder.com/200';

    card.innerHTML = `
      <img src="${productImage}" alt="${product.name}" class="product-img">

      <h3>${product.name}</h3>
      <p class="price">₹${product.price}</p>

      <div style="display: flex; gap: 8px; flex-direction: column;">
        <button class="add-btn" 
          data-name="${product.name}" 
          data-price="${product.price}"
          data-image="${productImage}"
          data-id="${product._id}">
          Add to Cart
        </button>
        
        <a href="product-details.html?id=${product._id}" 
           style="display: block; padding: 10px 16px; background: #f5f5f5; color: #333; text-decoration: none; border-radius: 6px; text-align: center; font-weight: 500; transition: all 0.3s;">
          View Details
        </a>
      </div>
    `;

    container.appendChild(card);
  });

  attachCartEvents();
}

// =================== CART LOGIC ===================
function addToCart(name, price, image, id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  
  // Check if product already exists in cart
  const existingItem = cart.find(item => item.name === name);
  
  if (existingItem) {
    alert(name + " is already in your cart!");
    return;
  }
  
  console.log("Adding to cart:", { name, price, image, id }); // Debug log
  
  cart.push({ id, name, price, image });
  localStorage.setItem("cart", JSON.stringify(cart));
  alert(name + " added to cart!");
}

function attachCartEvents() {
  document.querySelectorAll(".add-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.name;
      const price = parseInt(btn.dataset.price);
      const image = btn.dataset.image;
      const id = btn.dataset.id;
      
      console.log("Button clicked - Image value:", image); // Debug log
      
      addToCart(name, price, image, id);
    });
  });
}

// Add hover effect for View Details button
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `
    a[href^="product-details.html"]:hover {
      background: #e0e0e0 !important;
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
  `;
  document.head.appendChild(style);
});
