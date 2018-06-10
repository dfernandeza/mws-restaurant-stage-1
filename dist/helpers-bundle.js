window.getScript=function(n,e){var t=document.createElement("script");t.onload=e,t.src=n,document.body.appendChild(t)},navigator.serviceWorker&&window.addEventListener("load",function(){navigator.serviceWorker.register("/sw.js").then(function(n){navigator.serviceWorker.controller&&(n.waiting?console.log("waiting"):n.installing?console.log("installing"):n.addEventListener("updatefound",function(){console.log("updatefound")}))})});var n=function(){function r(n,e){for(var t=0;t<e.length;t++){var r=e[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(n,r.key,r)}}return function(n,e,t){return e&&r(n.prototype,e),t&&r(n,t),n}}();var e=1;var u=idb.open("foodle",e,function(n){switch(n.oldVersion){case 0:var e=n.createObjectStore("restaurants",{keyPath:"id"});e.createIndex("id","id"),e.createIndex("by-date","createdAt")}}),DBHelperClass=function(){function DBHelperClass(){!function(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}(this,DBHelperClass)}return n(DBHelperClass,null,[{key:"fetchRestaurants",value:function(e){u.then(function(n){if(n)return n.transaction("restaurants").objectStore("restaurants").index("by-date").getAll().then(function(n){return e(null,n)}).catch(function(n){return e(n,null)})}).then(function(){return fetch(DBHelper.DATABASE_URL).then(function(n){return n.json()}).then(function(r){return u.then(function(n){if(n){var e=n.transaction("restaurants","readwrite").objectStore("restaurants"),t=e.index("by-date");return r.forEach(function(n){e.put(n)}),t.openCursor(null,"prev")}}).then(function(n){if(n)return n.advance(10)}).then(function n(e){if(e)return e.delete(),e.continue().then(n)}),r}).then(function(n){return e(null,n)}).catch(function(n){return e(n,null)})})}},{key:"fetchRestaurantById",value:function(t,r){u.then(function(n){if(n)return n.transaction("restaurants").objectStore("restaurants").index("id").get(parseInt(t,10)).then(function(n){return r(null,n),n}).catch(function(n){return r(n,null)})}).then(function(e){return fetch(DBHelper.DATABASE_URL+t).then(function(n){return n.json()}).then(function(e){return u.then(function(n){if(n)return n.transaction("restaurants","readwrite").objectStore("restaurants").put(e),e})}).then(function(n){return!e&&r(null,n)}).catch(function(n){return r(n,null)})})}},{key:"fetchRestaurantByCuisine",value:function(r,u){DBHelper.fetchRestaurants(function(n,e){if(n)u(n,null);else{var t=e.filter(function(n){return n.cuisine_type==r});u(null,t)}})}},{key:"fetchRestaurantByNeighborhood",value:function(r,u){DBHelper.fetchRestaurants(function(n,e){if(n)u(n,null);else{var t=e.filter(function(n){return n.neighborhood==r});u(null,t)}})}},{key:"fetchRestaurantByCuisineAndNeighborhood",value:function(r,u,o){DBHelper.fetchRestaurants(function(n,e){if(n)o(n,null);else{var t=e;"all"!=r&&(t=t.filter(function(n){return n.cuisine_type==r})),"all"!=u&&(t=t.filter(function(n){return n.neighborhood==u})),o(null,t)}})}},{key:"fetchNeighborhoods",value:function(u){DBHelper.fetchRestaurants(function(n,t){if(n)u(n,null);else{var r=t.map(function(n,e){return t[e].neighborhood}),e=r.filter(function(n,e){return r.indexOf(n)==e});u(null,e)}})}},{key:"fetchCuisines",value:function(u){DBHelper.fetchRestaurants(function(n,t){if(n)u(n,null);else{var r=t.map(function(n,e){return t[e].cuisine_type}),e=r.filter(function(n,e){return r.indexOf(n)==e});u(null,e)}})}},{key:"urlForRestaurant",value:function(n){return"./restaurant.html?id="+n.id}},{key:"imageUrlForRestaurant",value:function(n){var e=n.photograph,t=void 0===e?"foodle":e;return"/img/"+{lg:t+".jpg",sm:t+"_sm.jpg",sm2x:t+"_sm2x.jpg"}[1<arguments.length&&void 0!==arguments[1]?arguments[1]:"lg"]}},{key:"mapMarkerForRestaurant",value:function(n,e){return new google.maps.Marker({position:n.latlng,title:n.name,url:DBHelper.urlForRestaurant(n),map:e,animation:google.maps.Animation.DROP})}},{key:"DATABASE_URL",get:function(){return"http://localhost:1337/restaurants/"}}]),DBHelperClass}();window.DBHelper=DBHelperClass;
//# sourceMappingURL=helpers-bundle.js.map
