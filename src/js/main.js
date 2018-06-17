const MAP_URI = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCmUsxSG50Sw0vo6Z2wubsyIefmz2LgQEw&libraries=places&callback=initMap';
let restaurants,
  neighborhoods,
  cuisines,
  mapLoaded = false,
  mapOpen = false;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { 
      if (entry.isIntersecting) {
        loadImg(entry.target);
      } 
    });
  }, {
    rootMargin: '0px 0px',
    threshold: 0.25
  });  

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', event => {
  updateRestaurants();
  fetchNeighborhoods();
  fetchCuisines();
});

// Lazy load map 
document.querySelector('#open-map-btn').addEventListener('click', event => {
  const openClass = 'map--open';
  const openText = 'Show map';
  const closeText = 'Hide map';
  const mapEl = document.querySelector('#map');
  const buttonEl = event.target;

  if (!mapLoaded) {
    getScript(MAP_URI, () => {
      mapLoaded = true;
      addMarkersToMap();
    });
  }
  if (mapOpen) {
    mapEl.classList.remove(openClass);
    buttonEl.innerText = openText;
    mapOpen = false;
  } else {
    mapEl.classList.add(openClass);
    buttonEl.innerText = closeText;
    mapOpen = true;
  }
});

loadImg = imgEl => {
  imgEl.src = imgEl.dataSet.src;
  imgEl.srcset = imgEl.dataSet.srcset;
  imgEl.onload = () => imgEl.classList.add('restaurant-card__img--loaded');
};

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) {
      // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
};

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    (error, restaurants) => {
      if (error) {
        // Got an error!
        console.error(error);
      } else {
        resetRestaurants(restaurants);
        fillRestaurantsHTML();
        document.querySelectorAll('.restaurant-card__img').forEach(el => observer.observe(el));
      }
    }
  );
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = restaurants => {
  // Remove all restaurants
  self.restaurants = [];
  self.markers = self.markers || [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  if (mapLoaded) {
    addMarkersToMap();
  } 
};

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = restaurant => {
  const li = document.createElement('li');
  li.className = 'restaurant-card';

  if (restaurant.is_favorite) {
    const ns = 'http://www.w3.org/2000/svg';
    const favIcon = document.createElementNS(ns, 'svg');
    favIcon.setAttributeNS (null, 'width', 25);
    favIcon.setAttributeNS (null, 'height', 23);
    favIcon.setAttributeNS (null, 'class', 'favorite-star');

    const polygon = document.createElementNS(ns, 'polygon');
    polygon.setAttributeNS(null, 'points', '9.9, 1.1, 3.3, 21.78, 19.8, 8.58, 0, 8.58, 16.5, 21.78');
    polygon.setAttributeNS(null, 'style', 'fill-rule:nonzero;');

    favIcon.appendChild(polygon);
    li.append(favIcon);
  }

  const image = document.createElement('img');
  const thumbnail = DBHelper.imageUrlForRestaurant(restaurant, 'sm');
  const thumbnail2x = DBHelper.imageUrlForRestaurant(restaurant, 'sm2x');
  image.className = 'restaurant-card__img';
  image.dataSet = { src: thumbnail, srcset: `${thumbnail}, ${thumbnail2x} 2x` };
  image.alt = `Image of ${restaurant.name} restaurant`;
  li.append(image);

  const body = document.createElement('div');
  body.className = 'restaurant-card__body';

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  body.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  body.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  body.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  body.append(more);

  li.append(body);

  return li;
};

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url;
    });
    self.markers.push(marker);
  });
};
