chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('main.html', {
        bounds: {
            top: 0,
            left: 0,
            width: 1280,
            height: 720
        }
    });
})

chrome.runtime.onSuspend.addListener(function() {
	
});