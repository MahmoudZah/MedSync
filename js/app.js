// MedSync Mock Data
// Mock Database
// In browsers, 'require' is not defined. Instead, fetch JSON using fetch API:

const defaultDb = {
  drugs: [
    {
      id: 1,
      name: "Augmentin 1g",
      generic: "Amoxicillin/Clavulanic Acid",
      category: "Antibiotics",
      image: "https://placehold.co/100x100/e0e0e0/333?text=Augmentin",
    },
    {
      id: 2,
      name: "Panadol Extra",
      generic: "Paracetamol/Caffeine",
      category: "Pain Killers",
      image: "https://placehold.co/100x100/e0e0e0/333?text=Panadol",
    },
    {
      id: 3,
      name: "Cataflam 50mg",
      generic: "Diclofenac Potassium",
      category: "Pain Killers",
      image: "https://placehold.co/100x100/e0e0e0/333?text=Cataflam",
    },
    {
      id: 4,
      name: "Insulin Lantus",
      generic: "Insulin Glargine",
      category: "Chronic Diseases",
      image: "https://placehold.co/100x100/e0e0e0/333?text=Insulin",
    },
    {
      id: 5,
      name: "Concor 5mg",
      generic: "Bisoprolol",
      category: "Chronic Diseases",
      image: "https://placehold.co/100x100/e0e0e0/333?text=Concor",
    },
  ],
  pharmacies: [
    {
      id: 101,
      name: "El Ezaby Pharmacy",
      location: "Maadi, Cairo",
      // distance: "1.2 km", // Removed distance
    },
    {
      id: 102,
      name: "Seif Pharmacy",
      location: "Nasr City, Cairo",
      // distance: "3.5 km",
    },
    {
      id: 103,
      name: "19011 Pharmacy",
      location: "Dokki, Giza",
      // distance: "5.0 km",
    },
  ],
  listings: [
    {
      id: 1,
      pharmacyId: 101,
      drugId: 1,
      quantity: 50,
      expiryDate: "2025-12-01",
      originalPrice: 90,
      discountPrice: 54,
      status: "Available",
    },
    {
      id: 2,
      pharmacyId: 102,
      drugId: 2,
      quantity: 120,
      expiryDate: "2026-03-15",
      originalPrice: 35,
      discountPrice: 25,
      status: "Available",
    },
    {
      id: 3,
      pharmacyId: 101,
      drugId: 4,
      quantity: 10,
      expiryDate: "2025-11-20",
      originalPrice: 600,
      discountPrice: 300,
      status: "Available",
    },
    {
      id: 4,
      pharmacyId: 103,
      drugId: 3,
      quantity: 200,
      expiryDate: "2026-08-01",
      originalPrice: 45,
      discountPrice: 40,
      status: "Available",
    },
  ],
  users: [
    {
      id: 1,
      name: "Dr. Ahmed",
      email: "pharmacy@test.com",
      password: "123",
      role: "pharmacy",
      license: "12345",
      pharmacyId: 101,
    },
    {
      id: 2,
      name: "Sarah User",
      email: "patient@test.com",
      password: "123",
      role: "patient",
    },
  ],
};

// Initialize DB from LocalStorage or Default
let db = JSON.parse(localStorage.getItem("medsync_db"));
if (!db) {
  db = defaultDb;
  localStorage.setItem("medsync_db", JSON.stringify(db));
}

function saveDb() {
  localStorage.setItem("medsync_db", JSON.stringify(db));
}
// --- AUTHENTICATION LOGIC ---

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;

  const user = db.users.find(
    (u) => u.email === email && u.password === password
  );
  if (!user) {
    showToast("Invalid email or password.", "error");
    return;
  }

  localStorage.setItem("currentUser", JSON.stringify(user));
  window.location.href =
    user.role === "pharmacy" ? "dashboard.html" : "index.html";
}

