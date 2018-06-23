let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.fetchReviewsByRestaurant(self.restaurant.id, (error, reviews) => {
        if (!reviews) {
          return;
        }
        // fill reviews
        self.restaurant.reviews = reviews;
        fillReviewsHTML(self.restaurant.reviews);
      });
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Listen for the 'mark as favorite' event
 */
document.getElementById('favorite').addEventListener('change', event => {
  event.preventDefault();
  if (self.restaurant) {
    DBHelper.markAsFavorite(self.restaurant.id, event.target.checked);
  }
});

/**
 * Listen for the 'add review' event
 */
document.getElementById('add-review-form').addEventListener('submit', event => {
  event.preventDefault();

  const name = event.target.name.value;
  const rating = event.target.rating.value;
  const comments = event.target.comments.value;
  
  DBHelper.addReview({
    restaurant_id: self.restaurant.id,
    name,
    rating,
    comments
  }, (error, review) => {
    const ul = document.getElementById('reviews-list');
    ul.appendChild(createReviewHTML(review));
    event.target.reset();
  });
});

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      // if the restaurant was already fetched (from indexedDB cache) don't overwrite it
      self.restaurant = self.restaurant || restaurant;
      if (error) {
        console.error(error);
        return;
      }
      if (self.restaurant) {
        fillRestaurantHTML();
        callback(null, self.restaurant);
      }
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  const small = DBHelper.imageUrlForRestaurant(restaurant, 'sm');
  const medium = DBHelper.imageUrlForRestaurant(restaurant, 'sm2x');
  const large = DBHelper.imageUrlForRestaurant(restaurant);
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.srcset = `${small} 320w, ${medium} 640w, ${large} 800w`;
  image.alt = `Image of ${restaurant.name} restaurant`;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }

  // set is_favorite flag
  const favoriteCheckbox = document.getElementById('favorite');
  if (restaurant.is_favorite) {
    favoriteCheckbox.setAttribute('checked', '');
  }
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  const caption = document.createElement('caption');

  caption.innerText = 'Restaurant Operating Hours';
  hours.appendChild(caption);

  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  
  if (container.querySelectorAll('.reviews-title').length === 0) { 
    const title =  document.createElement('h3');
    title.classList.add('reviews-title');
    title.innerHTML = 'Reviews';
    container.appendChild(title);
  }

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }

  const ul = document.getElementById('reviews-list');
  ul.innerHTML = '';
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = new Date(review.createdAt).toLocaleString();
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.className = 'review__rating';
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');

  li.innerHTML = restaurant.name;
  li.setAttribute('aria-current', 'page');
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
