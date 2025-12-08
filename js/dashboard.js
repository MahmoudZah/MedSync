// Dashboard state
let currentView = "dashboard";
let currentPage = 1;
const itemsPerPage = 10;

function switchView(view) {
  currentView = view;
  currentPage = 1; // Reset pagination when switching views

  // Update active sidebar link
  document.querySelectorAll(".sidebar-link").forEach((link) => {
    link.classList.remove("active");
  });
  event.target.closest(".sidebar-link").classList.add("active");

  // Update page title
  const pageTitle = document.getElementById("pageTitle");
  const addBatchBtn = document.getElementById("addBatchBtn");

  if (view === "dashboard") {
    pageTitle.textContent = "Dashboard";
    addBatchBtn.style.display = "inline-block";
    document.getElementById("statsSection").style.display = "flex";
    document.getElementById("inventorySection").style.display = "block";
    document.getElementById("ordersSection").style.display = "none";
  } else if (view === "inventory") {
    pageTitle.textContent = "My Inventory";
    addBatchBtn.style.display = "inline-block";
    document.getElementById("statsSection").style.display = "none";
    document.getElementById("inventorySection").style.display = "block";
    document.getElementById("ordersSection").style.display = "none";
  } else if (view === "orders") {
    pageTitle.textContent = "Orders";
    addBatchBtn.style.display = "none";
    document.getElementById("statsSection").style.display = "none";
    document.getElementById("inventorySection").style.display = "none";
    document.getElementById("ordersSection").style.display = "block";
    renderOrders();
  }

  renderDashboard();
}

function calculateDashboardStats(pharmacyId) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  // Get pharmacy orders
  const pharmacyOrders = db.orders.filter((o) => o.pharmacyId === pharmacyId);

  // Calculate total sales this month
  const thisMonthOrders = pharmacyOrders.filter((o) => {
    const orderDate = new Date(o.createdAt);
    return (
      orderDate.getMonth() === thisMonth && orderDate.getFullYear() === thisYear
    );
  });
  const totalSales = thisMonthOrders.reduce((sum, o) => sum + o.total, 0);

  // Calculate potential waste saved (difference between original and discount prices for sold items)
  let wasteSaved = 0;
  pharmacyOrders.forEach((order) => {
    order.items.forEach((item) => {
      const listing = db.listings.find((l) => l.id === item.listingId);
      if (listing) {
        wasteSaved +=
          (listing.originalPrice - listing.discountPrice) * item.quantity;
      }
    });
  });

  // Get expiring soon batches (< 30 days)
  const listings = db.listings.filter(
    (l) => l.pharmacyId === pharmacyId && l.quantity > 0
  );
  const expiringSoon = listings.filter((l) => {
    const expiry = new Date(l.expiryDate);
    const diffDays = (expiry - now) / (1000 * 60 * 60 * 24);
    return diffDays <= 30 && diffDays > 0;
  }).length;

  return { totalSales, wasteSaved, expiringSoon };
}

function renderDashboard() {
  const userStr = localStorage.getItem("currentUser");
  if (!userStr) return;
  const user = JSON.parse(userStr);

  // Render pharmacy name
  const pharmacy = db.pharmacies.find((p) => p.id === user.pharmacyId);
  if (pharmacy) {
    document.getElementById("pharmacyName").innerText = pharmacy.name;
  }

  // Calculate and render stats
  const stats = calculateDashboardStats(user.pharmacyId);
  document.getElementById(
    "totalSales"
  ).innerText = `${stats.totalSales.toLocaleString()} EGP`;
  document.getElementById(
    "potentialWasteSaved"
  ).innerText = `${stats.wasteSaved.toLocaleString()} EGP`;
  document.getElementById(
    "expiringSoonBatches"
  ).innerText = `${stats.expiringSoon} Batches`;

  // Render inventory table
  renderInventoryTable(user.pharmacyId);
}