function handleSignup(event) {
  event.preventDefault();
  const email = document.getElementById("emailInput").value;
  const role = document.getElementById("roleInput").value;
  const name = `${document.getElementById("firstName").value} ${
    document.getElementById("lastName").value
  }`;

  if (db.users.find((u) => u.email === email)) {
    showToast("Email already exists.", "error");
    return;
  }

  const newUser = {
    id: db.users.length + 1,
    name: name,
    email: email,
    password: document.getElementById("passwordInput").value,
    role: role,
    license:
      role === "pharmacy"
        ? document.getElementById("licenseInput").value
        : null,
  };

  if (role === "pharmacy") {
    newUser.license = document.getElementById("licenseInput").value;
  }

  db.users.push(newUser);
  localStorage.setItem("currentUser", JSON.stringify(newUser));

  window.location.href = role === "pharmacy" ? "dashboard.html" : "index.html";
}

function checkAuthStatus() {
  const userStr = localStorage.getItem("currentUser");
  if (!userStr) return;

  const user = JSON.parse(userStr);
  const navAuthSection = document.querySelector(".navbar-nav .ms-lg-3");

  if (navAuthSection) {
    navAuthSection.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-person-circle me-2"></i>${user.name}
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    ${
                      user.role === "pharmacy"
                        ? '<li><a class="dropdown-item" href="dashboard.html">Dashboard</a></li>'
                        : ""
                    }
                    <li><a class="dropdown-item text-danger" href="#" onclick="logout()">Logout</a></li>
                </ul>
            </div>
        `;
  }
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

// --- CART LOGIC ---

function addToCart(listingId, quantity) {
  const listing = db.listings.find((l) => l.id === listingId);
  if (!listing) return;

  const drug = db.drugs.find((d) => d.id === listing.drugId);
  const pharmacy = db.pharmacies.find((p) => p.id === listing.pharmacyId);

  let cart = JSON.parse(localStorage.getItem("cart") || "[]");

  const existingItem = cart.find((item) => item.listingId === listingId);
  if (existingItem) {
    existingItem.quantity += parseInt(quantity);
  } else {
    cart.push({
      listingId,
      drugName: drug.name,
      pharmacyName: pharmacy.name,
      price: listing.discountPrice,
      quantity: parseInt(quantity),
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
                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" id="cartCount" style="display: none;">
                    0
                </span>
            </a>
          `;
      navAuthSection.parentNode.insertBefore(div, navAuthSection);
      cartBtn = document.getElementById("cartBtn");
    }

    const badge = document.getElementById("cartCount");
    if (badge) {
      badge.innerText = count;
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
                <img src="${
                  item.image
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
  const drug = db.drugs.find((d) => d.id === listing.drugId);
  const pharmacy = db.pharmacies.find((p) => p.id === listing.pharmacyId);

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

// --- UTILITIES ---

function showToast(message, type = "info") {
  // Types: success, error, warning, info
  let backgroundColor;
  switch (type) {
    case "success":
      backgroundColor = "#2ecc71"; // Green
      break;
    case "error":
      backgroundColor = "#e74c3c"; // Red
      break;
    case "warning":
      backgroundColor = "#f1c40f"; // Yellow
      break;
    default:
      backgroundColor = "#3498db"; // Blue
  }

  Toastify({
    text: message,
    duration: 3000,
    gravity: "top", // `top` or `bottom`
    position: "right", // `left`, `center` or `right`
    backgroundColor: backgroundColor,
    stopOnFocus: true, // Prevents dismissing of toast on hover
  }).showToast();
}

function getExpiryStatus(dateString) {
  const today = new Date();
  const expiry = new Date(dateString);
  const diffMonths = (expiry - today) / (1000 * 60 * 60 * 24 * 30);

  if (diffMonths <= 3)
    return {
      label: "Critical",
      class: "expiry-critical",
      text: "Expires soon",
    };
  if (diffMonths <= 6)
    return { label: "Warning", class: "expiry-warning", text: "Expires < 6mo" };
  return { label: "Good", class: "expiry-good", text: "Long Expiry" };
}

function formatCurrency(amount) {
  return `${amount} EGP`;
}

// --- RENDER LOGIC ---

function renderListings(containerId, limit = null, listingsData = db.listings) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let listings = listingsData;
  if (limit) listings = listings.slice(0, limit);

  if (listings.length === 0) {
    container.innerHTML =
      '<div class="col-12 text-center py-5"><p class="text-muted">No medicines found matching your criteria.</p></div>';
    return;
  }

  container.innerHTML = listings
    .map((listing) => {
      const drug = db.drugs.find((d) => d.id === listing.drugId);
      const pharmacy = db.pharmacies.find((p) => p.id === listing.pharmacyId);
      const expiryStatus = getExpiryStatus(listing.expiryDate);

      return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <span class="expiry-badge ${expiryStatus.class}">${
        expiryStatus.text
      }</span>
                            <small class="text-muted">${
                              listing.quantity
                            } left</small>
                        </div>
                        <h5 class="card-title mb-1">${drug.name}</h5>
                        <p class="text-muted small mb-3">${drug.generic}</p>
                        
                        <div class="d-flex align-items-center mb-3">
                            <i class="bi bi-geo-alt me-2 text-primary-blue"></i>
                            <small>${pharmacy.name}</small>
                        </div>

                        <div class="d-flex justify-content-between align-items-end mt-3">
                            <div>
                                <small class="text-muted text-decoration-line-through d-block">${formatCurrency(
                                  listing.originalPrice
                                )}</small>
                                <span class="text-secondary-green fw-bold fs-5">${formatCurrency(
                                  listing.discountPrice
                                )}</span>
                            </div>
                            <button class="btn btn-sm btn-outline-primary" onclick="openReserveModal(${
                              listing.id
                            })">Reserve</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    })
    .join("");
}

function applyFilters() {
  const location = document.getElementById("locationFilter").value;
  const searchInput = document.getElementById("searchInput");
  const search = searchInput ? searchInput.value.toLowerCase() : "";

  const expiryCheckboxes = document.querySelectorAll(".expiry-filter:checked");
  const expiryValues = Array.from(expiryCheckboxes).map((cb) =>
    parseInt(cb.value)
  );

  const categoryCheckboxes = document.querySelectorAll(
    ".category-filter:checked"
  );
  const categories = Array.from(categoryCheckboxes).map((cb) => cb.value);

  const filtered = db.listings.filter((listing) => {
    const drug = db.drugs.find((d) => d.id === listing.drugId);
    const pharmacy = db.pharmacies.find((p) => p.id === listing.pharmacyId);

    // Location Filter
    if (location && !pharmacy.location.includes(location)) return false;

    // Search Filter
    if (
      search &&
      !drug.name.toLowerCase().includes(search) &&
      !drug.generic.toLowerCase().includes(search)
    )
      return false;

    // Category Filter
    if (categories.length > 0 && !categories.includes(drug.category))
      return false;

    // Expiry Filter
    if (expiryValues.length > 0) {
      const today = new Date();
      const expiry = new Date(listing.expiryDate);
      const diffMonths = (expiry - today) / (1000 * 60 * 60 * 24 * 30);

      let matchesExpiry = false;
      if (expiryValues.includes(3) && diffMonths <= 3) matchesExpiry = true;
      if (expiryValues.includes(6) && diffMonths > 3 && diffMonths <= 6)
        matchesExpiry = true;

      if (!matchesExpiry) return false;
    }

    return true;
  });

  renderListings("all-listings", null, filtered);
}

function handleHomeSearch() {
  const input = document.getElementById("homeSearchInput");
  if (input && input.value.trim()) {
    window.location.href = `marketplace.html?search=${encodeURIComponent(
      input.value.trim()
    )}`;
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // 1. Check if user is logged in and update UI
  checkAuthStatus();

  // 2. Bind Login Form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  // 3. Bind Signup Form
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup);
  }

  // 4. Render Listings (only if on a page that needs them)
  if (
    document.getElementById("featured-listings") ||
    document.getElementById("all-listings")
  ) {
    renderListings("featured-listings", 4);
    // On marketplace page, we might filter based on URL params, so we wait for step 6
    if (!document.getElementById("searchInput")) {
      renderListings("all-listings");
    }
  }

  // Render Cart if on cart page
  if (document.getElementById("cart-items")) {
    renderCart();
  }

  // Update cart count on load
  updateCartCount();

  // 5. Bind Filters
  const applyFiltersBtn = document.getElementById("applyFiltersBtn");
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener("click", applyFilters);
  }

  const searchBtn = document.getElementById("searchBtn");
  if (searchBtn) {
    searchBtn.addEventListener("click", applyFilters);
  }

  // 6. Handle URL Search Params (for Marketplace)
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get("search");
  const searchInput = document.getElementById("searchInput");

  if (searchInput && searchParam) {
    searchInput.value = searchParam;
    applyFilters();
  } else if (document.getElementById("all-listings")) {
    // If no search param, render all
    renderListings("all-listings");
  }

  // 7. Bind Home Search
  const homeSearchBtn = document.getElementById("homeSearchBtn");
  if (homeSearchBtn) {
    homeSearchBtn.addEventListener("click", handleHomeSearch);
  }

  // Allow pressing Enter in home search
  const homeInput = document.getElementById("homeSearchInput");
  if (homeInput) {
    homeInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleHomeSearch();
    });
  }

  // Dashboard Initialization
  if (document.getElementById("inventoryTableBody")) {
    renderDashboard();
    // Populate Add Batch Modal Drugs
    const select = document.getElementById("newDrugId");
    if (select) {
      select.innerHTML = db.drugs
        .map((d) => `<option value="${d.id}">${d.name}</option>`)
        .join("");
    }
  }
});

