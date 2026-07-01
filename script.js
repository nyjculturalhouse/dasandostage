// ===============================
// 최대 선택 가능 좌석
// ===============================
const MAX_SELECT = 5;

// 현재 선택 좌석
let selectedSeats = [];

// ===============================
// 1층 좌석
// start : 시작 번호
// end   : 끝 번호
// ===============================

const floor1 = [

    {row:1,start:5,end:9},

    {row:2,start:3,end:9},

    {row:3,start:3,end:9},

    {row:4,start:1,end:10},

    {row:5,start:1,end:10},

    {row:6,start:1,end:10},

    {row:7,start:1,end:8},

    {row:8,start:1,end:10},

    {row:9,start:1,end:10},

    {row:10,start:1,end:10},

    {row:11,start:1,end:10},

    {row:12,start:1,end:10}

];


// ===============================
// 2층
// ===============================

const floor2 = [

    {row:1,start:null,end:null},

    {row:2,start:1,end:10},

    {row:3,start:1,end:10},

    {row:4,start:1,end:10}

];

function drawFloor(data,targetId,floor){

    const target=document.getElementById(targetId);

    target.innerHTML="";

    data.forEach(r=>{

        const row=document.createElement("div");

        row.className="row";

        const label=document.createElement("div");

        label.className="rowLabel";

        label.innerHTML=r.row+"열";

        row.appendChild(label);

        for(let i=1;i<=10;i++){

            const seat=document.createElement("div");

            // 없는 좌석
            if(r.start===null){

                seat.className="seatItem empty";

            }

            else if(i<r.start || i>r.end){

                seat.className="seatItem empty";

            }

            else{

                seat.className="seatItem";

                seat.innerHTML=i;

                seat.dataset.id=`${floor}-${r.row}-${i}`;

                seat.onclick=()=>selectSeat(seat);

            }

            row.appendChild(seat);

        }

        target.appendChild(row);

    });

}

function selectSeat(seat){

    const count=parseInt(document.getElementById("count").value);

    const id=seat.dataset.id;

    if(seat.classList.contains("selectedSeat")){

        seat.classList.remove("selectedSeat");

        selectedSeats=selectedSeats.filter(x=>x!==id);

    }

    else{

        if(selectedSeats.length>=count){

            alert("예매수량만큼만 선택 가능합니다.");

            return;

        }

        seat.classList.add("selectedSeat");

        selectedSeats.push(id);

    }

    updateSelected();

}

function updateSelected(){

    const div=document.getElementById("selectedSeats");

    if(selectedSeats.length===0){

        div.innerHTML="없음";

        return;

    }

    div.innerHTML=selectedSeats.join("<br>");

}

drawFloor(floor1,"floor1","1층");

drawFloor(floor2,"floor2","2층");
