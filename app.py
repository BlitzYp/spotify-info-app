# Imports
from flask import Flask, request, render_template, redirect, session, jsonify
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv
import os

# Env
load_dotenv()
client_id=os.getenv('SPOTIPY_CLIENT_ID')
client_secret=os.getenv('SPOTIPY_CLIENT_SECRET')
redirect_uri=os.getenv('SPOTIPY_REDIRECT_URI')

app=Flask(__name__)
app.secret_key=os.getenv('FLASK_SECRET_KEY')

# Spotify Auth
sp_oauth=SpotifyOAuth(
    client_id=client_id,
    client_secret=client_secret,
    redirect_uri=redirect_uri,
    scope='user-library-read user-read-private user-top-read'
)

@app.route('/')
def index():
    auth_url=sp_oauth.get_authorize_url()
    return render_template("index.html", auth_url=auth_url)

@app.route('/callback')
def callback():
    code=request.args.get('code')
    token_info=sp_oauth.get_access_token(code)
    session['token_info']=token_info
    return redirect('/loading')

@app.route('/loading')
def loading():
    return render_template('loading.html')

@app.route('/results')
def results():
    token_info=session.get('token_info')
    if not token_info: return jsonify({"error": "No token info"}, 403)

    sp=spotipy.Spotify(auth=token_info['access_token'])
    user=sp.current_user()
    display_name=user.get('display_name', 'User')

    top_tracks=sp.current_user_top_tracks(limit=50, time_range='long_term')
    items=top_tracks['items']
    no_tracks=len(items)==0

    songs=[]
    for item in items:
        track_name=item['name']
        artists=', '.join(artist['name'] for artist in item['artists'])

        try:
            artist_id=item['artists'][0]['id']
            artist_info=sp.artist(artist_id)
            genres=artist_info.get('genres', [])
            genre_str=', '.join(genres) if genres else "Niche"
        except:
            genre_str="Unknown"

        songs.append({
            'name': track_name,
            'artist': artists,
            'genre': genre_str
        })

    rendered=render_template("partials/top_tracks.html", songs=songs, display_name=display_name, no_tracks=no_tracks)
    return jsonify({"html": rendered})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8888)
