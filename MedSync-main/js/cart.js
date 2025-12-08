// Delivery configuration
const DELIVERY_FEES = {
  cairo: 20,
  giza: 20,
  mansoura: 40,
  alexandria: 50
};

const RESERVATION_FEE = 50;

// Current delivery method state
let currentDeliveryMethod = 'delivery';
let currentDeliveryFee = 0;

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

  const drug = db.drugs.find((d) => d.id === listing.drugId);
  // Look in both companies and pharmacies for backwards compatibility
  let company = db.companies?.find((p) => p.id === listing.pharmacyId);
  if (!company && db.pharmacies) {
    company = db.pharmacies.find((p) => p.id === listing.pharmacyId);
  }

  if (existingItem) {
    existingItem.quantity += requestedQty;
  } else {
    cart.push({
      listingId,
      drugName: drug.name,
      pharmacyName: company?.name || 'Unknown',
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
  const deliveryOptionsCard = document.getElementById("deliveryOptionsCard");

  if (cart.length === 0) {
    container.innerHTML =
      '<p class="text-center text-muted py-4">Your cart is empty.</p>';
    document.getElementById("cart-subtotal").innerText = "0 EGP";
    document.getElementById("cart-total").innerText = "0 EGP";
    if (deliveryOptionsCard) deliveryOptionsCard.style.display = "none";
    return;
  }

  // Show delivery options when cart has items
  if (deliveryOptionsCard) deliveryOptionsCard.style.display = "block";

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
  updateOrderSummary();
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

function selectDeliveryMethod(method) {
  currentDeliveryMethod = method;

  // Update UI
  const deliveryOption = document.getElementById('deliveryOption');
  const pickupOption = document.getElementById('pickupOption');
  const deliveryFields = document.getElementById('deliveryFields');
  const pickupInfo = document.getElementById('pickupInfo');
  const deliveryFeeRow = document.getElementById('deliveryFeeRow');
  const reserveFeeRow = document.getElementById('reserveFeeRow');
  const remainingPayment = document.getElementById('remainingPayment');
  const checkoutBtnText = document.getElementById('checkoutBtnText');
  const totalLabel = document.getElementById('totalLabel');

  if (method === 'delivery') {
    deliveryOption.classList.add('active');
    pickupOption.classList.remove('active');
    deliveryFields.classList.add('show');
    pickupInfo.classList.remove('show');
    deliveryFeeRow.style.display = 'flex';
    reserveFeeRow.style.display = 'none';
    remainingPayment.style.display = 'none';
    checkoutBtnText.innerText = 'Checkout';
    totalLabel.innerText = 'Total';
  } else {
    pickupOption.classList.add('active');
    deliveryOption.classList.remove('active');
    pickupInfo.classList.add('show');
    deliveryFields.classList.remove('show');
    deliveryFeeRow.style.display = 'none';
    reserveFeeRow.style.display = 'flex';
    remainingPayment.style.display = 'block';
    checkoutBtnText.innerText = 'Pay Reservation & Reserve';
    totalLabel.innerText = 'Pay Now';
  }

  updateOrderSummary();
}

function updateDeliveryFee() {
  const citySelect = document.getElementById('citySelect');
  const selectedCity = citySelect.value;
  const deliveryFeeInfo = document.getElementById('deliveryFeeInfo');
  const deliveryFeeText = document.getElementById('deliveryFeeText');

  if (selectedCity && DELIVERY_FEES[selectedCity]) {
    currentDeliveryFee = DELIVERY_FEES[selectedCity];
    deliveryFeeInfo.style.display = 'block';
    deliveryFeeText.innerHTML = `<strong>${currentDeliveryFee} EGP</strong> delivery fee will be added for ${citySelect.options[citySelect.selectedIndex].text.split(' -')[0]}.`;
  } else {
    currentDeliveryFee = 0;
    deliveryFeeInfo.style.display = 'none';
  }

  updateOrderSummary();
}

function updateOrderSummary() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  let subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const cartDeliveryFee = document.getElementById('cart-delivery-fee');
  const cartReserveFee = document.getElementById('cart-reserve-fee');
  const cartTotal = document.getElementById('cart-total');
  const reserveFeeDisplay = document.getElementById('reserveFeeDisplay');
  const remainingAmount = document.getElementById('remainingAmount');

  if (currentDeliveryMethod === 'delivery') {
    cartDeliveryFee.innerText = formatCurrency(currentDeliveryFee);
    cartTotal.innerText = formatCurrency(subtotal + currentDeliveryFee);
  } else {
    // Pickup: Reserve fee is min of 50 or subtotal
    const reserveFee = Math.min(RESERVATION_FEE, subtotal);
    const remainingToPay = subtotal - reserveFee;

    cartReserveFee.innerText = formatCurrency(reserveFee);
    cartTotal.innerText = formatCurrency(reserveFee);
    reserveFeeDisplay.innerText = formatCurrency(reserveFee);
    remainingAmount.innerText = formatCurrency(remainingToPay);
  }
}

function validateDeliveryForm() {
  const phone = document.getElementById('phoneNumber').value.trim();
  const address = document.getElementById('streetAddress').value.trim();
  const city = document.getElementById('citySelect').value;
  const errorEl = document.getElementById('checkoutError');

  if (!phone) {
    errorEl.innerText = 'Please enter your phone number.';
    errorEl.style.display = 'block';
    document.getElementById('phoneNumber').focus();
    return false;
  }

  if (!address) {
    errorEl.innerText = 'Please enter your street address.';
    errorEl.style.display = 'block';
    document.getElementById('streetAddress').focus();
    return false;
  }

  if (!city) {
    errorEl.innerText = 'Please select your city.';
    errorEl.style.display = 'block';
    document.getElementById('citySelect').focus();
    return false;
  }

  errorEl.style.display = 'none';
  return true;
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
  const drug = db.drugs.find((d) => d.id === listing.drugId);
  // Look in both companies and pharmacies for backwards compatibility
  let company = db.companies?.find((p) => p.id === listing.pharmacyId);
  if (!company && db.pharmacies) {
    company = db.pharmacies.find((p) => p.id === listing.pharmacyId);
  }

  document.getElementById("modalDrugName").innerText = drug.name;
  document.getElementById(
    "modalPharmacyName"
  ).innerText = `sold by ${company?.name || 'Unknown'}`;
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

  // Validate delivery details if delivery method is selected
  if (currentDeliveryMethod === 'delivery') {
    if (!validateDeliveryForm()) {
      return;
    }
  }

  // Get delivery details
  const deliveryDetails = currentDeliveryMethod === 'delivery' ? {
    method: 'delivery',
    phone: document.getElementById('phoneNumber').value.trim(),
    address: document.getElementById('streetAddress').value.trim(),
    city: document.getElementById('citySelect').value,
    deliveryFee: currentDeliveryFee
  } : {
    method: 'pickup',
    reservationFee: Math.min(RESERVATION_FEE, cart.reduce((acc, item) => acc + (item.price * item.quantity), 0))
  };

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
      delivery: deliveryDetails,
      status: currentDeliveryMethod === 'pickup' ? 'reserved' : 'pending',
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

  if (currentDeliveryMethod === 'pickup') {
    showToast("Reservation confirmed! Pick up within 24 hours.", "success");
  } else {
    showToast("Order placed successfully!", "success");
  }

  // Redirect to marketplace or refresh
  setTimeout(() => {
    window.location.href = "marketplace.html";
  }, 1500);
}
