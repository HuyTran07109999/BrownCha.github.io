const products = [
  {
    id: 1,
    name: "Trà gạo lứt thảo mộc",
    description: "Hương thanh, giúp giải độc và làm dịu cơ thể.",
    price: 129000,
    image: "images/product-1.svg",
  },
  {
    id: 2,
    name: "Trà gạo lứt hồng sâm",
    description: "Bổ sung năng lượng, ấm bụng cho ngày dài.",
    price: 149000,
    image: "images/product-2.svg",
  },
  {
    id: 3,
    name: "Trà gạo lứt hoa cúc",
    description: "Dành cho giấc ngủ sâu và thư giãn tinh thần.",
    price: 119000,
    image: "images/product-3.svg",
  },
  {
    id: 4,
    name: "Combo hộp quà BrownCha",
    description: "Lựa chọn quà tặng sang trọng cho người thân và bạn bè.",
    price: 189000,
    image: "images/product-4.svg",
  },
];

const cart = new Map();
const productGrid = document.getElementById("productGrid");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const cartContent = document.getElementById("cartContent");
const cartPanel = document.getElementById("cartPanel");
const overlay = document.getElementById("overlay");
const cartButton = document.getElementById("cartButton");
const closeCart = document.getElementById("closeCart");
const checkoutButton = document.getElementById("checkoutButton");
const heroCartOpen = document.getElementById("heroCartOpen");

function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function renderProducts() {
  productGrid.innerHTML = products
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-image">
            <img src="${product.image}" alt="${product.name}" />
          </div>
          <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-bottom">
              <span class="product-price">${formatPrice(product.price)}</span>
              <button class="product-action" data-id="${product.id}">Thêm vào giỏ</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function renderCart() {
  const items = Array.from(cart.values());
  cartCount.textContent = items.reduce((sum, item) => sum + item.quantity, 0);

  if (!items.length) {
    cartContent.innerHTML = '<p class="empty-cart">Giỏ hàng đang trống.</p>';
    cartTotal.textContent = formatPrice(0);
    return;
  }

  cartContent.innerHTML = items
    .map(
      (item) => `
        <div class="cart-item">
          <div>
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-details">
              <span>${item.quantity} x ${formatPrice(item.price)}</span>
              <button data-action="remove" data-id="${item.id}">Xóa</button>
            </div>
          </div>
          <div class="cart-item-price">${formatPrice(item.price * item.quantity)}</div>
        </div>
      `
    )
    .join("");

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = formatPrice(total);
}

function addToCart(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  const existing = cart.get(id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.set(id, { ...product, quantity: 1 });
  }
  renderCart();
  openCart();
}

function removeFromCart(id) {
  cart.delete(id);
  renderCart();
}

function openCart() {
  cartPanel.classList.add("open");
  overlay.classList.add("visible");
  cartPanel.setAttribute("aria-hidden", "false");
}

function closeCartPanel() {
  cartPanel.classList.remove("open");
  overlay.classList.remove("visible");
  cartPanel.setAttribute("aria-hidden", "true");
}

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;
  const id = Number(button.dataset.id);
  addToCart(id);
});

cartContent.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action='remove']");
  if (!button) return;
  const id = Number(button.dataset.id);
  removeFromCart(id);
});

cartButton.addEventListener("click", openCart);
heroCartOpen.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartPanel);
overlay.addEventListener("click", closeCartPanel);
checkoutButton.addEventListener("click", () => {
  if (!cart.size) {
    alert("Giỏ hàng trống. Vui lòng thêm sản phẩm.");
    return;
  }
  alert("Cảm ơn bạn đã đặt hàng! Chúng tôi sẽ liên hệ bạn sớm.");
  cart.clear();
  renderCart();
  closeCartPanel();
});

renderProducts();
renderCart();
