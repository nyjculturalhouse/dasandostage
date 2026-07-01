const GAS_URL = "https://script.google.com/macros/s/AKfycbwEGlst8zJdzKQaQzMxzF7SVwrn9GcFVD24LT8Wg4IIhQf-TnRJlancSLdTWIbtjxWE3w/exec";
let selectedSeats = [];
let reservedSeats = [];

document.addEventListener("DOMContentLoaded", () => {
    fetchReservedSeats();
    setupBookingForm();
    createCheckModalMarkup();
});

function fetchReservedSeats() {
    fetch(GAS_URL)
        .then(response => response.json())
        .then(data => { reservedSeats = Array.isArray(data) ? data : []; loadSeatLayout(); })
        .catch(() => { reservedSeats = []; loadSeatLayout(); });
}

function loadSeatLayout() {
    fetch("seats.json")
        .then(response => response.json())
        .then(data => renderFloor("floor1", data.floor1));
}

function renderFloor(containerId, rowsData) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    
    const cleanedReservedSeats = reservedSeats.map(s => String(s).replace(/[-_\s]/g, ""));

    rowsData.forEach(rowData => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "row-container";
        rowDiv.innerHTML = `<div class="row-label">${rowData.row}</div>`;
        const seatsRow = document.createElement("div");
        seatsRow.className = "seats-row";

        rowData.seats.forEach(seatNum => {
            if (seatNum === null) {
                const aisle = document.createElement("div");
                aisle.className = "aisle-space";
                seatsRow.appendChild(aisle);
            } else {
                const seatId = `${rowData.row}-${seatNum}`;
                const cell = document.createElement("div");
                cell.className = "seat-cell";
                
                const isReserved = cleanedReservedSeats.includes(seatId.replace(/[-_\s]/g, ""));
                const isObstructed = rowData.obstructed?.includes(seatNum);
                const isDisabled = rowData.disabled?.includes(seatNum);
                
                const btn = document.createElement("button");
                btn.className = `seat ${isReserved ? "reserved" : (isDisabled ? "wheelchair" : "available")}`;
                btn.disabled = isReserved || isObstructed;
                btn.innerText = isDisabled ? "♿" : seatNum;
                if (!isReserved && !isObstructed) btn.onclick = () => handleSeatClick(btn, seatId);
                
                cell.appendChild(btn);
                seatsRow.appendChild(cell);
            }
        });
        rowDiv.appendChild(seatsRow);
        container.appendChild(rowDiv);
    });
}

function handleSeatClick(btn, seatId) {
    if (btn.classList.contains("selected")) {
        btn.classList.remove("selected");
        selectedSeats = selectedSeats.filter(s => s !== seatId);
    } else {
        if (selectedSeats.length >= 5) return alert("최대 5개까지 선택 가능합니다.");
        btn.classList.add("selected");
        selectedSeats.push(seatId);
    }
    updateSummary();
}

function updateSummary() {
    document.getElementById("selectedSeatsDisplay").innerText = selectedSeats.length ? selectedSeats.join(", ") : "없음";
    document.getElementById("ticketCount").innerText = selectedSeats.length;
}

// ... (나머지 createCheckModalMarkup, setupBookingForm 등 기존 로직 유지)
