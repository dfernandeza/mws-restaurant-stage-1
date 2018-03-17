
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
	});
}

registerServiceWorker();
