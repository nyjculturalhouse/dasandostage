const GAS_URL = "https://script.google.com/macros/s/AKfycbwEGlst8zJdzKQaQzMxzF7SVwrn9GcFVD24LT8Wg4IIhQf-TnRJlancSLdTWIbtjxWE3w/exec";
let selectedSeats = [];
let reservedSeats = [];

const rowLayoutConfigs = {
    "1열": { offset: 1 }, "2열": { offset: 1 }, "3열": { offset: 1 },
    "4열": { offset: 0 }, "5열": { offset: 0 }, "6열": { offset: 0 },
    "7열": { offset: 0 }, "8열": { offset: 0 }, "9열": { offset: 0 },
    "10열": { offset: 0 }, "11열": { offset: 0 }, "12열": { offset: 0 },
    "13열": { offset: 4 }
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

// ... (상단 GAS_URL 및 변수 선언부는 그대로 유지)

function loadSeatLayout() {
    fetch("seats.json")
        .then(res => res.json())
        .then(data => renderFloor("floor1", data.floor1));
}

function renderFloor(containerId, rowsData) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    
    // GAS에서 받아온 예약 좌석 문자열 정형화
    const reserved = reservedSeats.map(s => String(s).replace(/[^0-9]/g, ""));

    rowsData.forEach(row => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "row-container";
        rowDiv.innerHTML = `<div class="row-label">${row.row}</div>`;
        
        const seatsRow = document.createElement("div");
        seatsRow.className = "seats-row";

        // 해당 행에 존재하는 모든 좌석 종류(일반, 장애인, 시야제한)의 번호를 총망라하여 수집
        const seatNumbersInJson = new Set([
            ...(row.seats || []), 
            ...(row.disabled || []), 
            ...(row.obstructed || [])
        ]);

        // [핵심 변경] 도면의 격자는 최대 30번까지 존재하므로, 1번부터 30번까지 순서대로 칸을 만듭니다.
        for (let seatNum = 1; seatNum <= 30; seatNum++) {
            
            // JSON 데이터에 해당 좌석 번호 정의가 있는 경우에만 버튼을 생성
            if (seatNumbersInJson.has(seatNum)) {
                const seatId = `${row.row}-${seatNum}`;
                const cell = document.createElement("div");
                cell.className = "seat-cell";

                const isReserved = reserved.includes(seatId.replace(/[^0-9]/g, ""));
                const isDisabled = row.disabled?.includes(seatNum);
                const isObstructed = row.obstructed?.includes(seatNum);

                const btn = document.createElement("button");
                
                // 클래스 지정 (시야제한석도 도면처럼 빨간색/선택불가 테마인 reserved 적용)
                btn.className = `seat ${isReserved || isObstructed ? "reserved" : (isDisabled ? "wheelchair" : "available")}`;
                btn.innerText = isDisabled ? "♿" : seatNum;
                btn.disabled = isReserved || isObstructed;
                
                if (!isReserved && !isObstructed) {
                    btn.onclick = () => handleSeatClick(btn, seatId);
                }

                // [통로 마진 정밀 설정] 
                // 전체 30칸 격자 구조이므로 블록이 나뉘는 경계선 격자에만 깔끔하게 우측 여백을 줍니다.
                // 9번 칸(좌측 통로 경계), 20번 칸(우측 통로 경계)에 마진을 주면 전 열이 수직 정렬됩니다.
                if (seatNum === 9 || seatNum === 20) {
                    cell.style.marginRight = "24px";
                }

                cell.appendChild(btn);
                seatsRow.appendChild(cell);
            } else {
                // 데이터에 없는 좌석 번호 칸은 도면처럼 투명한 빈 공간(통로 또는 공백) 처리
                const emptyCell = document.createElement("div");
                emptyCell.className = "seat-cell";
                
                // 빈 공간 격자일지라도 통로 구역(9번, 20번 위치)을 지나갈 때는 마진을 동일하게 유지해야 대칭이 맞습니다.
                if (seatNum === 9 || seatNum === 20) {
                    emptyCell.style.marginRight = "24px";
                }
                
                seatsRow.appendChild(emptyCell);
            }
        }

        rowDiv.appendChild(seatsRow);
        container.appendChild(rowDiv);
    });
}

// ... (하단 handleSeatClick 함수는 그대로 유지)

function renderFloor(containerId, rowsData) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    const reserved = reservedSeats.map(s => String(s).replace(/[^0-9]/g, ""));

    rowsData.forEach(row => {
        const config = rowLayoutConfigs[row.row] || { offset: 0 };
        const finalOffset = (row.offset !== undefined) ? row.offset : config.offset;

        const rowDiv = document.createElement("div");
        rowDiv.className = "row-container";
        rowDiv.innerHTML = `<div class="row-label">${row.row}</div>`;
        const seatsRow = document.createElement("div");
        seatsRow.className = "seats-row";

        for (let i = 0; i < finalOffset; i++) {
            seatsRow.appendChild(document.createElement("div")).className = "seat-cell";
        }

        const allSeats = [...new Set([...(row.seats || []), ...(row.disabled || []), ...(row.obstructed || [])])].sort((a, b) => a - b);
        
        allSeats.forEach((seatNum) => {
            const seatId = `${row.row}-${seatNum}`;
            const cell = document.createElement("div");
            cell.className = "seat-cell";

            const isReserved = reserved.includes(seatId.replace(/[^0-9]/g, ""));
            const isDisabled = row.disabled?.includes(seatNum);
            const isObstructed = row.obstructed?.includes(seatNum);

            const btn = document.createElement("button");
            btn.className = `seat ${isReserved || isObstructed ? "reserved" : (isDisabled ? "wheelchair" : "available")}`;
            btn.innerText = isDisabled ? "♿" : seatNum;
            btn.disabled = isReserved || isObstructed;
            if (!isReserved && !isObstructed) btn.onclick = () => handleSeatClick(btn, seatId);
            
            // [통로 마진 추가]
            const rowNum = parseInt(row.row);
            if ((rowNum <= 3 && (seatNum === 9 || seatNum === 19)) ||
                (rowNum >= 4 && rowNum <= 12 && (seatNum === 10 || seatNum === 20)) ||
                (rowNum === 13 && (seatNum === 7 || seatNum === 19))) {
                btn.style.marginRight = "24px";
            }
            
            cell.appendChild(btn);
            seatsRow.appendChild(cell);
        });
        rowDiv.appendChild(seatsRow);
        container.appendChild(rowDiv);
    });
}

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
