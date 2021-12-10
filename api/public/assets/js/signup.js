signup_first = document.getElementById('signup-first')
signup_last = document.getElementById('signup-last')
signup_email = document.getElementById('signup-email')
signup_password = document.getElementById('signup-password')
signup_confirm = document.getElementById('signup-confirm')

document.getElementById("signup-btn").onclick = function() {
	if (signup_first.value == '') {
		showAlert("Please enter your first name.")
	} else if (signup_last.value == '') {
		showAlert("Please enter your last name.")
	} else if (signup_password.value != signup_confirm.value) {
		showAlert("Passwords must match.")
	} else {
		firebase.auth().createUserWithEmailAndPassword(signup_email.value, signup_password.value)
		.then((userCredential) => {
			// Signed in 
			var user = userCredential.user;
			var db = firebase.firestore();
			var newUserRef = db.collection("users").doc(user.uid);
			// Add a new document in collection "cities"
			newUserRef.set({
			    admin_first: signup_first.value,
			    admin_last: signup_last.value,
			    plan: "Developer", //replace with plan details
			    remaining_api_calls: 100,
			    remaining_bug_reports: 50,
			    remaining_projects: 1,
			})
			.then(() => {
			    window.location.href = "console.html"; //replace with payment portal
			})
			.catch((error) => {
			    // console.error("Error writing document: ", error);
			    showAlert("Something went wrong. Please try again later.")
			});
			
		})
		.catch((error) => {
			var errorCode = error.code;
			var errorMessage = error.message;
			if (errorMessage == "Password should be at least 6 characters" || errorMessage == "The password must be 6 characters long or more.") {
				showAlert("Password must be at least 6 characters or longer.")
			} else if (errorMessage == "The email address is badly formatted.") {
				showAlert("Please enter a valid email address.")
			} else {
				showAlert(errorMessage)
			}
		});
	}
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

