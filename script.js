const products = [
  {
    id: 1,
    name: "Trà gạo lứt thảo mộc",
    description: "Sản phẩm duy nhất của BrownCha, tập trung hoàn thiện hương vị và công dụng thanh lọc, giảm stress, cân bằng cơ thể.",
    price: 60000,
    image: "images/product1.jpg",
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
const menuToggle = document.getElementById("menuToggle");
const siteHeader = document.querySelector(".site-header");

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
  showCheckoutForm();
});

function showCheckoutForm() {
  const items = Array.from(cart.values());
  const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  cartContent.innerHTML = `
    <form id="checkoutForm" class="checkout-form">
      <h4>Thông tin đặt hàng</h4>
      <div class="form-row"><label>Tên<br><input name="name" required></label></div>
      <div class="form-row"><label>Điện thoại<br><input name="phone" required></label></div>
      <div class="form-row"><label>Địa chỉ<br><input name="address" required></label></div>
      <div class="form-row"><label>Ghi chú<br><textarea name="notes"></textarea></label></div>
      <div class="form-row">
        <label>Phương thức thanh toán</label><br>
        <label><input type="radio" name="payment" value="COD" checked> Thanh toán khi nhận (COD)</label>
        <label><input type="radio" name="payment" value="Bank"> Chuyển khoản</label>
      </div>
      <div class="checkout-summary">
        <h5>Tóm tắt đơn hàng</h5>
        ${items.map(it => `<div>${it.quantity} x ${it.name} — ${formatPrice(it.price)} = ${formatPrice(it.price * it.quantity)}</div>`).join('')}
        <div class="checkout-total"><strong>Tổng:</strong> ${formatPrice(total)}</div>
      </div>
      <div class="checkout-actions">
        <button type="submit" class="button button-primary">Xác nhận đặt hàng</button>
        <button type="button" id="checkoutCancel" class="button button-secondary">Quay lại</button>
      </div>
    </form>
  `;

  checkoutButton.style.display = 'none';

  const form = document.getElementById('checkoutForm');
  form.addEventListener('submit', submitCheckout);
  document.getElementById('checkoutCancel').addEventListener('click', () => {
    checkoutButton.style.display = '';
    renderCart();
  });
}

function submitCheckout(e) {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  const name = (fd.get('name') || '').trim();
  const phone = (fd.get('phone') || '').trim();
  const address = (fd.get('address') || '').trim();
  const notes = (fd.get('notes') || '').trim();
  const payment = fd.get('payment') || 'COD';
  if (!name || !phone || !address) {
    alert('Vui lòng điền tên, điện thoại và địa chỉ.');
    return;
  }

  const items = Array.from(cart.values());
  const total = items.reduce((s, it) => s + it.price * it.quantity, 0);

  const orders = JSON.parse(localStorage.getItem('browncha_orders') || '[]');
  const order = { id: Date.now(), name, phone, address, notes, payment, items, total, created: new Date().toISOString() };
  orders.push(order);
  localStorage.setItem('browncha_orders', JSON.stringify(orders));

  // Prepare mailto fallback
  const subject = encodeURIComponent('Đơn hàng BrownCha #' + order.id);
  let body = `Đơn hàng BrownCha\nMã: ${order.id}\nTên: ${name}\nĐiện thoại: ${phone}\nĐịa chỉ: ${address}\nPhương thức: ${payment}\nGhi chú: ${notes}\n\nChi tiết:\n`;
  order.items.forEach(it => {
    body += `${it.quantity} x ${it.name} - ${formatPrice(it.price)} = ${formatPrice(it.price * it.quantity)}\n`;
  });
  body += `\nTổng: ${formatPrice(total)}\n\nCám ơn!`;
  const mailto = `mailto:browncha.1028@gmail.com?subject=${subject}&body=${encodeURIComponent(body)}`;

  cart.clear();
  renderCart();
  checkoutButton.style.display = '';
  cartContent.innerHTML = `<p class="checkout-success">Cảm ơn ${name}! Đơn hàng của bạn đã được ghi nhận. Chúng tôi sẽ liên hệ sớm. <a href="${mailto}">Gửi email xác nhận</a></p>`;
}

// Mobile menu toggle
if (menuToggle && siteHeader) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    siteHeader.classList.toggle("mobile-open", !expanded);
  });

  document.querySelectorAll('.site-nav a').forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      siteHeader.classList.remove('mobile-open');
    });
  });
}

renderProducts();
renderCart();
