
window.getScript = function(source, callback) {
    var el = document.createElement('script');
    el.onload = callback;
    el.src = source;
    
    document.body.appendChild(el);
}
