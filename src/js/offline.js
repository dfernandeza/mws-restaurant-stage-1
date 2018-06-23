
function registerServiceWorker() {
	if (!navigator.serviceWorker) return;

	window.addEventListener('load', function() {
		navigator.serviceWorker.register('/sw.js').then(function(reg) {
			if (!navigator.serviceWorker.controller) {
				return;
			}

			if (reg.waiting) {
				console.log('waiting');
				// updateReady(reg.waiting);
				return;
			}

			if (reg.installing) {
				console.log('installing');
				// trackInstalling(reg.installing);
				return;
			}

			reg.addEventListener('updatefound', function() {
				console.log('updatefound');
				// trackInstalling(reg.installing);
			});
		});

		navigator.serviceWorker.addEventListener('message', event => {
			if (event.data.message === 'failed_request') {
				DBHelper.addPendingRequest(event.data.request);
				console.log('Failed request:', event.data.request);
			} else if (event.data.message === 'sync') {
				retryPendingRequests();
			}
		});

		// Request a one-off sync
		navigator.serviceWorker.ready.then(function(swRegistration) {
			return swRegistration.sync.register('foodle-sync').catch((console.log));
		});
	});
}

function retryPendingRequests() {
	DBHelper.fetchPendingRequests((error, pendingRequests) => {
		if (error) {
			return;
		}
		// Retry requests
		pendingRequests.forEach(req => {
			const { url, method, body } = req;
			console.log('retrying: ', req);
			fetch(url, {
				method,
				body: JSON.stringify(body),
				headers:{
					'Content-Type': 'application/json'
				}
			});
		});
	});
}

// Connection Status
function isOnline () {
  var connectionStatus = document.getElementById('connection-status');

  if (navigator.onLine){
		retryPendingRequests();
    connectionStatus.classList.add('hidden');
  } else {
		connectionStatus.classList.remove('hidden');
  }
}

window.addEventListener('online', isOnline);
window.addEventListener('offline', isOnline);
isOnline();

registerServiceWorker();
