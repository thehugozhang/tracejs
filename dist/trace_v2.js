
class tracejs {
	static init(config) {
		console.log("Here is the user id: " + config.id) //validate user id before allowing functionality
		console.log("Here is the project id: " + config.project_id)
		this.id = config.id;
		this.pid = config.project_id;
	}

	static report(code, tag) {
		var validation = new URL('https://tracejs.co/api/v1/validate')
		var whitelist = {url: this.getURL()}

		// Passing url queries
		validation.search = new URLSearchParams(whitelist).toString();

		// API call using Fetch API (No IE11 support)
		fetch(validation).then(response => response.json())
		.then(data => {
			console.log('Success:', data);
			if (data.result) { // add || statement later for open security
				// Authorized API call
				var call = new URL('https://tracejs.co/api/v1/report')
				var param = {code: code, tag: tag} 

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

window.onerror = function (msg, url, lineNo, columnNo, error) {
    var tag = url + " @ Ln " + lineNo + " Col " + columnNo
    var code = msg + ' ' + error
    console.log(msg)
    console.log(url)
    console.log(lineNo)
    console.log(columnNo)
    console.log(error)
    tracejs.report(code, tag);
    return false;
}
