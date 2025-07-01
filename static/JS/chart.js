function pieChart(genreCtx, genreData) {
    const message = document.getElementById("noGenreData");
    const canvas = document.getElementById("genreChart");
    if (window.genreChart && window.genreChart instanceof Chart) window.genreChart.destroy();
    if (genreData.labels.length > 0 && genreData.counts.length > 0) {
        message.classList.add("d-none");
        canvas.classList.remove("d-none");
        window.genreChart = new Chart(genreCtx, {
            type: "pie",
            data: {
                labels: genreData.labels,
                datasets: [{
                    label: "Song count",
                    data: genreData.counts,
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: "Top Genres"
                    },
                    datalabels: {
                        color: "#fff",
                        font: { weight: "bold" },
                        formatter: (value) => value
                    }
                }
            }
        });
    } else {
        //genreCtx.canvas.parentNode.innerHTML = `<div class="text-muted text-center">🎵 No genre data available for these tracks.</div>`;
        canvas.classList.add("d-none");
        message.classList.remove("d-none");
    }
}

function barChart(artistCtx, artistData) {
    if (window.artistChart && window.artistChart instanceof Chart) window.artistChart.destroy();
    const generateColor = (index) => {
        const hue = (index * 47) % 360;
        return `hsl(${hue}, 70%, 60%)`;
    }
    const uniqueColors = artistData.counts.map((_, i) => generateColor(i));
    window.artistChart = new Chart(artistCtx, {
        type: "bar",
        data: {
            labels: artistData.labels,
            datasets: [{
                label: "Song count",
                data: artistData.counts,
                backgroundColor: uniqueColors,
                borderColor: uniqueColors,
                borderWidth: 1,
            }],
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: "Top Artists"
                },
                legend: {
                    display: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// We call this function in loadResults after it gets the html
function loadCharts() {
    const genreEl = document.getElementById("genre-data");
    const artistEl = document.getElementById("artist-data");
    if (!genreEl || !artistEl) return;

    // Getting the labels and counts, the data essentially 
    let genreData, artistData;
    try {
        genreData = JSON.parse(genreEl.textContent);
        artistData = JSON.parse(artistEl.textContent);
    } catch (e) {
        console.error("Failed to parse chart data", e);
        return;
    }

    // The canvas ctx
    const genreCtx = document.getElementById("genreChart")?.getContext("2d");
    const artistCtx = document.getElementById("artistChart")?.getContext("2d");

    if (!genreCtx || !artistCtx) return;

    if (typeof ChartDataLabels !== "undefined") {
        Chart.register(ChartDataLabels);
    } else {
        console.warn("ChartDataLabels not found — plugin not registered.");
    }

    pieChart(genreCtx, genreData);
    barChart(artistCtx, artistData);
}
