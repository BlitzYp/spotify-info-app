// We call this function in loadResults after it gets the html
function loadCharts() {
    const genreEl = document.getElementById("genre-data");
    const artistEl = document.getElementById("artist-data");

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
                label: "Top Genres",
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

    new Chart(artistCtx, {
        type: "bar",
        data: {
            labels: artistData.labels,
            datasets: [{
                label: "Top Artists",
                data: artistData.counts,
                backgroundColor: "#0d6efd",
                borderColor: "#0d6efd",
                borderWidth: 1,
            }],
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: "Top Artists"
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
