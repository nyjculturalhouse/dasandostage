const GAS_URL = "https://script.google.com/macros/s/AKfycbwEGlst8zJdzKQaQzMxzF7SVwrn9GcFVD24LT8Wg4IIhQf-TnRJlancSLdTWIbtjxWE3w/exec";
let selectedSeats = [];
let reservedSeats = [];

const rowLayoutConfigs = {
    "1열": { offset: 1, aisles: [9, 19] },
    "2열": { offset: 1, aisles: [9, 19] },
    "3열": { offset: 1, aisles: [9, 19] },
    "4열": { offset: 0, aisles: [10, 20] },
    "5열": { offset: 0, aisles: [10, 20] },
    "6열": { offset: 0, aisles: [10, 20] },
    "7열": { offset: 0, aisles: [10, 20] },
    "8열": { offset: 0, aisles: [10, 20] },
    "9열": { offset: 0, aisles: [10, 20] },
    "10열": { offset: 0, aisles: [10, 20] },
    "11열": { offset: 0, aisles: [10, 20] },
    "12열": { offset: 0, aisles: [10, 20] },
    "13열": { offset: 4, aisles: [] } // 12열 4번 좌석 시작점에 맞춤 (offset 4)
};

document.addEventListener("DOMContentLoaded", () => {
    fetchReservedSeats();
});

function fetchReservedSeats() {
    fetch(GAS_URL)
        .then(res => res.json())
        .then(data => { reservedSeats = data || []; loadSeatLayout(); })
        .catch(() => { reservedSeats = []; loadSeatLayout(); });
}

function loadSeatLayout() {
    fetch("seats.json")
        .then(res => res.json())
        .then(data => renderFloor("floor1", data.floor1));
}

function renderFloor(containerId, rowsData) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    const reserved = reservedSeats.map(s => String(s).replace(/[^0-9]/g, ""));

    rowsData.forEach(row => {
        // [중요 수정] JSON 데이터에 "offset"이 있으면 그 값을 쓰고, 없으면 rowLayoutConfigs를 씁니다.
        const config = rowLayoutConfigs[row.row] || { offset: 0, aisles: [10, 20] };
        const finalOffset = (row.offset !== undefined) ? row.offset : config.offset;

        const rowDiv = document.createElement("div");
        rowDiv.className = "row-container";
        rowDiv.innerHTML = `<div class="row-label">${row.row}</div>`;
        const seatsRow = document.createElement("div");
        seatsRow.className = "seats-row";

        // 확정된 finalOffset만큼 빈 셀 생성
        for (let i = 0; i < finalOffset; i++) {
            seatsRow.appendChild(document.createElement("div")).className = "seat-cell";
        }

        const allSeats = [...new Set([...(row.seats || []), ...(row.disabled || []), ...(row.obstructed || [])])].sort((a, b) => a - b);
        
        // ... (위쪽 코드 동일)

        allSeats.forEach((seatNum) => { // index 변수는 삭제해도 됩니다
            const seatId = `${row.row}-${seatNum}`;
            const cell = document.createElement("div");
            cell.className = "seat-cell";

            // ... (버튼 생성 로직 동일)

            cell.appendChild(btn);
            seatsRow.appendChild(cell);

            // [수정된 통로 로직] 
            // 13열은 7, 19번 뒤에 통로, 나머지는 좌석 번호를 기준으로 고정 통로 배치
            if (row.row === "13열") {
                if (seatNum === 3 || seatNum === 19) { // PDF 기준 13열 통로 위치
                    seatsRow.appendChild(document.createElement("div")).className = "aisle-space";
                }
            } else {
                // 좌석 번호가 10번 또는 20번인 좌석 바로 다음에 통로 삽입
                if (seatNum === 10 || seatNum === 20) {
                    seatsRow.appendChild(document.createElement("div")).className = "aisle-space";
                }
            }
        });
// ... (아래 코드 동일)

function handleSeatClick(btn, seatId) {
    if (btn.classList.toggle("selected")) {
        if (selectedSeats.length >= 5) { btn.classList.remove("selected"); return alert("최대 5개까지 선택 가능합니다."); }
        selectedSeats.push(seatId);
    } else {
        selectedSeats = selectedSeats.filter(s => s !== seatId);
    }
    document.getElementById("selectedSeatsDisplay").innerText = selectedSeats.length ? selectedSeats.join(", ") : "없음";
    document.getElementById("ticketCount").innerText = selectedSeats.length;
}
