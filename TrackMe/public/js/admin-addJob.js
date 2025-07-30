import API_BASE_URL from './config.js';
let currentJobId = "";
let itiInstances = {};


// Populate the courier dropdown from server
async function populateCourierDropdown() {
    const select = document.getElementById('courierSelect');
    if (!select) return;

    select.querySelectorAll("option:not(:first-child)").forEach(o => o.remove());

    try {
        const res = await fetch(`${API_BASE_URL}/api/couriers`);
        const couriers = await res.json();
        couriers.forEach(courier => {
            const option = document.createElement("option");
            option.value = courier._id;
            option.textContent = courier.fullName;
            select.appendChild(option);
        });
    } catch (err) {
        console.error("Failed to load couriers:", err);
    }
}

// Enable editing of the job fields
function enableEditing() {
    document.querySelectorAll(".job-details__value").forEach(el => {
        const input = document.createElement("input");
        input.type = "text";
        input.className = "editable-field";
        input.value = el.textContent || "";

        if (el.closest(".job-details--pickup") && el.previousElementSibling?.textContent.includes("Address")) {
            input.id = "pickupAddress";
        }
        if (el.closest(".job-details--delivery") && el.previousElementSibling?.textContent.includes("Address")) {
            input.id = "deliveryAddress";
        }

        el.replaceWith(input);
    });

    if (!document.getElementById("createJob")) {
        const createBtn = document.createElement("section");
        createBtn.className = "action-button";
        createBtn.id = "createJob";
        createBtn.innerHTML = `<img src="assets/icons/save.svg" alt="Save" /><span>Create Job</span>`;
        document.querySelector(".job-header__actions").appendChild(createBtn);

        createBtn.addEventListener("click", () => {
            showConfirmationPopup("Create this job?", () => {
                submitJob();
            });
        });
    }
}

// Show a confirmation popup with a callback
function showConfirmationPopup(message, onConfirm, color = "blue") {
    const overlay = document.createElement("section");
    overlay.className = "popup-overlay";
    overlay.innerHTML = `
        <section class="popup-dialog popup-${color}">
            <section class="popup-message">${message}</section>
            <section class="popup-actions">
                <button class="popup-confirm">Confirm</button>
                <button class="popup-cancel">Cancel</button>
            </section>
        </section>`;
    document.body.appendChild(overlay);

    overlay.querySelector(".popup-cancel")?.addEventListener("click", () => overlay.remove());
    overlay.querySelector(".popup-confirm")?.addEventListener("click", () => {
        onConfirm();
        overlay.remove();
    });
}

// Show a notification toast
function showToast(text, color = "blue") {
    const toast = document.createElement("section");
    toast.className = `popup-toast toast-${color}`;
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// === Google Places autocomplete AND save lat/lng ===
function initGoogleAddressAutocomplete() {
    // Pickup
    const pickupInput = document.getElementById("pickupAddress");
    const pickupLat = document.getElementById("pickupLat");
    const pickupLng = document.getElementById("pickupLng");
    if (pickupInput && pickupLat && pickupLng && window.google) {
        const auto1 = new google.maps.places.Autocomplete(pickupInput, { types: ["geocode"] });
        auto1.addListener('place_changed', function() {
            const place = auto1.getPlace();
            if (place && place.geometry) {
                pickupLat.value = place.geometry.location.lat();
                pickupLng.value = place.geometry.location.lng();
            } else {
                pickupLat.value = "";
                pickupLng.value = "";
            }
        });
    }

    // Delivery
    const deliveryInput = document.getElementById("deliveryAddress");
    const deliveryLat = document.getElementById("deliveryLat");
    const deliveryLng = document.getElementById("deliveryLng");
    if (deliveryInput && deliveryLat && deliveryLng && window.google) {
        const auto2 = new google.maps.places.Autocomplete(deliveryInput, { types: ["geocode"] });
        auto2.addListener('place_changed', function() {
            const place = auto2.getPlace();
            if (place && place.geometry) {
                deliveryLat.value = place.geometry.location.lat();
                deliveryLng.value = place.geometry.location.lng();
            } else {
                deliveryLat.value = "";
                deliveryLng.value = "";
            }
        });
    }
}


async function getLatLngFromAddress(address) {
    return new Promise((resolve, reject) => {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address }, (results, status) => {
            if (status === "OK" && results[0]) {
                const loc = results[0].geometry.location;
                resolve({ lat: loc.lat(), lng: loc.lng() });
            } else {
                resolve({ lat: "", lng: "" }); 
            }
        });
    });
}

