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
        .then(data => {
            reservedSeats = Array.isArray(data) ? data : [];
            loadSeatLayout(); 
        })
        .catch(err => {
            console.error("좌석 정보를 불러오지 못했습니다.", err);
            reservedSeats = []; 
            loadSeatLayout(); 
        });
}

function loadSeatLayout() {
    fetch("seats.json")
        .then(response => response.json())
        .then(data => {
            renderFloor("floor1", data.floor1);
        });
}

// 배치도 렌더링 코어 함수 (통로 위치 10, 20으로 수정)
function renderFloor(containerId, rowsData) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = ""; 
    
    const cleanedReservedSeats = (Array.isArray(reservedSeats) ? reservedSeats : []).map(seat => 
        String(seat).replace(/[-_\s]/g, "").trim()
    );
    
    rowsData.forEach(rowData => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "row-container";

        const label = document.createElement("div");
        label.className = "row-label";
        label.innerText = rowData.row;
        rowDiv.appendChild(label);

        const seatsRow = document.createElement("div");
        seatsRow.className = "seats-row";

        for (let i = 1; i <= 30; i++) {
            const seatId = `${rowData.row}-${i}`; 
            const currentSeatCleaned = seatId.replace(/[-_\s]/g, "").trim();
            const seatCell = document.createElement("div");
            seatCell.className = "seat-cell";

            // 좌석 종류 판단
            if (rowData.obstructed && rowData.obstructed.includes(i)) {
                createSpecialButton(seatCell, i, "reserved", true);
            } else if (rowData.disabled && rowData.disabled.includes(i)) {
                const isReserved = cleanedReservedSeats.includes(currentSeatCleaned);
                createSeatButton(seatCell, seatId, "♿", isReserved, "wheelchair");
            } else if (rowData.seats && rowData.seats.includes(i)) {
                const isReserved = cleanedReservedSeats.includes(currentSeatCleaned);
                createSeatButton(seatCell, seatId, i, isReserved, "available");
            }

            seatsRow.appendChild(seatCell);

            // 통로 삽입: 10번 뒤, 20번 뒤
            if (i === 10 || i === 20) {
                const aisleSpace = document.createElement("div");
                aisleSpace.className = "aisle-space";
                seatsRow.appendChild(aisleSpace);
            }
        }
        rowDiv.appendChild(seatsRow);
        container.appendChild(rowDiv);
    });
}

// (이하 함수는 기존 로직 유지)
function createSpecialButton(targetCell, label, className, isDisabled) {
    const btn = document.createElement("button");
    btn.className = `seat ${className}`;
    btn.innerText = label;
    btn.disabled = isDisabled;
    btn.style.width = "100%"; btn.style.height = "100%";
    targetCell.appendChild(btn);
}

function createSeatButton(targetCell, seatId, label, isReserved, baseClass) {
    const btn = document.createElement("button");
    btn.id = seatId;
    btn.className = isReserved ? "seat reserved" : `seat ${baseClass}`;
    btn.disabled = isReserved;
    btn.innerText = label;
    btn.style.width = "100%"; btn.style.height = "100%";
    if (!isReserved) btn.addEventListener("click", () => handleSeatClick(btn, seatId));
    targetCell.appendChild(btn);
}

function handleSeatClick(btn, seatId) {
    if (btn.classList.contains("selected")) {
        btn.classList.remove("selected");
        selectedSeats = selectedSeats.filter(s => s !== seatId);
    } else {
        if (selectedSeats.length >= 5) { alert("좌석은 최대 5개까지 선택할 수 있습니다."); return; }
        btn.classList.add("selected");
        selectedSeats.push(seatId);
    }
    updateSummary();
}

function updateSummary() {
    const display = document.getElementById("selectedSeatsDisplay");
    const count = document.getElementById("ticketCount");
    display.innerText = selectedSeats.length === 0 ? "없음" : selectedSeats.join(", ");
    count.innerText = selectedSeats.length;
}

function createCheckModalMarkup() {
    const overlay = document.createElement("div");
    overlay.id = "checkModal";
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title" id="modalUserTitle">내 예약 좌석 내역 조회 결과</div>
                <button class="modal-close" id="closeModalBtn">&times;</button>
            </div>
            <div class="modal-booking-zone">
                <div class="stage">STAGE</div>
                <div id="modalFloorContainer" class="seating-container"></div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById("closeModalBtn").addEventListener("click", () => overlay.classList.remove("active"));
}

function renderModalFloor(rowsData, mySeatsArray) {
    const container = document.getElementById("modalFloorContainer");
    if (!container) return;
    container.innerHTML = "";
    const cleanedMySeats = mySeatsArray.map(seat => String(seat).replace(/[-_\s]/g, "").trim());
    const cleanedReservedSeats = reservedSeats.map(seat => String(seat).replace(/[-_\s]/g, "").trim());

    rowsData.forEach(rowData => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "row-container";
        rowDiv.innerHTML = `<div class="row-label">${rowData.row}</div>`;
        const seatsRow = document.createElement("div");
        seatsRow.className = "seats-row";

        for (let i = 1; i <= 30; i++) {
            const seatId = `${rowData.row}-${i}`;
            const currentSeatCleaned = seatId.replace(/[-_\s]/g, "").trim();
            const cell = document.createElement("div");
            cell.className = "seat-cell";
            
            if ((rowData.seats && rowData.seats.includes(i)) || (rowData.disabled && rowData.disabled.includes(i)) || (rowData.obstructed && rowData.obstructed.includes(i))) {
                const btn = document.createElement("button");
                btn.style.width = "100%"; btn.style.height = "100%"; btn.disabled = true;
                btn.innerText = rowData.disabled && rowData.disabled.includes(i) ? "♿" : i;
                
                if (cleanedMySeats.includes(currentSeatCleaned)) btn.className = "seat my-reserved";
                else if (cleanedReservedSeats.includes(currentSeatCleaned)) btn.className = "seat reserved";
                else btn.className = rowData.disabled && rowData.disabled.includes(i) ? "seat wheelchair" : (rowData.obstructed && rowData.obstructed.includes(i) ? "seat reserved" : "seat available");
                cell.appendChild(btn);
            }
            seatsRow.appendChild(cell);
            if (i === 10 || i === 20) seatsRow.appendChild(document.createElement("div")).className = "aisle-space";
        }
        rowDiv.appendChild(seatsRow);
        container.appendChild(rowDiv);
    });
}

function setupBookingForm() {
    // 기존 폼 이벤트 로직 유지
    const submitBtn = document.getElementById("submitBtn");
    const checkBtn = document.getElementById("checkBtn"); 
    const phoneInput = document.getElementById("phone");
    phoneInput.addEventListener("input", (e) => { /* 기존 로직 */ });
    checkBtn.addEventListener("click", () => { /* 조회 로직 */ });
    submitBtn.addEventListener("click", () => { /* 예약 로직 */ });
}