function renderInventoryTable(pharmacyId) {
  const tbody = document.getElementById("inventoryTableBody");
  if (!tbody) return;

  const allListings = db.listings.filter((l) => l.pharmacyId === pharmacyId);

  if (allListings.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4 text-muted">
          <i class="bi bi-inbox fs-1 d-block mb-2"></i>
          No items in inventory. Add your first batch!
        </td>
      </tr>
    `;
    hidePagination();
    hideViewAllLink();
    return;
  }

  let listings;

  if (currentView === "dashboard") {
    // Show only first 5 items in dashboard
    listings = allListings.slice(0, 5);
    hidePagination();
    // Show "View All" link if more than 5 items
    if (allListings.length > 5) {
      showViewAllLink(allListings.length);
    } else {
      hideViewAllLink();
    }
  } else {
    // Inventory view with pagination
    hideViewAllLink();
    const totalPages = Math.ceil(allListings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    listings = allListings.slice(startIndex, endIndex);
    renderPagination(totalPages, allListings.length);
  }

  tbody.innerHTML = listings
    .map((listing) => {
      const drug = db.drugs.find((d) => d.id === parseInt(listing.drugId));
      if (!drug) return ''; // Skip if drug not found
      const expiryStatus = getExpiryStatus(listing.expiryDate);
      const statusBadge =
        listing.quantity <= 0
          ? '<span class="badge bg-danger bg-opacity-10 text-danger">Sold Out</span>'
          : listing.quantity <= 10
            ? '<span class="badge bg-warning bg-opacity-10 text-warning">Low Stock</span>'
            : '<span class="badge bg-success bg-opacity-10 text-success">Active</span>';

      return `
        <tr class="${listing.quantity <= 0 ? "table-secondary" : ""}">
          <td class="ps-4">
            <div class="fw-bold">${drug.name}</div>
            <small class="text-muted">${drug.generic}</small>
          </td>
          <td><code>#BATCH-${String(listing.id).padStart(4, "0")}</code></td>
          <td>
            <span class="expiry-badge ${expiryStatus.class}">${listing.expiryDate
        }</span>
          </td>
          <td>${statusBadge}</td>
          <td>
            <span class="${listing.quantity <= 10 ? "text-warning fw-bold" : ""
        }">${listing.quantity}</span>
          </td>
          <td>
            <span class="text-decoration-line-through text-muted me-2">${listing.originalPrice
        }</span>
            <span class="text-success fw-bold">${listing.discountPrice
        } EGP</span>
          </td>
          <td class="text-end pe-4">
            <button class="btn btn-sm btn-light" onclick="editListing(${listing.id
        })" title="Edit">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-light text-danger" onclick="deleteListing(${listing.id
        })" title="Delete">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function showViewAllLink(totalCount) {
  let viewAllContainer = document.getElementById("viewAllContainer");
  if (!viewAllContainer) {
    const inventorySection = document.getElementById("inventorySection");
    viewAllContainer = document.createElement("div");
    viewAllContainer.id = "viewAllContainer";
    viewAllContainer.className = "card-footer bg-white text-center py-3";
    inventorySection.appendChild(viewAllContainer);
  }
  viewAllContainer.innerHTML = `
    <a href="#" class="text-primary text-decoration-none" onclick="goToInventory(); return false;">
      View all ${totalCount} items <i class="bi bi-arrow-right"></i>
    </a>
  `;
  viewAllContainer.style.display = "block";
}

function hideViewAllLink() {
  const viewAllContainer = document.getElementById("viewAllContainer");
  if (viewAllContainer) {
    viewAllContainer.style.display = "none";
  }
}

function goToInventory() {
  currentView = "inventory";
  currentPage = 1;

  // Update sidebar active state
  document.querySelectorAll(".sidebar-link").forEach((link) => {
    link.classList.remove("active");
    if (link.textContent.includes("My Inventory")) {
      link.classList.add("active");
    }
  });

  // Update UI
  document.getElementById("pageTitle").textContent = "My Inventory";
  document.getElementById("statsSection").style.display = "none";

  renderDashboard();
}

