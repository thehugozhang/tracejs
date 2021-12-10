var pidParam = localStorage['currentPID'] || 'No Project Selected';
var firstName = localStorage['name'] || '';
var projectName = localStorage['projectName'] || '';
var uid = ""
var listenBugNotificationAlert;
var listenAPICalls;

document.getElementById('projectname').textContent = projectName
document.getElementById('welcome-label').textContent = 'Welcome, ' + firstName

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    uid = user.uid;
    // alert(uid)

    var db = firebase.firestore();

    var userRef = db.collection("users").doc(uid); //.doc("tester-id-888")

    if (pidParam == 'No Project Selected') {
	    // pi not present, send back to console
	    console.log(pidParam)
	    window.location.href = "console.html";
	}

	var projectDocRef = db.collection("users").doc(uid).collection("projects").doc(pidParam);

	projectDocRef.get().then((doc) => {
	    if (doc.exists) {
	    	var data = doc.data()
	    	// last7DaysArray = data.las
	        document.getElementById('projectname').textContent = data.name

	        if (data.new_bugs) {
	        	// show notification
        		document.getElementById("newbugsalert").style.display = "block"
	        }
	    } else {
	        // doc.data() will be undefined in this case
	        console.log("No such document!");
	    }
	}).catch((error) => {
	    console.log("Error getting document:", error);
	});

	listenBugNotificationAlert = projectDocRef
	    .onSnapshot((doc) => {
	    	var data = doc.data()
	    	if (data.new_bugs) {
        		document.getElementById("newbugsalert").style.display = "block"
	    	}

	    });

	userRef.get().then((doc) => {
	    if (doc.exists) {
	    	var data = doc.data()
	        document.getElementById('apicallscount').textContent = data.remaining_api_calls
	        document.getElementById('bugreportscount').textContent = data.remaining_bug_reports
	        document.getElementById('welcome-label').textContent = 'Welcome, ' + data.admin_first

	    } else {
	        // doc.data() will be undefined in this case
	        console.log("No such document!");
	    }
	}).catch((error) => {
	    console.log("Error getting document:", error);
	});

	listenAPICalls = userRef
	    .onSnapshot((doc) => {
	    	var data = doc.data()
    		document.getElementById("apicallscount").textContent = data.remaining_api_calls
	    });
    // ...
  } else {
    // alert('No user logged in.')
    window.location.href = "login.html";
  }
});

document.getElementById("dismissnewbugsalert").onclick = function() {
	document.getElementById("newbugsalert").style.display = "none"
	//set new_bugs to false
	var db = firebase.firestore();
	db.collection("users").doc(uid).collection("projects").doc(pidParam).update({
		new_bugs: false,
	});
}

document.getElementById("logout-btn").onclick = function logout() {
	firebase.auth().signOut().then(() => {
	  // Sign-out successful.
	  localStorage.clear();
	  listenBugNotificationAlert()
	  listenAPICalls()
	  window.location.href = "index.html";
	}).catch((error) => {
	  // An error happened.
	  localStorage.clear();
	  listenBugNotificationAlert()
	  listenAPICalls()
	  window.location.href = "index.html";
	});
}