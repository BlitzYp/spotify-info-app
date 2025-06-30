import io
from flask import Response
import csv


def write_csv(songs: list) -> Response:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Track", "Artist(s)", "Genre(s)"])
    for song in songs:
        writer.writerow([song["name"], song["artist"], song["genre"]])
    response = Response(output.getvalue(), mimetype="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=top_tracks.csv"
    return response


def write_txt(songs: list) -> Response:
    output = io.StringIO()
    for i, song in enumerate(songs, 1):
        output.write(
            f"{i}. {song['name']} by {song['artist']}\n   Genres: {song['genre']}\n\n"
        )
    response = Response(output.getvalue(), mimetype="text/plain")
    response.headers["Content-Disposition"] = "attachment; filename=top_tracks.txt"
    return response