async function submitJob() {
    const courierId = document.getElementById('courierSelect').value;
    if (!courierId) {
        showToast("Please select a courier", "red");
        return;
    }

    const formData = new FormData();
    formData.append("courier", courierId);

    // --- Pickup ---
    const pickupAddress = document.getElementById('pickupAddress')?.value || "";
    let pickupLat = document.getElementById('pickupLat')?.value || "";
    let pickupLng = document.getElementById('pickupLng')?.value || "";

    if ((!pickupLat || !pickupLng) && pickupAddress) {
        const coords = await getLatLngFromAddress(pickupAddress);
        pickupLat = coords.lat;
        pickupLng = coords.lng;
    }

    formData.append("pickupDate", document.getElementById('pickupDate').value);
    formData.append("pickupTime", document.getElementById('pickupTime').value);
    formData.append("pickupPhone", itiInstances['pickupPhone']?.getNumber() || "");
    formData.append("pickupAddress", pickupAddress);
    formData.append("pickupContact", document.getElementById('pickupContact')?.value || "");
    formData.append("pickupLat", pickupLat);
    formData.append("pickupLng", pickupLng);

    // --- Delivery ---
    const deliveryAddress = document.getElementById('deliveryAddress')?.value || "";
    let deliveryLat = document.getElementById('deliveryLat')?.value || "";
    let deliveryLng = document.getElementById('deliveryLng')?.value || "";

    if ((!deliveryLat || !deliveryLng) && deliveryAddress) {
        const coords = await getLatLngFromAddress(deliveryAddress);
        deliveryLat = coords.lat;
        deliveryLng = coords.lng;
    }

    formData.append("deliveryDate", document.getElementById('deliveryDate').value);
    formData.append("deliveryTime", document.getElementById('deliveryTime').value);
    formData.append("deliveryPhone", document.getElementById('deliveryPhone').value);
    formData.append("deliveryAddress", deliveryAddress);
    formData.append("deliveryContact", document.getElementById('deliveryContact')?.value || "");
    formData.append("deliveryLat", deliveryLat);
    formData.append("deliveryLng", deliveryLng);

    // --- Flight details ---
    formData.append("flightOutDate", document.getElementById('flightOutDate').value);
    formData.append("flightOutTime", document.getElementById('flightOutTime').value);
    formData.append("flightOutCode", document.getElementById('flightOutCode').value);

    formData.append("flightReturnDate", document.getElementById('flightReturnDate').value);
    formData.append("flightReturnTime", document.getElementById('flightReturnTime').value);
    formData.append("flightReturnCode", document.getElementById('flightReturnCode').value);

    formData.append("courierStatus", "waiting-for-pickup");
    formData.append("status", "Active");

    try {
        const res = await fetch(`${API_BASE_URL}/api/jobs`, {
            method: 'POST',
            body: formData
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Job creation failed');
        }

        const job = await res.json();
        showToast("✅ Job created successfully. Job ID: " + job.jobId, "blue");
        setTimeout(() => {
            window.location.href = "admin-jobs.html";
        }, 1000);
    } catch (err) {
        showToast("❌ Error: " + err.message, "red");
    }
}


// === INIT ===
document.addEventListener("DOMContentLoaded", () => {
    populateCourierDropdown();
    enableEditing();
    initGoogleAddressAutocomplete();

    // === Phone inputs init ===
    const phoneInputs = document.querySelectorAll("input[type='tel']");
    phoneInputs.forEach(input => {
        const iti = window.intlTelInput(input, {
            initialCountry: "il",
            preferredCountries: ["il", "us", "gb", "fr", "de"],
            utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@17/build/js/utils.js",
        });
        itiInstances[input.id] = iti; 
    });

    // === Upload Popup logic ===
    const uploadPopup = document.querySelector(".upload-popup");
    const uploadButton = document.querySelector("#uploadButton");
    const closeBtn = document.querySelector(".upload-popup .close-btn");
    const cancelBtn = document.querySelector(".upload-popup .cancel-upload");
    const fileInput = document.querySelector(".upload-popup input[type='file']");
    const sendBtn = document.querySelector(".upload-popup .send-document");
    const uploadBox = document.querySelector(".upload-popup .upload-box");
    const messageInput = document.querySelector(".upload-popup textarea");

    // פתיחת הפופאפ
    uploadButton?.addEventListener("click", () => {
        uploadPopup.classList.remove("hidden");
    });

    // סגירה (X או Cancel)
    [closeBtn, cancelBtn].forEach(btn => {
        btn?.addEventListener("click", () => {
            uploadPopup.classList.add("hidden");
            fileInput.value = "";
            messageInput.value = "";
            uploadBox.querySelector("p").textContent = "Choose a file";
        });
    });

    // פתיחת file picker
    uploadBox?.addEventListener("click", () => fileInput.click());

    // הצגת שם הקובץ
    fileInput?.addEventListener("change", () => {
        const file = fileInput.files[0];
        uploadBox.querySelector("p").textContent = file ? file.name : "Choose a file";
    });

    // שליחת הקובץ
    sendBtn?.addEventListener("click", async () => {
        const file = fileInput.files[0];
        if (!file) {
            alert("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("document", file);
        formData.append("message", messageInput.value);

        try {
            const res = await fetch(`${API_BASE_URL}/api/uploads`, {
                method: "POST",
                body: formData
            });

            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();

            showToast("✅ File uploaded successfully", "blue");
            console.log("Server response:", data);

            uploadPopup.classList.add("hidden");
            fileInput.value = "";
            messageInput.value = "";
            uploadBox.querySelector("p").textContent = "Choose a file";

        } catch (err) {
            showToast("❌ Upload error: " + err.message, "red");
            console.error(err);
        }
    });
});
