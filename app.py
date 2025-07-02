# Imports
import os
import json
import spotipy
import uuid
from flask import Flask, request, render_template, redirect, session, jsonify, Response
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv
from write import write_csv, write_txt

# Env
load_dotenv()
client_id = os.getenv("SPOTIPY_CLIENT_ID")
client_secret = os.getenv("SPOTIPY_CLIENT_SECRET")
redirect_uri = os.getenv("SPOTIPY_REDIRECT_URI")

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY")
state = str(uuid.uuid4())
# Spotify Auth
sp_oauth = SpotifyOAuth(
    client_id=client_id,
    client_secret=client_secret,
    redirect_uri=redirect_uri,
    scope="user-library-read user-read-private user-top-read",
)


"""
    show_dialog=True,
    cache_path=None,
    open_browser=True,
    state = str(uuid.uuid4()) 
"""


@app.route("/")
def index():
    auth_url = sp_oauth.get_authorize_url()
    return render_template("index.html", auth_url=auth_url)


@app.route("/login")
def login():
    limit = request.args.get("limit", "50")
    session["track_limit"] = int(limit)
    auth_url = sp_oauth.get_authorize_url()
    return redirect(auth_url)


@app.route("/callback")
def callback():
    code = request.args.get("code")
    token_info = sp_oauth.get_access_token(code)
    session["token_info"] = token_info
    return redirect("/loading")


@app.route("/loading")
def loading():
    return render_template("loading.html")


def get_render(session_data):
    rendered = render_template(
        "partials/top_tracks.html",
        songs=session_data.get("export_songs"),
        display_name=session_data["display_name"],
        no_tracks=session_data["no_tracks"],
        top_genres=session_data["top_genres"],
        top_artists=session_data["top_artists"],
        limit=session_data["limit"],
        songs_count_rendered=session_data["songs_count_rendered"],
    )
    return rendered


@app.route("/results")
def results():
    token_info = session.get("token_info")
    if not token_info:
        return jsonify({"error": "No token info"}, 403)

    # Check for cached data so we don't have to request the entire dataset again
    limit = session.get("track_limit", 50)
    if session.get("limit") == limit and not session.get("no_tracks"):
        return jsonify({"html": get_render(session)})

    sp = spotipy.Spotify(auth=token_info["access_token"])
    user = sp.current_user()
    print(f"{user.get('display_name')} {user.get('id')}")
    display_name = user.get("display_name", "User")

    # In case the token expires
    try:
        top_tracks = sp.current_user_top_tracks(limit=limit, time_range="long_term")
    except spotipy.exceptions.SpotifyException:
        session.clear()
        return jsonify({"error": "Spotify session expired. Please log in again."}), 401

    items = top_tracks["items"]
    no_tracks = len(items) == 0

    # For keeping track
    mem_genres = {}
    mem_artists = {}
    songs = []
    for item in items:
        track_name = item["name"]
        artists = ", ".join(artist["name"] for artist in item["artists"])
        try:
            artist_id = item["artists"][0]["id"]
            artist_info = sp.artist(artist_id)
            genres = artist_info.get("genres", [])
            genre_str = ", ".join(genres) if genres else "Niche"
        except:
            genre_str = "Unknown"
            genres = ["Unknown"]

        songs.append({"name": track_name, "artist": artists, "genre": genre_str})

        for genre in genres:
            if genre in mem_genres:
                mem_genres[genre] += 1
            else:
                mem_genres[genre] = 1

        for artist in item["artists"]:
            if artist["name"] in mem_artists:
                mem_artists[artist["name"]] += 1
            else:
                mem_artists[artist["name"]] = 1

    # Gets the top 5 genres and artists
    top_genres = sorted(mem_genres.items(), key=lambda x: x[1], reverse=True)[:5]
    top_artists = sorted(mem_artists.items(), key=lambda x: x[1], reverse=True)[:5]

    # Cache data
    session["export_songs"] = songs
    session["top_artists"] = top_artists
    session["top_genres"] = top_genres
    session["songs_count_rendered"] = len(items)
    session["limit"] = limit
    session["display_name"] = display_name
    session["no_tracks"] = no_tracks

    # Create the template
    rendered = get_render(session)
    return jsonify(
        {"html": rendered, "top_genres": top_genres, "top_artists": top_artists}
    )


@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")


@app.route("/logout_account")
def logout_account():
    session.clear()
    return redirect("https://accounts.spotify.com/en/logout")


@app.route("/export")
def export():
    songs = session.get("export_songs")
    format = request.args.get("format", "txt")
    if not songs:
        return "You have to songs to export"
    if format == "json":
        response = Response(json.dumps(songs, indent=2), mimetype="application/json")
        response.headers["Content-Disposition"] = "attachment; filename=top_tracks.json"
    elif format == "csv":
        response = write_csv(songs)
    else:
        response = write_txt(songs)

    return response


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8888)
