function addToCart(listingId, quantity) {
  const listing = db.listings.find((l) => l.id === listingId);
  if (!listing) return;

  // Check stock availability
  if (listing.quantity <= 0 || listing.status === "Sold Out") {
    showToast("This item is out of stock.", "error");
    return;
  }

  const requestedQty = parseInt(quantity);
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const existingItem = cart.find((item) => item.listingId === listingId);
  const currentCartQty = existingItem ? existingItem.quantity : 0;

  // Check if total quantity exceeds available stock
  if (currentCartQty + requestedQty > listing.quantity) {
    showToast(
      `Only ${listing.quantity - currentCartQty} items available.`,
      "warning"
    );
    return;
  }

  const drug = db.drugs.find((d) => d.id === parseInt(listing.drugId));
  const pharmacy = db.pharmacies.find((p) => p.id === parseInt(listing.pharmacyId));

  if (!drug || !pharmacy) {
    showToast("Error loading item details.", "error");
    return;
  }

  if (existingItem) {
    existingItem.quantity += requestedQty;
  } else {
    cart.push({
      listingId,
      drugName: drug.name,
      pharmacyName: pharmacy.name,
      price: listing.discountPrice,
      quantity: requestedQty,
      image: drug.image,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();

  // Close modal
  const modalEl = document.getElementById("reserveModal");
  const modal = bootstrap.Modal.getInstance(modalEl);
  if (modal) modal.hide();

  showToast("Added to cart!", "success");
}

function updateCartCount() {
  const userStr = localStorage.getItem("currentUser");
  if (!userStr) return; // Only show cart for logged in users

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Find or create cart badge in navbar
  const navAuthSection = document.querySelector(".navbar-nav .ms-lg-3");
  if (navAuthSection) {
    let cartBtn = document.getElementById("cartBtn");
    if (!cartBtn) {
      // Insert before login/signup or profile
      const div = document.createElement("div");
      div.className = "d-inline-block position-relative";
      div.innerHTML = `
            <a href="cart.html" id="cartBtn" class="btn btn-outline-secondary cart-btn border-0">
                <i class="bi bi-cart3 fs-5"></i>
                <span class="position-absolute bg-danger rounded-circle" id="cartCount" style="display: none; width: 10px; height: 10px; top: 5px; right: 5px;"></span>
            </a>
          `;
      navAuthSection.parentNode.insertBefore(div, navAuthSection);
      cartBtn = document.getElementById("cartBtn");
    }

    const badge = document.getElementById("cartCount");
    if (badge) {
      badge.style.display = count > 0 ? "inline-block" : "none";
    }
  }
}

function renderCart() {
  const container = document.getElementById("cart-items");
  if (!container) return;

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  if (cart.length === 0) {
    container.innerHTML =
      '<p class="text-center text-muted py-4">Your cart is empty.</p>';
    document.getElementById("cart-subtotal").innerText = "0 EGP";
    document.getElementById("cart-total").innerText = "0 EGP";
    return;
  }

  let total = 0;
  container.innerHTML = cart
    .map((item, index) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      return `
            <div class="d-flex align-items-center mb-3 border-bottom pb-3">
                <img src="${item.image
        }" class="rounded me-3" style="width: 60px; height: 60px; object-fit: cover;">
                <div class="flex-grow-1">
                    <h6 class="mb-0">${item.drugName}</h6>
                    <small class="text-muted">${item.pharmacyName}</small>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <span class="fw-bold text-primary">${formatCurrency(
          item.price
        )}</span>
                        <div class="d-flex align-items-center">
                            <button class="btn btn-sm btn-outline-secondary px-2 py-0" onclick="updateCartItem(${index}, -1)">-</button>
                            <span class="mx-2 small">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary px-2 py-0" onclick="updateCartItem(${index}, 1)">+</button>
                        </div>
                    </div>
                </div>
                <button class="btn btn-link text-danger ms-2" onclick="removeCartItem(${index})"><i class="bi bi-trash"></i></button>
            </div>
        `;
    })
    .join("");

  document.getElementById("cart-subtotal").innerText = formatCurrency(total);
  document.getElementById("cart-total").innerText = formatCurrency(total);
}

function updateCartItem(index, change) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  if (cart[index]) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
    updateCartCount();
  }
}

