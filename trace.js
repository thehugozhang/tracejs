class tracejs {
	static init(config) {
		console.log("Here is the user id: " + config.id) //validate user id before allowing functionality
		console.log("Here is the project id: " + config.project_id)
		this.id = config.id;
		this.pid = config.project_id;
	}

	static report(tag, error, line, source) {
		var validation = new URL('https://tracejs.co/api/v1/validate')
		var whitelist = {url: this.getURL(), uid: this.id, pid: this.pid}

		// Passing url queries
		validation.search = new URLSearchParams(whitelist).toString();

		// API call using Fetch API (No IE11 support)
		fetch(validation).then(response => response.json())
		.then(data => {
			console.log('Success:', data);
			if (data.result) { // add || statement later for open security
				// Authorized API call
				var call = new URL('https://tracejs.co/api/v1/report')
				var param = { tag: tag,
							  error: error,
							  line: line,
							  source: source,
							  uid: this.id, 
							  pid: this.pid } 

				//passing url queries
				call.search = new URLSearchParams(param).toString();

				//api call using Fetch API (No IE11 support)
				fetch(call).then(response => response.json())
				.then(data => {
					console.log('Success:', data);
				})
				.catch((error) => {
					console.error('Error:', error);
				});
			} else {
				// Validation determined unauthorized API call
				console.error(data.log)
			}
		})
		.catch((error) => {
			console.error('Error:', error);
		});
	}

	static getURL() {
		return window.location.href;
	}	
}

//AUTHENTICATION
// Use whitelisted browser in User Dashboard and compare to url from client code
// Get whitelisted browser through protected firestore database

window.onerror = function (msg, url, lineNo, columnNo, error) {
	var tag = "General"
    var error = error.stack
    var line = lineNo
    var source = url
    tracejs.report(tag, error, line, source);
    return false;
}