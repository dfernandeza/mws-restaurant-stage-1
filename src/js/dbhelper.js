const DATABASE_VERSION = 3;

function _openDatabase() {
  return idb.open('foodle', DATABASE_VERSION, upgradeDb => {
    switch (upgradeDb.oldVersion) {
      case 0: {
        const store = upgradeDb.createObjectStore('restaurants', {
          keyPath: 'id'
        });
        store.createIndex('id', 'id');
        store.createIndex('by-date', 'createdAt'); 
      }
      case 1: {
        const store = upgradeDb.createObjectStore('reviews', {
          keyPath: 'id'
        });
        store.createIndex('id', 'id');
        store.createIndex('by-date', 'createdAt');
        store.createIndex('by-restaurant', 'restaurant_id');
      }
      case 2: {
        const store = upgradeDb.createObjectStore('pending_requests', {
          keyPath: 'id',
          autoIncrement: true
        });
        store.createIndex('by-date', 'createdAt');
      }
    }
  });
}

const dbPromise = _openDatabase();

/**
 * Common database helper functions.
 */
class DBHelperClass {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337;
    return `http://localhost:${port}/restaurants/`;
  }

  /**
   * Reviews database URL.
   */
  static get REVIEWS_DATABASE_URL() {
    const port = 1337;
    return `http://localhost:${port}/reviews/`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    dbPromise
      .then(function(db) {
        if (!db) return;
        const index = db
          .transaction('restaurants')
          .objectStore('restaurants')
          .index('by-date');

        return index
          .getAll()
          .then(restaurants => callback(null, restaurants))
          .catch(error => callback(error, null));
      })
      .then(() =>
        fetch(DBHelper.DATABASE_URL)
          .then(data => data.json())
          .then(restaurants => {
            // cache restaurants
            dbPromise
              .then(function(db) {
                if (!db) return;
                const tx = db.transaction('restaurants', 'readwrite');
                const store = tx.objectStore('restaurants');
                const dateIndex = store.index('by-date');
                restaurants.forEach(function(restaurant) {
                  store.put(restaurant);
                });
                // There's not more than 10 restaurantsin the db at the moment
                // but this would be needed if the db keep growing.
                return dateIndex.openCursor(null, 'prev');
              })
              .then(cursor => {
                if (!cursor) return;
                // Store the last 10 restaurants
                return cursor.advance(10);
              })
              .then(function removeOld(cursor) {
                if (!cursor) return;
                cursor.delete();
                return cursor.continue().then(removeOld);
              });

            return restaurants;
          })
          .then(restaurants => callback(null, restaurants))
          .catch(error => callback(error, null))
      );
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    dbPromise
      .then(function(db) {
        if (!db) return;
        const index = db
          .transaction('restaurants')
          .objectStore('restaurants')
          .index('id');

        return index
          .get(parseInt(id, 10))
          .then(restaurant => { 
            callback(null, restaurant);
            return restaurant;
          })
          .catch(error => callback(error, null));
      })
      .then(cachedRestaurant =>
        fetch(DBHelper.DATABASE_URL + id)
          .then(data => data.json())
          // cache the restaurant
          .then(restaurant =>
            dbPromise.then(function(db) {
              if (!db) return;
              const tx = db.transaction('restaurants', 'readwrite');
              const store = tx.objectStore('restaurants');
              store.put(restaurant);

              return restaurant;
            })
          )
          .then(restaurant => !cachedRestaurant && callback(null, restaurant))
          .catch(error => callback(error, null))
      );
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    callback
  ) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') {
          // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') {
          // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map(
          (v, i) => restaurants[i].neighborhood
        );
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter(
          (v, i) => neighborhoods.indexOf(v) == i
        );
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter(
          (v, i) => cuisines.indexOf(v) == i
        );
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Fetch reviews by restaurant with proper error handling.
   */
  static fetchReviewsByRestaurant(rid, callback) {
    dbPromise
    .then(function(db) {
      if (!db) return;
      const index = db
        .transaction('reviews')
        .objectStore('reviews')
        .index('by-restaurant');

      return index
        .getAll(parseInt(rid, 10))
        .then(reviews => callback(null, reviews))
        .catch(error => callback(error, null));
    })
    .then(() =>
      fetch(`${DBHelper.REVIEWS_DATABASE_URL}?restaurant_id=${rid}`)
        .then(data => data.json())
        .then(reviews => {
          // cache reviews
          dbPromise
            .then(function(db) {
              if (!db) return;
              const tx = db.transaction('reviews', 'readwrite');
              const store = tx.objectStore('reviews');
              const index = store.index('by-restaurant');

              reviews.forEach(function(review) {
                store.put(review);
              });

              return index.openCursor(null, 'prev');
            })
            .then(cursor => {
              if (!cursor) return;
              // Store the last 10 reviews
              return cursor.advance(10);
            })
            .then(function removeOld(cursor) {
              if (!cursor) return;
              cursor.delete();
              return cursor.continue().then(removeOld);
            });

          return reviews;
        })
        .then(reviews => callback(null, reviews))
        .catch(error => callback(error, null))
    );
  }

  /**
   * Mark a restaurant as favorite
   */
  static markAsFavorite(rid, isFavorite, callback = () => null) {
    fetch(`${DBHelper.DATABASE_URL}${rid}`, { 
      method: 'PUT',
      body: JSON.stringify({ is_favorite: isFavorite && isFavorite !== 'false' ? true : false }),
      headers:{
        'Content-Type': 'application/json'
      }
    })
      .then(data => data.json())
      .then(restaurant => {
        dbPromise.then(db => {
          const tx = db.transaction('restaurants', 'readwrite');
          const store = tx.objectStore('restaurants');

          callback(null, restaurant);
          return store.put(restaurant);
        });
      })
      .catch(error => callback(error, null));
  }

  /**
   * Add a Review.
   */
  static addReview(review, callback = () => null) {
    fetch(DBHelper.REVIEWS_DATABASE_URL, {
      method: 'POST',
      body: JSON.stringify(review),
      headers:{
        'Content-Type': 'application/json'
      }
    })
    .then(data => data.json())
    // cache the review
    .then(review =>
      dbPromise.then(function(db) {
        if (!db) return;
        const tx = db.transaction('reviews', 'readwrite');
        const store = tx.objectStore('reviews');
        store.put(review);

        return review;
      })
    )
    .then(review => callback(null, review))
    .catch(error => {
      callback(error, null); 
    });
  }

  /**
   * Add pending request
   */
  static addPendingRequest(request, callback = () => null) {
    dbPromise
      .then(function(db) {
        if (!db) return;
        const tx = db.transaction('pending_requests', 'readwrite');
        const store = tx.objectStore('pending_requests');
        store.put(request);

        return request;
      })
      .then(request => callback(null, request))
      .catch(error => {
        callback(error, null); 
      });
  }

  /**
   * Fetch all pending requests and empty the cache 
   */
  static fetchPendingRequests(callback = () => null) {
    dbPromise
      .then(function(db) {
        if (!db) return;
        const tx = db.transaction('pending_requests', 'readwrite');
        const requests = [];

        tx
        .objectStore('pending_requests')
        .iterateCursor(cursor => {
            if (!cursor) return;
            requests.push(cursor.value);
            cursor.delete();
            cursor.continue();
          });

          tx.complete
          .then(() => callback(null, requests))
          .catch(error => callback(error, null));
      });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant({ photograph = 'foodle' }, size = 'lg') {
    const imageSizes = {
      lg: `${photograph}.jpg`,
      sm: `${photograph}_sm.jpg`,
      sm2x: `${photograph}_sm2x.jpg`
    };
    return `/img/${imageSizes[size]}`;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    });
    return marker;
  }
}

window.DBHelper = DBHelperClass;