function removeCartItem(index) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  updateCartCount();
}

function openReserveModal(listingId) {
  const userStr = localStorage.getItem("currentUser");
  if (!userStr) {
    showToast("Please log in to reserve medicines.", "warning");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
    return;
  }

  const listing = db.listings.find((l) => l.id === listingId);
  if (!listing) {
    showToast("Item not found.", "error");
    return;
  }

  const drug = db.drugs.find((d) => d.id === parseInt(listing.drugId));
  const pharmacy = db.pharmacies.find((p) => p.id === parseInt(listing.pharmacyId));

  if (!drug || !pharmacy) {
    showToast("Error loading item details.", "error");
    return;
  }

  document.getElementById("modalDrugName").innerText = drug.name;
  document.getElementById(
    "modalPharmacyName"
  ).innerText = `sold by ${pharmacy.name}`;
  document.getElementById("modalPrice").innerText = formatCurrency(
    listing.discountPrice
  );

  const quantityInput = document.getElementById("modalQuantity");
  quantityInput.value = 1;
  quantityInput.max = listing.quantity;

  const updateTotal = () => {
    const q = parseInt(quantityInput.value) || 1;
    document.getElementById("modalTotal").innerText = formatCurrency(
      listing.discountPrice * q
    );
  };

  quantityInput.oninput = updateTotal;
  updateTotal();

  const btn = document.getElementById("confirmReserveBtn");
  btn.onclick = () => addToCart(listingId, quantityInput.value);

  const modal = new bootstrap.Modal(document.getElementById("reserveModal"));
  modal.show();
}

function handleCheckout() {
  const userStr = localStorage.getItem("currentUser");
  if (!userStr) {
    showToast("Please log in to checkout.", "warning");
    return;
  }
  const user = JSON.parse(userStr);
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  if (cart.length === 0) {
    showToast("Your cart is empty.", "warning");
    return;
  }

  // Group items by pharmacy
  const ordersByPharmacy = {};
  cart.forEach((item) => {
    const listing = db.listings.find((l) => l.id === item.listingId);
    if (!listing) return;

    if (!ordersByPharmacy[listing.pharmacyId]) {
      ordersByPharmacy[listing.pharmacyId] = {
        items: [],
        total: 0,
      };
    }
    ordersByPharmacy[listing.pharmacyId].items.push({
      listingId: item.listingId,
      drugId: listing.drugId,
      quantity: item.quantity,
      price: item.price,
    });
    ordersByPharmacy[listing.pharmacyId].total += item.price * item.quantity;
  });

  // Create orders and reduce stock
  Object.keys(ordersByPharmacy).forEach((pharmacyId) => {
    const orderData = ordersByPharmacy[pharmacyId];

    // Create order
    const newOrder = {
      id:
        db.orders.length > 0 ? Math.max(...db.orders.map((o) => o.id)) + 1 : 1,
      pharmacyId: parseInt(pharmacyId),
      buyerId: user.id,
      buyerName: user.name,
      items: orderData.items,
      total: orderData.total,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    db.orders.push(newOrder);

    // Reduce stock for each item
    orderData.items.forEach((item) => {
      const listing = db.listings.find((l) => l.id === item.listingId);
      if (listing) {
        listing.quantity -= item.quantity;
        // Remove listing if out of stock
        if (listing.quantity <= 0) {
          listing.status = "Sold Out";
        }
      }
    });
  });

  saveDb();

  // Clear cart
  localStorage.removeItem("cart");
  updateCartCount();

  showToast("Order placed successfully!", "success");

  // Redirect to marketplace or refresh
  setTimeout(() => {
    window.location.href = "marketplace.html";
  }, 1500);
}
