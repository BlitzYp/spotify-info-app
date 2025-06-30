// We call this function in loadResults after it gets the html
function loadCharts() {
    const genreEl = document.getElementById("genre-data");
    const artistEl = document.getElementById("artist-data");
    const generateColor = (index) => {
        const hue = (index * 47) % 360;
        return `hsl(${hue}, 70%, 60%)`;
    }
    if (!genreEl || !artistEl) return;

    let genreData, artistData;
    try {
        genreData = JSON.parse(genreEl.textContent);
        artistData = JSON.parse(artistEl.textContent);
    } catch (e) {
        console.error("Failed to parse chart data", e);
        return;
    }

    const genreCtx = document.getElementById("genreChart")?.getContext("2d");
    const artistCtx = document.getElementById("artistChart")?.getContext("2d");

    if (!genreCtx || !artistCtx) return;
    if (typeof ChartDataLabels !== "undefined") {
        Chart.register(ChartDataLabels);
    } else {
        console.warn("ChartDataLabels not found — plugin not registered.");
    }
    new Chart(genreCtx, {
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
    const uniqueColors = artistData.counts.map((_, i) => generateColor(i));
    new Chart(artistCtx, {
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