// --- DASHBOARD LOGIC ---

function renderDashboard() {
  const userStr = localStorage.getItem("currentUser");
  if (!userStr) return;
  const user = JSON.parse(userStr);

  // Mock linking user to pharmacyId 101 if not set, or use user.pharmacyId
  const pharmacyId = user.pharmacyId || 101;

  const tbody = document.getElementById("inventoryTableBody");
  if (!tbody) return;

  const listings = db.listings.filter((l) => l.pharmacyId === pharmacyId);
  tbody.innerHTML = listings
    .map((listing) => {
      const drug = db.drugs.find((d) => d.id === listing.drugId);
      const expiryStatus = getExpiryStatus(listing.expiryDate);

      return `
            <tr>
                <td class="ps-4">
                    <div class="fw-bold">${drug.name}</div>
                    <small class="text-muted">${drug.generic}</small>
                </td>
                <td>#BATCH-${listing.id}</td>
                <td>
                    <span class="expiry-badge ${expiryStatus.class}">${listing.expiryDate}</span>
                </td>
                <td>
                    <span class="badge bg-success bg-opacity-10 text-success">Active</span>
                </td>
                <td>${listing.quantity}</td>
                <td>
                    <span class="text-decoration-line-through text-muted me-2">${listing.originalPrice}</span>
                    ${listing.discountPrice} EGP
                </td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-light text-danger" onclick="deleteListing(${listing.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    })
    .join("");
}

function handleAddBatch() {
  const userStr = localStorage.getItem("currentUser");
  if (!userStr) return;
  const user = JSON.parse(userStr);
  const pharmacyId = user.pharmacyId || 101;

  const drugId = parseInt(document.getElementById("newDrugId").value);
  const quantity = parseInt(document.getElementById("newQuantity").value);
  const expiryDate = document.getElementById("newExpiryDate").value;
  const originalPrice = parseFloat(
    document.getElementById("newOriginalPrice").value
  );
  const discountPrice = parseFloat(
    document.getElementById("newDiscountPrice").value
  );

  if (!drugId || !quantity || !expiryDate || !originalPrice || !discountPrice) {
    showToast("Please fill all fields", "error");
    return;
  }

  const newListing = {
    id:
      db.listings.length > 0
        ? Math.max(...db.listings.map((l) => l.id)) + 1
        : 1,
    pharmacyId: pharmacyId,
    drugId: drugId,
    quantity: quantity,
    expiryDate: expiryDate,
    originalPrice: originalPrice,
    discountPrice: discountPrice,
    status: "Active",
  };

  db.listings.push(newListing);
  saveDb();

  // Close modal
  const modalEl = document.getElementById("addBatchModal");
  const modal = bootstrap.Modal.getInstance(modalEl);
  if (modal) modal.hide();

  // Reset Form
  document.getElementById("addBatchForm").reset();

  showToast("Batch added successfully!", "success");
  renderDashboard();
}

function deleteListing(id) {
  if (confirm("Are you sure you want to delete this listing?")) {
    db.listings = db.listings.filter((l) => l.id !== id);
    saveDb();
    renderDashboard();
    showToast("Listing deleted.", "info");
  }
}
