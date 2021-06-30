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

// Returns browser info in format:
// {
//   "name": "Chrome",
//   "version": "91"
// }
function getBrowser() {
    var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []; 
    if(/trident/i.test(M[1])){
        tem=/\brv[ :]+(\d+)/g.exec(ua) || []; 
        return {name:'IE',version:(tem[1]||'')};
        }   
    if(M[1]==='Chrome'){
        tem=ua.match(/\bOPR|Edge\/(\d+)/)
        if(tem!=null)   {return {name:'Opera', version:tem[1]};}
        }   
    M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
    return {
      name: M[0],
      version: M[1]
    };
 }

window.onerror = function (msg, url, lineNo, columnNo, error) {
    var browser = getBrowser()
    var tag = url + " @ Ln " + lineNo + " Col " + columnNo
    var code = browser.name + " " + browser.version + " " + msg
    console.log(code)
    tracejs.report(code, tag);
    return false;
}
