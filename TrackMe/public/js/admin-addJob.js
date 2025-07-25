function enableEditing() {
    document.querySelectorAll(".job-details__value").forEach(el => {
        if (el.tagName.toLowerCase() === "select") return;

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

    const flightContainer = document.getElementById("flightEntries");
    if (flightContainer) {
        flightContainer.innerHTML = "";
        const wrapper = document.createElement("section");
        wrapper.className = "flight-details__entry";

        const dateInput = document.createElement("input");
        dateInput.type = "text";
        dateInput.className = "editable-field";
        dateInput.placeholder = "Date";

        const codeInput = document.createElement("input");
        codeInput.type = "text";
        codeInput.className = "editable-field";
        codeInput.placeholder = "Flight Code";

        wrapper.appendChild(dateInput);
        wrapper.appendChild(codeInput);
        flightContainer.appendChild(wrapper);
    }

    if (!document.getElementById("saveChanges")) {
        const saveBtn = document.createElement("section");
        saveBtn.className = "action-button";
        saveBtn.id = "saveChanges";
        saveBtn.innerHTML = `<img src="assets/icons/save.svg" alt="Save" /><span>Save</span>`;
        document.querySelector(".job-header__actions").appendChild(saveBtn);

        saveBtn.addEventListener("click", () => {
            showConfirmationPopup("Save changes to the job?", () => {
                showToast("Changes saved successfully", "blue");
            });
        });
    }
}

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

    overlay.querySelector(".popup-cancel").addEventListener("click", () => overlay.remove());
    overlay.querySelector(".popup-confirm").addEventListener("click", () => {
        onConfirm();
        overlay.remove();
    });
}

function showToast(text, color = "blue") {
    const toast = document.createElement("section");
    toast.className = `popup-toast toast-${color}`;
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function populateCourierDropdown() {
    const couriers = [
        { id: '1', name: 'Chen Rozenberg', rating: 4.9 },
        { id: '2', name: 'Yossi Levi', rating: 4.7 },
        { id: '3', name: 'Noa Shalev', rating: 4.5 },
        { id: '4', name: 'Avi Katz', rating: 4.3 },
        { id: '5', name: 'Lior Mizrahi', rating: 4.2 }
    ];
    const select = document.getElementById('courierSelect');
    if (!select) return;
    select.querySelectorAll("option:not(:first-child)").forEach(o => o.remove());
    couriers.forEach(courier => {
        const option = document.createElement("option");
        option.value = courier.id;
        option.textContent = `${courier.name} (⭐ ${courier.rating})`;
        select.appendChild(option);
    });
}


function initGoogleAddressAutocomplete() {
    const pickupInput = document.getElementById("pickupAddress");
    if (pickupInput) {
        new google.maps.places.Autocomplete(pickupInput, {
            types: ["geocode"],
            componentRestrictions: { country: "il" }
        });
    }

    const deliveryInput = document.getElementById("deliveryAddress");
    if (deliveryInput) {
        new google.maps.places.Autocomplete(deliveryInput, {
            types: ["geocode"],
            componentRestrictions: { country: "il" }
        });
    }
}

function openDocumentsPopup() {
    document.getElementById("documentsModal").classList.remove("hidden");
}

function closeDocumentsPopup() {
    document.getElementById("documentsModal").classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
    populateCourierDropdown();
    enableEditing();
    initGoogleAddressAutocomplete(); 
});

document.addEventListener("DOMContentLoaded", function () {
    const phoneInputs = document.querySelectorAll("input[type='tel']");
    phoneInputs.forEach(input => {
        window.intlTelInput(input, {
            initialCountry: "il",
            preferredCountries: ["il", "us", "gb", "fr", "de"],
            utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@17/build/js/utils.js",
        });
    });
});

document.getElementById("jobIdField").value = "JOB-2025-00123";

document.addEventListener("DOMContentLoaded", () => {
    const uploadBtn = document.getElementById("uploadButton");
    if (uploadBtn) {
        uploadBtn.addEventListener("click", openDocumentsPopup);
    }
});
