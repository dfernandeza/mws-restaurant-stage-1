
function registerServiceWorker() {
	if (!navigator.serviceWorker) return;

	window.addEventListener('load', function() {
		navigator.serviceWorker.register('/sw.js').then(function(reg) {
			if (!navigator.serviceWorker.controller) {
				return;
			}

			if (reg.waiting) {
				console.log('waiting');
				// indexController._updateReady(reg.waiting);
				return;
			}

			if (reg.installing) {
				console.log('installing');
				// indexController._trackInstalling(reg.installing);
				return;
			}

			reg.addEventListener('updatefound', function() {
				console.log('updatefound');
				// indexController._trackInstalling(reg.installing);
			});
		});

		// Then later, request a one-off sync:
		navigator.serviceWorker.ready.then(function(swRegistration) {
			return swRegistration.sync.register('foodle-sync').catch((console.log));
		});
	});
}

// Connection Status
function isOnline () {
  var connectionStatus = document.getElementById('connection-status');

  if (navigator.onLine){
		// runRetryRequests();
    connectionStatus.classList.add('hidden');
  } else {
		connectionStatus.classList.remove('hidden');
  }
}

window.addEventListener('online', isOnline);
window.addEventListener('offline', isOnline);
isOnline();

registerServiceWorker();
