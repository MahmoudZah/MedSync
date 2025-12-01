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
    },
    {
      id: 102,
      name: "Seif Pharmacy",
      location: "Nasr City, Cairo",
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
      pharmacyId: 101,
      drugId: 4,
      quantity: 10,
      expiryDate: "2025-12-15",
      originalPrice: 600,
      discountPrice: 300,
      status: "Available",
    },
    {
      id: 3,
      pharmacyId: 102,
      drugId: 2,
      quantity: 100,
      expiryDate: "2026-03-01",
      originalPrice: 45,
      discountPrice: 30,
      status: "Available",
    },
  ],
  orders: [
    {
      id: 1,
      pharmacyId: 101,
      buyerId: 2,
      items: [{ listingId: 1, drugId: 1, quantity: 5, price: 54 }],
      total: 270,
      status: "completed",
      createdAt: "2025-11-15T10:30:00Z",
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
    {
      id: 3,
      name: "Dr. Mohamed",
      email: "pharmacy2@test.com",
      password: "123",
      role: "pharmacy",
      license: "67890",
      pharmacyId: 102,
    },
  ],
};

// Initialize DB from LocalStorage or Default
let db = JSON.parse(localStorage.getItem("medsync_db"));
if (!db) {
  db = defaultDb;
  localStorage.setItem("medsync_db", JSON.stringify(db));
} else {
  // Ensure orders array exists for older saved data
  if (!db.orders) {
    db.orders = [];
    localStorage.setItem("medsync_db", JSON.stringify(db));
  }
}

function saveDb() {
  localStorage.setItem("medsync_db", JSON.stringify(db));
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

  // Filter out sold out items
  let listings = listingsData.filter(
    (l) => l.quantity > 0 && l.status !== "Sold Out"
  );
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
    // Filter out sold out items
    if (listing.quantity <= 0 || listing.status === "Sold Out") return false;

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
    // Update orders badge
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      const user = JSON.parse(userStr);
      const pendingOrders = db.orders.filter(
        (o) => o.pharmacyId === user.pharmacyId && o.status === "pending"
      );
      const ordersBadge = document.getElementById("ordersBadge");
      if (ordersBadge) {
        ordersBadge.textContent = pendingOrders.length;
        ordersBadge.style.display =
          pendingOrders.length > 0 ? "inline" : "none";
      }
    }
  }
});