function renderPagination(totalPages, totalItems) {
  let paginationContainer = document.getElementById("paginationContainer");
  if (!paginationContainer) {
    const inventorySection = document.getElementById("inventorySection");
    paginationContainer = document.createElement("div");
    paginationContainer.id = "paginationContainer";
    paginationContainer.className =
      "card-footer bg-white d-flex justify-content-between align-items-center py-3";
    inventorySection.appendChild(paginationContainer);
  }

  if (totalPages <= 1) {
    paginationContainer.innerHTML = `<small class="text-muted">Showing all ${totalItems} items</small>`;
    return;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  let pagesHtml = "";
  for (let i = 1; i <= totalPages; i++) {
    pagesHtml += `
      <li class="page-item ${i === currentPage ? "active" : ""}">
        <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
      </li>
    `;
  }

  paginationContainer.innerHTML = `
    <small class="text-muted">Showing ${startItem}-${endItem} of ${totalItems} items</small>
    <nav>
      <ul class="pagination pagination-sm mb-0">
        <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
          <a class="page-link" href="#" onclick="changePage(${currentPage - 1
    }); return false;">
            <i class="bi bi-chevron-left"></i>
          </a>
        </li>
        ${pagesHtml}
        <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
          <a class="page-link" href="#" onclick="changePage(${currentPage + 1
    }); return false;">
            <i class="bi bi-chevron-right"></i>
          </a>
        </li>
      </ul>
    </nav>
  `;
  paginationContainer.style.display = "flex";
}

function hidePagination() {
  const paginationContainer = document.getElementById("paginationContainer");
  if (paginationContainer) {
    paginationContainer.style.display = "none";
  }
}

function changePage(page) {
  const userStr = localStorage.getItem("currentUser");
  if (!userStr) return;
  const user = JSON.parse(userStr);

  const totalItems = db.listings.filter(
    (l) => l.pharmacyId === user.pharmacyId
  ).length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (page < 1 || page > totalPages) return;

  currentPage = page;
  renderInventoryTable(user.pharmacyId);
}

function renderOrders() {
  const userStr = localStorage.getItem("currentUser");
  if (!userStr) return;
  const user = JSON.parse(userStr);

  const ordersContainer = document.getElementById("ordersTableBody");
  if (!ordersContainer) return;

  const orders = db.orders.filter((o) => o.pharmacyId === user.pharmacyId);

  if (orders.length === 0) {
    ordersContainer.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-4 text-muted">
          <i class="bi bi-bag fs-1 d-block mb-2"></i>
          No orders yet.
        </td>
      </tr>
    `;
    return;
  }

  ordersContainer.innerHTML = orders
    .map((order) => {
      const itemsText = order.items
        .map((item) => {
          const drug = db.drugs.find((d) => d.id === item.drugId);
          return `${drug ? drug.name : "Unknown"} x${item.quantity}`;
        })
        .join(", ");

      const statusClass =
        {
          pending: "bg-warning",
          completed: "bg-success",
          cancelled: "bg-danger",
        }[order.status] || "bg-secondary";

      const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      return `
      <tr>
        <td class="ps-4"><code>#ORD-${String(order.id).padStart(
        4,
        "0"
      )}</code></td>
        <td>${order.buyerName || "Customer"}</td>
        <td>
          <small>${itemsText}</small>
        </td>
        <td><span class="fw-bold text-success">${order.total} EGP</span></td>
        <td>
          <span class="badge ${statusClass}">${order.status}</span>
        </td>
        <td>${orderDate}</td>
        <td class="text-end pe-4">
          ${order.status === "pending"
          ? `
            <button class="btn btn-sm btn-success" onclick="updateOrderStatus(${order.id}, 'completed')" title="Mark Complete">
              <i class="bi bi-check-lg"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="updateOrderStatus(${order.id}, 'cancelled')" title="Cancel">
              <i class="bi bi-x-lg"></i>
            </button>
          `
          : ""
        }
        </td>
      </tr>
    `;
    })
    .join("");

  // Update orders badge
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const ordersBadge = document.getElementById("ordersBadge");
  if (ordersBadge) {
    ordersBadge.textContent = pendingCount;
    ordersBadge.style.display = pendingCount > 0 ? "inline" : "none";
  }
}

function updateOrderStatus(orderId, status) {
  const order = db.orders.find((o) => o.id === orderId);
  if (order) {
    order.status = status;
    saveDb();
    renderOrders();
    renderDashboard();
    showToast(`Order ${status}!`, status === "completed" ? "success" : "info");
  }
}

function calculateDiscountPrice() {
  const expiryDate = document.getElementById("newExpiryDate").value;
  const originalPrice = parseFloat(
    document.getElementById("newOriginalPrice").value
  );
  const discountSection = document.getElementById("discountCalculation");

  if (!expiryDate || !originalPrice || originalPrice <= 0) {
    discountSection.style.display = "none";
    return;
  }

  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffMonths = (expiry - today) / (1000 * 60 * 60 * 24 * 30);

  // Check if expiry date is in the past
  if (diffMonths < 0) {
    discountSection.style.display = "block";
    document.getElementById("shelfLifeDisplay").textContent = "EXPIRED";
    document.getElementById("shelfLifeDisplay").className = "badge bg-danger";
    document.getElementById("discountPercentDisplay").textContent =
      "Cannot list";
    document.getElementById("autoDiscountDisplay").textContent = "-";
    document.getElementById("newDiscountPrice").value = "";
    return;
  }

  let discountPercent;
  let shelfLifeText;
  let shelfLifeClass;

  if (diffMonths <= 3) {
    // Less than 3 months - 40% discount
    discountPercent = 40;
    shelfLifeText = `${Math.ceil(diffMonths)} month(s)`;
    shelfLifeClass = "badge bg-danger";
  } else if (diffMonths <= 6) {
    // 3-6 months - 25% discount
    discountPercent = 25;
    shelfLifeText = `${Math.ceil(diffMonths)} months`;
    shelfLifeClass = "badge bg-warning text-dark";
  } else {
    // More than 6 months - 10% discount
    discountPercent = 10;
    shelfLifeText = `${Math.ceil(diffMonths)} months`;
    shelfLifeClass = "badge bg-success";
  }

  const discountPrice = Math.round(originalPrice * (1 - discountPercent / 100));

  // Update UI
  discountSection.style.display = "block";
  document.getElementById("shelfLifeDisplay").textContent = shelfLifeText;
  document.getElementById("shelfLifeDisplay").className = shelfLifeClass;
  document.getElementById(
    "discountPercentDisplay"
  ).textContent = `${discountPercent}% off`;
  document.getElementById(
    "autoDiscountDisplay"
  ).textContent = `${discountPrice} EGP`;
  document.getElementById("newDiscountPrice").value = discountPrice;
}

function handleAddBatch() {
  const userStr = localStorage.getItem("currentUser");
  if (!userStr) return;
  const user = JSON.parse(userStr);
  const pharmacyId = user.pharmacyId;
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

  // Check if expiry date is in the past
  const today = new Date();
  const expiry = new Date(expiryDate);
  if (expiry < today) {
    showToast("Cannot add expired items", "error");
    return;
  }

  if (discountPrice >= originalPrice) {
    showToast("Discount price must be less than original price", "error");
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
    status: "Available",
  };

  db.listings.push(newListing);
  saveDb();

  // Close modal
  const modalEl = document.getElementById("addBatchModal");
  const modal = bootstrap.Modal.getInstance(modalEl);
  if (modal) modal.hide();

  // Reset Form
  document.getElementById("addBatchForm").reset();
  document.getElementById("discountCalculation").style.display = "none";

  showToast("Batch added successfully!", "success");
  renderDashboard();
}

function editListing(id) {
  const listing = db.listings.find((l) => l.id === id);
  if (!listing) return;

  const drug = db.drugs.find((d) => d.id === parseInt(listing.drugId));

  // Populate edit modal
  document.getElementById("editListingId").value = listing.id;
  document.getElementById("editDrugName").value = drug ? drug.name : "";
  document.getElementById("editQuantity").value = listing.quantity;
  document.getElementById("editExpiryDate").value = listing.expiryDate;
  document.getElementById("editOriginalPrice").value = listing.originalPrice;
  document.getElementById("editDiscountPrice").value = listing.discountPrice;

  const modal = new bootstrap.Modal(document.getElementById("editBatchModal"));
  modal.show();
}

function handleEditBatch() {
  const id = parseInt(document.getElementById("editListingId").value);
  const listing = db.listings.find((l) => l.id === id);
  if (!listing) return;

  listing.quantity = parseInt(document.getElementById("editQuantity").value);
  listing.expiryDate = document.getElementById("editExpiryDate").value;
  listing.originalPrice = parseFloat(
    document.getElementById("editOriginalPrice").value
  );
  listing.discountPrice = parseFloat(
    document.getElementById("editDiscountPrice").value
  );

  if (listing.quantity > 0) {
    listing.status = "Available";
  }

  saveDb();

  // Close modal
  const modalEl = document.getElementById("editBatchModal");
  const modal = bootstrap.Modal.getInstance(modalEl);
  if (modal) modal.hide();

  showToast("Batch updated successfully!", "success");
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

function filterInventory() {
  const searchTerm = document
    .getElementById("inventorySearch")
    .value.toLowerCase();
  const rows = document.querySelectorAll("#inventoryTableBody tr");

  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? "" : "none";
  });
}

// Logout function is in auth.js
