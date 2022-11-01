# Import the required modules
import requests
from bs4 import BeautifulSoup
import json


# Function will return a list of dictionaries
# each containing information of books.
def json_from_html_using_bs4(base_url):

	# requests.get(url) returns a response that is saved
	# in a response object called page.
	page = requests.get(base_url)

	# page.text gives us access to the web data in text
	# format, we pass it as an argument to BeautifulSoup
	# along with the html.parser which will create a
	# parsed tree in soup.
	soup = BeautifulSoup(page.text, "html.parser")

	# soup.find_all finds the div's, all having the same
	# class "col-xs-6 col-sm-4 col-md-3 col-lg-3" that is
	# stored in books
	books = soup.find_all(
		'li', attrs={'class':
				'col-xs-6 col-sm-4 col-md-3 col-lg-3'})

	# Initialise the required variables
	star = ['One', 'Two', 'Three', 'Four', 'Five']
	res, book_no = [], 1
	
	# Iterate books classand check for the given tags
	# to get the information of each books.
	for book in books:

		# Title of book in <img> tag with "alt" key.
		title = book.find('img')['alt']
		print(title)

		# Link of book in <a> tag with "href" key
		link = base_url[:37] + book.find('a')['href']

		# Rating of book from

		for index in range(5):
			find_stars = book.find(
			'p', attrs={'class': 'star-rating ' + star[index]})
			
			# Check which star-rating class is not
			# returning None and then break the loop
			if find_stars is not None:
				stars = star[index] + " out of 5"
				break

		# Price of book from
		price = book.find('p', attrs={'class': 'price_color'}).text

		# Stock Status of book from


		# instock availability class.
		instock = book.find('p', attrs={'class':'instock availability'}).text.strip()
		
		# Create a dictionary with the above book information
		data = {'book no': str(book_no), 'title': title,
			'rating': stars, 'price': price, 'link': link,
			'stock': instock}

		# Append the dictionary to the list
		res.append(data)
		book_no += 1
	return res


# Main Function
if __name__ == "__main__":

	# Enter the url of website
	base_url = "https://books.toscrape.com/catalogue/page-1.html"

	# Function will return a list of dictionaries
	res = json_from_html_using_bs4(base_url)

	# Convert the python objects into json object and export
	# it to books.json file.
	with open('books.json', 'w', encoding='latin-1') as f:
		json.dump(res, f, indent=8, ensure_ascii=False)
	print("Created Json File")