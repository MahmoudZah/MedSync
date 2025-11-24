function renderDashboard() {
  const userStr = localStorage.getItem("currentUser");
  if (!userStr) return;
  const user = JSON.parse(userStr);
  console.log(user);
  const tbody = document.getElementById("inventoryTableBody");
  if (!tbody) return;

  const listings = db.listings.filter((l) => l.pharmacyId === user.pharmacyId);
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
  //render expiring soon batches
  const expiringSoonBatches = listings.length > 0 ? listings.filter((l) => getExpiryStatus(l.expiryDate).class === "expiry-critical").length : 0;
  document.getElementById("expiringSoonBatches").innerText = expiringSoonBatches;

  //render pharmacy name
  const pharmacyName = db.pharmacies.find((p) => p.id === user.pharmacyId).name;
  document.getElementById("pharmacyName").innerText = pharmacyName;
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
