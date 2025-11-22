from django.core.files.base import ContentFile
from django.conf import settings
import requests, os
from dataclasses import dataclass, field

@dataclass
class MovieInfo:
    title: str
    api_key: str = None
    language: str = 'en'
    year: str = None
    original_title: str = None
    release_date: str = None
    overview: str = None
    runtime: int = 0
    poster_url: str = None
    genres: list = field(default_factory=list)
    main_cast: list = field(default_factory=list)
    directors: list = field(default_factory=list)
    trailer: str = None
    id: int = None
    index: int = 0

    def __post_init__(self):
        self.request_info()
        self.request_crew()
        self.request_trailer()

    def request_info(self):
        """
        Get movie information from TMDB API.
        """
        url = f"https://api.themoviedb.org/3/search/movie?api_key={self.api_key}"
        if self.year:
            url += f"&query={self.title}&language={self.language}&year={self.year}"
        else:
            url += f"&query={self.title}&language={self.language}"

        response = requests.get(url)
        data = response.json()

        if data.get('results'):
            self.id = data['results'][self.index]['id']
            self.original_title = data['results'][self.index]['original_title']
            self.title = data['results'][self.index]['title']
            self.release_date = data['results'][self.index]['release_date']
            self.overview = data['results'][self.index]['overview']
            poster_path = data['results'][self.index]['poster_path']
            if poster_path:
                self.poster_url = f"https://image.tmdb.org/t/p/w500{poster_path}"
            else:
                self.poster_url = None

            url = f"https://api.themoviedb.org/3/movie/{self.id}?api_key={self.api_key}"
            response = requests.get(url)
            data = response.json()
            if data.get('runtime'):
                self.runtime = data['runtime']

            if data.get('genres'):
                self.genres = [genre['name'] for genre in data['genres']]
        
    def print_info(self):
        """
        Print movie information.
        """
        print(f"Title: {self.title}")
        print(f"Original Title: {self.original_title}")
        print(f"Release Date: {self.release_date}")
        print(f"Overview: {self.overview}")
        print(f"Poster URL: {self.poster_url}")
        print(f"ID: {self.id}")
        print(f"Main Cast: {self.main_cast}")
        print(f"Directors: {self.directors}")
        print(f"Runtime: {self.runtime} minutes")
        print(f"Trailer: {self.trailer}")

    def request_crew(self):
        """
        Get movie crew information from TMDB API.
        """
        url = f"https://api.themoviedb.org/3/movie/{self.id}/credits?api_key={self.api_key}"
        response = requests.get(url)
        data = response.json()
        if data.get('cast'):
            self.main_cast = [actor['name'] for actor in data['cast'][:5]]

        if data.get('crew'):
            self.directors = [crew['name'] for crew in data['crew'] if crew['job'] == 'Director' or crew['job'] == 'Co-Director']
    
    def request_trailer(self):
        """
        Get movie trailer information from TMDB API.
        """
        url = f"https://api.themoviedb.org/3/movie/{self.id}/videos?api_key={self.api_key}&language={self.language}"
        response = requests.get(url)
        data = response.json()
        if data.get('results'):
            for video in data['results']:
                if video['type'] == 'Trailer':
                    self.trailer = f"https://www.youtube.com/watch?v={video['key']}"
                    break
        else:
            self.trailer = None
        
    def serialize(self) -> dict:
        """
        Serialize movie information to dictionary.
        """
        return {
            'title': self.title,
            'original_title': self.original_title,
            'release_date': self.release_date,
            'overview': self.overview,
            'runtime': self.runtime,
            'genres': self.genres,
            'main_cast': self.main_cast,
            'directors': self.directors,
            'poster': self.poster_url,
            'trailer': self.trailer,
        }