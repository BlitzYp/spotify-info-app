const contentElement=document.getElementById('content');

async function loadResults() {
    try {
        const res=await fetch('/results');
        const data=await res.json();
        if (data.html) contentElement.innerHTML=data.html;
        else contentElement.innerHTML='<div class="alert alert-danger">Failed to load your top tracks.</div>';
    } 
    catch (err) {
        console.error(err);
        contentElement.innerHTML='<div class="alert alert-danger">Something went wrong while fetching your data.</div>';
    }
}

function sortTable(colIndex) {
    const table=document.getElementById('song-table');
    const rows=Array.from(table.tBodies[0].rows);

    // Check if it is the first (the number) column
    const isNumberCol=colIndex===0;

    // Toggle ascending/descending
    let currentSortDir=table.dataset.sortDir==='asc'?'desc':'asc';

    table.dataset.sortDir=currentSortDir;
    table.dataset.sortCol=colIndex;

    rows.sort((a,b)=>{
        const aText=a.cells[colIndex].textContent.trim().toLowerCase();
        const bText=b.cells[colIndex].textContent.trim().toLowerCase();

        if(isNumberCol) return currentSortDir==='asc' ? aText-bText : bText-aText;
        else return currentSortDir==='asc' ? aText.localeCompare(bText) : bText.localeCompare(aText);
    });

    // Re-append sorted rows
    for(const row of rows) table.tBodies[0].appendChild(row);

    // Update arrows
    const headers=document.querySelectorAll('.sort-header');
    headers.forEach((btn, i)=>{
        const arrow=btn.querySelector('.sort-arrow');
        if(i===colIndex) arrow.textContent=currentSortDir==='desc' ? '▲' : '▼';
        else arrow.textContent='';
        
    });
}

document.addEventListener("DOMContentLoaded",loadResults);