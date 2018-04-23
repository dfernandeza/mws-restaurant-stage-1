document.addEventListener("DOMContentLoaded",function(e){fetchNeighborhoods(),fetchCuisines()}),fetchNeighborhoods=function(){DBHelper.fetchNeighborhoods(function(e,n){e?console.error(e):(self.neighborhoods=n,fillNeighborhoodsHTML())})},fillNeighborhoodsHTML=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.neighborhoods,t=document.getElementById("neighborhoods-select");e.forEach(function(e){var n=document.createElement("option");n.innerHTML=e,n.value=e,t.append(n)})},fetchCuisines=function(){DBHelper.fetchCuisines(function(e,n){e?console.error(e):(self.cuisines=n,fillCuisinesHTML())})},fillCuisinesHTML=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.cuisines,t=document.getElementById("cuisines-select");e.forEach(function(e){var n=document.createElement("option");n.innerHTML=e,n.value=e,t.append(n)})},window.initMap=function(){self.map=new google.maps.Map(document.getElementById("map"),{zoom:12,center:{lat:40.722216,lng:-73.987501},scrollwheel:!1}),updateRestaurants()},updateRestaurants=function(){var e=document.getElementById("cuisines-select"),n=document.getElementById("neighborhoods-select"),t=e.selectedIndex,r=n.selectedIndex,a=e[t].value,s=n[r].value;DBHelper.fetchRestaurantByCuisineAndNeighborhood(a,s,function(e,n){e?console.error(e):(resetRestaurants(n),fillRestaurantsHTML())})},resetRestaurants=function(e){self.restaurants=[],self.markers=self.markers||[],document.getElementById("restaurants-list").innerHTML="",self.markers.forEach(function(e){return e.setMap(null)}),self.markers=[],self.restaurants=e},fillRestaurantsHTML=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurants,n=document.getElementById("restaurants-list");e.forEach(function(e){n.append(createRestaurantHTML(e))}),addMarkersToMap()},createRestaurantHTML=function(e){var n=document.createElement("li");n.className="restaurant-card";var t=document.createElement("img"),r=DBHelper.imageUrlForRestaurant(e,"sm"),a=DBHelper.imageUrlForRestaurant(e,"sm2x");t.className="restaurant-card__img",t.src=r,t.srcset=r+", "+a+" 2x",t.alt="Image of "+e.name+" restaurant",n.append(t);var s=document.createElement("div");s.className="restaurant-card__body";var o=document.createElement("h2");o.innerHTML=e.name,s.append(o);var l=document.createElement("p");l.innerHTML=e.neighborhood,s.append(l);var i=document.createElement("p");i.innerHTML=e.address,s.append(i);var c=document.createElement("a");return c.innerHTML="View Details",c.href=DBHelper.urlForRestaurant(e),s.append(c),n.append(s),n},addMarkersToMap=function(){(0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurants).forEach(function(e){var n=DBHelper.mapMarkerForRestaurant(e,self.map);google.maps.event.addListener(n,"click",function(){window.location.href=n.url}),self.markers.push(n)})};
//# sourceMappingURL=home-bundle.js.map