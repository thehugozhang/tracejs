var firstName = localStorage['name'] || '';

document.getElementById('welcome-label').textContent = 'Welcome, ' + firstName

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    var uid = user.uid;
    // alert(uid)

    var db = firebase.firestore();

    var userRef = db.collection("users").doc(uid); //.doc("tester-id-888")
    var projectsCollectionRef = db.collection("users").doc(uid).collection("projects")

	userRef.get().then((doc) => {
	    if (doc.exists) {
	    	var data = doc.data()
	        document.getElementById('projects-remaining-count').textContent = data.remaining_projects
	        document.getElementById('welcome-label').textContent = 'Welcome, ' + data.admin_first
	        localStorage['name'] = data.admin_first
	    } else {
	        // doc.data() will be undefined in this case
	        console.log("No such document!");
	    }
	}).catch((error) => {
	    console.log("Error getting document:", error);
	});

	projectsCollectionRef.get().then((querySnapshot) => {
	    querySnapshot.forEach((doc) => {
	        // console.log(doc.id, " => ", doc.data());
	        createProject(doc.id, doc.data().name)
	    });
	});

    // ...
  } else {
    // alert('No user logged in.')
    window.location.href = "login.html";
  }
});

document.getElementById("logout-btn").onclick = function logout() {
	firebase.auth().signOut().then(() => {
	  // Sign-out successful.
	  localStorage.clear();
	  window.location.href = "index.html";
	}).catch((error) => {
	  // An error happened.
	  localStorage.clear();
	  window.location.href = "index.html";
	});
}

document.getElementById("createProjectButton").onclick = function() {
	if (document.getElementById("projectNameInput").value == '') {
		document.getElementById("projectNameInputLabel").style.color = "red"
		document.getElementById("projectNameInputLabel").textContent = "Project name is required"
	}
	else {
		firebase.auth().onAuthStateChanged((user) => {
		  if (user) {
		    var uid = user.uid;
		    var db = firebase.firestore();
		    var projectsCollectionRef = db.collection("users").doc(uid).collection("projects")

		    var date = new Date();
  			var hours = date.getHours() + 1;

		    projectsCollectionRef.add({
		    	last24hours: new Array(25).fill(0),
		    	current24hours: new Array(hours).fill(0),
		    	last4weeks: new Array(56).fill(0),
		    	last7days: new Array(14).fill(0),
		    	todays_bugs: 0,
		    	name: document.getElementById("projectNameInput").value,
		    	new_bugs: false,
		    	whitelist: []

		    }).then((docRef) => {
			    localStorage['currentPID'] = docRef.id;
			    localStorage['projectName'] = document.getElementById("projectNameInput").value
			    window.location.href = "dashboard.html";
			})
		  } else {
		    // alert('No user logged in.')
		    window.location.href = "login.html";
		  }
		});
	}
}

function createProject(pid, name) {
	const col = document.createElement('div')
	col.classList.add("col-12", "col-lg-4", "col-md-6", "col-sm-12", "mb-4", "project-card-col")

	const projectCard = document.createElement('div')
	projectCard.classList.add("card", "mb-3", "project-card", "shadow-sm", "toDashboard")
	projectCard.id = pid
	projectCard.setAttribute("projectName", name)

	const cardHeader = document.createElement('div')
	cardHeader.classList.add("card-header", "bg-transparent", "project-card-header")

	const header = document.createElement('h1')
	header.textContent = name

	const paragraph = document.createElement('p')
	paragraph.textContent = 'Project ID: ' + pid

	const cardBody = document.createElement('div')
	cardBody.classList.add("card-body", "d-flex", "align-items-center")

	const cardFooter = document.createElement('div')
	cardFooter.classList.add("card-footer", "bg-transparent", "d-flex", "justify-content-between", "project-card-footer")

	const iconDiv = document.createElement('div')
	iconDiv.classList.add("d-flex", "align-items-center")

	const icon = document.createElement('i')
	icon.classList.add("bi", "bi-code-slash")
	icon.style.fontSize = "1.25rem"

	iconDiv.appendChild(icon)
	cardFooter.appendChild(iconDiv)

	cardHeader.appendChild(header)
	cardHeader.appendChild(paragraph)

	projectCard.appendChild(cardHeader)
	projectCard.appendChild(cardBody)
	projectCard.appendChild(cardFooter)
	projectCard.addEventListener('click', toDashboard, false);

	col.appendChild(projectCard)

	document.getElementById("projects-row").appendChild(col)
}

function toDashboard() {
    var id = this.id;
    localStorage['currentPID'] = id;
    localStorage['projectName'] = this.getAttribute("projectName")
    window.location.href = "dashboard.html";
};