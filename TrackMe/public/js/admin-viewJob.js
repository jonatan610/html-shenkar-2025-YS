
        document.addEventListener("DOMContentLoaded", () => {
            const courierStatus = "Package Picked Up";
            const statusElement = document.getElementById("courierStatusText");
            if (statusElement) statusElement.innerText = courierStatus;

            const steps = {
                "Order Created": 0,
                "Heading to Pickup": 1,
                "Package Picked Up": 2,
                "On the Way": 3,
                "Delivered": 4
            };

            const currentStep = steps[courierStatus] || 0;
            for (let i = 1; i <= currentStep; i++) {
                document.getElementById(`step-${i}`)?.classList.add("completed");
                if (i < currentStep) document.getElementById(`line-${i}`)?.classList.add("completed");
            }

            // ===== Status Dropdown Toggle =====
            const toggle = document.getElementById("statusToggle");
            const options = document.getElementById("statusOptions");
            const label = document.getElementById("statusLabel");

            toggle?.addEventListener("click", () => {
                options.style.display = options.style.display === "block" ? "none" : "block";
            });

            options?.querySelectorAll("li").forEach((option) => {
                option.addEventListener("click", () => {
                    const value = option.dataset.value;
                    showConfirmationPopup("Change job status?", () => {
                        label.textContent = option.textContent;
                        toggle.classList.remove("active", "on-hold", "delivered");
                        toggle.classList.add(value);
                        options.style.display = "none";
                        showToast(`Status changed to "${option.textContent}"`, "blue");
                    });
                });
            });

            document.addEventListener("click", (e) => {
                if (!toggle.contains(e.target) && !options.contains(e.target)) {
                    options.style.display = "none";
                }
            });

            // ===== Edit =====
            const editButton = document.querySelector(".action-button img[alt='Edit']")?.closest(".action-button");
            editButton?.addEventListener("click", () => {
                enableEditing();
            });

            // ===== Save Button (dynamically generated) =====
            const saveButton = document.getElementById("saveChanges");
            if (saveButton) {
                saveButton.addEventListener("click", () => {
                    showConfirmationPopup("Save changes to the job?", () => {
                        showToast("Changes saved successfully", "blue");
                    });
                });
            }

            // ===== Delete =====
            const deleteButton = document.querySelector(".action-button--danger");
            deleteButton.addEventListener("click", () => {
                showConfirmationPopup("Are you sure you want to delete this job?", () => {
                    showToast("Job deleted successfully", "red");
                }, "red");
            });

            // ===== Upload Files Button =====
            const uploadBtn = document.getElementById("uploadButton");
            const documentsModal = document.getElementById("documentsModal");
            uploadBtn?.addEventListener("click", () => {
                documentsModal?.classList.remove("hidden");
            });

            // ===== Close Modals =====
            document.querySelectorAll(".popup-cancel, .popup-close")?.forEach((el) =>
                el.addEventListener("click", () => {
                    document.querySelector(".popup-overlay")?.remove();
                })
            );

            // ===== Enable Edit Mode =====
            function enableEditing() {
                document.querySelectorAll(".job-details__value").forEach((el) => {
                    const text = el.textContent.trim();
                    const input = document.createElement("input");
                    input.type = "text";
                    input.value = text;
                    input.className = "editable-field";
                    el.replaceWith(input);
                });

                document.querySelectorAll(".flight-details__date, .flight-details__code").forEach((el) => {
                    const text = el.textContent.trim();
                    const input = document.createElement("input");
                    input.type = "text";
                    input.value = text;
                    input.className = "editable-field";
                    el.innerHTML = "";
                    el.appendChild(input);
                });

                if (!document.getElementById("saveChanges")) {
                    const saveBtn = document.createElement("section");
                    saveBtn.className = "action-button";
                    saveBtn.id = "saveChanges";
                    saveBtn.innerHTML = `<img src="assets/icons/save.svg" alt="Save" /><span>Save</span>`;
                    document.querySelector(".job-header__actions")?.appendChild(saveBtn);

                    saveBtn.addEventListener("click", () => {
                        showConfirmationPopup("Save changes to the job?", () => {
                            showToast("Changes saved successfully", "blue");
                        });
                    });
                }
            }


            // ===== Show Popup Confirm =====
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
      </section>
    `;
                document.body.appendChild(overlay);

                overlay.querySelector(".popup-cancel")?.addEventListener("click", () => overlay.remove());
                overlay.querySelector(".popup-confirm")?.addEventListener("click", () => {
                    onConfirm();
                    overlay.remove();
                });
            }

            // ===== Show Toast =====
            function showToast(text, color = "blue") {
                const toast = document.createElement("section");
                toast.className = `popup-toast toast-${color}`;
                toast.textContent = text;
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 3000);
            }
        });

