emailInput = document.getElementById("emailInput")
passwordInput = document.getElementById("passwordInput")

document.getElementById("login").onclick = function() {
	firebase.auth().signInWithEmailAndPassword(emailInput.value, passwordInput.value)
	.then((userCredential) => {
		var user = userCredential.user;
		window.location.href = "console.html";
	})
	.catch((error) => {
		var errorCode = error.code;
		var errorMessage = error.message;
		if (errorMessage == "There is no user record corresponding to this identifier. The user may have been deleted.") {
			showAlert("We couldn't find an account with this email. Please sign up first!")
		} else if (errorMessage == "The email address is badly formatted.") {
			showAlert("Please enter a valid email address.")
		} else if (errorMessage == "The password is invalid or the user does not have a password.") {
			showAlert("The password you entered is incorrect.")
		} else {
			showAlert(errorMessage)
		}
	});
}

function showAlert(errorMessage) {
	try {
		document.getElementById("alert").remove()
	} catch(err) {
	}
	var alert = document.createElement("div")
	alert.classList.add("alert", "alert-warning", "alert-dismissible", "fade", "show");
	alert.setAttribute("role", "alert");
	alert.setAttribute("id", "alert");
	alert.innerHTML = "<strong>Oh no!</strong> " + errorMessage + "<button type='button' class='btn-close' data-bs-dismiss='alert' aria-label='Close'></button>"
	document.getElementById("topbox").insertBefore(alert, document.getElementById('login-title'))
}
