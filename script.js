const rowLayoutConfigs = {
    "1열": { offset: 0, aisles: [9, 19] },
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
    "13열": { offset: 3, aisles: [10, 20] } // PDF상 시작점 반영
};

function renderFloor(containerId, rowsData) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    const reserved = reservedSeats.map(s => String(s).replace(/[^0-9]/g, ""));

    rowsData.forEach(row => {
        const config = rowLayoutConfigs[row.row];
        const rowDiv = document.createElement("div");
        rowDiv.className = "row-container";
        rowDiv.innerHTML = `<div class="row-label">${row.row}</div>`;
        const seatsRow = document.createElement("div");
        seatsRow.className = "seats-row";

        // Offset 적용
        for (let i = 0; i < config.offset; i++) {
            seatsRow.appendChild(document.createElement("div")).className = "seat-cell";
        }

        const allSeats = [...(row.seats || [])].sort((a, b) => a - b);
        
        allSeats.forEach((seatNum, index) => {
            const seatId = `${row.row}-${seatNum}`;
            const cell = document.createElement("div");
            cell.className = "seat-cell";

            const isReserved = reserved.includes(seatId.replace(/[^0-9]/g, ""));
            const isDisabled = row.disabled?.includes(seatNum);
            const isObstructed = row.obstructed?.includes(seatNum);

            const btn = document.createElement("button");
            // 시야방해(obstructed)도 disabled 처리
            btn.className = `seat ${isReserved || isObstructed ? "reserved" : (isDisabled ? "wheelchair" : "available")}`;
            btn.innerText = isDisabled ? "♿" : seatNum;
            btn.disabled = isReserved || isObstructed; 
            if (!isReserved && !isObstructed) btn.onclick = () => handleSeatClick(btn, seatId);
            
            cell.appendChild(btn);
            seatsRow.appendChild(cell);

            if (config.aisles.includes(index + 1)) {
                seatsRow.appendChild(document.createElement("div")).className = "aisle-space";
            }
        });
        rowDiv.appendChild(seatsRow);
        container.appendChild(rowDiv);
    });
}
