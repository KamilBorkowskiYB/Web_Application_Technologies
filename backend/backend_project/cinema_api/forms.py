from django import forms

class CinemaHallForm(forms.Form):
    number_of_rows = forms.IntegerField(min_value=1, label="Number of Rows")
    seats_per_row = forms.IntegerField(min_value=1, label="Seats per Row")