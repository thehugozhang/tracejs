var pidParam = localStorage['currentPID'] || 'No Project Selected';
var firstName = localStorage['name'] || '';
var projectName = localStorage['projectName'] || '';
var stopListeningToBugs;

document.getElementById('projectname').textContent = projectName
document.getElementById('welcome-label').textContent = 'Welcome, ' + firstName

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    var uid = user.uid;
    // alert(uid)

    var db = firebase.firestore();

    var userRef = db.collection("users").doc(uid); //.doc("tester-id-888")

    if (pidParam == 'No Project Selected') {
	    // pi not present, send back to console
	    console.log(pidParam)
	    window.location.href = "console.html";
	}

	var projectDocRef = db.collection("users").doc(uid).collection("projects").doc(pidParam)
	var projectBugsRef = db.collection("users").doc(uid).collection("projects").doc(pidParam).collection('bugs');

	db.collection("users").doc(uid).collection("projects").doc(pidParam).update({
		new_bugs: false,
	});

	projectDocRef.get().then((doc) => {
	    if (doc.exists) {
	    	var data = doc.data()
	        document.getElementById('projectname').textContent = data.name
	    } else {
	        // doc.data() will be undefined in this case
	        console.log("No such document!");
	    }
	}).catch((error) => {
	    console.log("Error getting document:", error);
	});

	// projectBugsRef.get().then((querySnapshot) => {
	//     querySnapshot.forEach((doc) => {
	//         console.log(doc.id, " => ", doc.data());
	//         //createProject(doc.id, doc.data().name)
	//         var data = doc.data()
	//         createBug(doc.id, data.time, data.tag, data.error, data.source, data.line)
	//     });
	// });

	stopListeningToBugs = projectBugsRef.onSnapshot((snapshot) => {
    	snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                // console.log("new bug");
                var data = change.doc.data()
                createBug(change.doc.id, data.time, data.tag, data.error, data.source, data.line)
            }
            if (change.type === "modified") {
                // console.log("modified bug");
            }
            if (change.type === "removed") {
                // console.log("removed bug");
            }
        });
    });

	userRef.get().then((doc) => {
	    if (doc.exists) {
	    	var data = doc.data()
	        document.getElementById('welcome-label').textContent = 'Welcome, ' + data.admin_first

	    } else {
	        // doc.data() will be undefined in this case
	        console.log("No such document!");
	    }
	}).catch((error) => {
	    console.log("Error getting document:", error);
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
  	  stopListeningToBugs()
  	  localStorage.clear();
	  window.location.href = "index.html";
	}).catch((error) => {
	  // An error happened.
  	  stopListeningToBugs()
  	  localStorage.clear();
	  window.location.href = "index.html";
	});
}

function createBug(bid, time, tag, error, source, line) {
	const col = document.createElement('div')
	col.classList.add("col-12")
	col.style.marginTop = "0rem"
	col.style.marginBottom = "1rem"

	const card = document.createElement('div')
	card.classList.add("app-card", "app-card-basic", "d-flex", "flex-column", "align-items-start", "app-card-custom-shadow")

	const cardHeader = document.createElement('div')
	cardHeader.classList.add("app-card-header", "p-3", "border-bottom-0", "w-100")
	const cardHeaderRow = document.createElement('div')
	cardHeaderRow.classList.add("row", "d-flex", "justify-content-between", "align-items-center", "gx-3", "w-100")
	cardHeaderRow.style.margin = "0"
	const cardHeaderRowCol1 = document.createElement('div')
	cardHeaderRowCol1.classList.add("col-auto", "d-flex", "align-items-center")
	const cardHeaderRowCol1H4 = document.createElement('h4')
	cardHeaderRowCol1H4.classList.add("bug-log-title")
	cardHeaderRowCol1H4.textContent = time + " UTC"
	const cardHeaderRowCol1Span = document.createElement('span')
	cardHeaderRowCol1Span.classList.add("badge", "rounded-pill", "bg-trace")
	cardHeaderRowCol1Span.style.marginLeft = ".5rem"
	cardHeaderRowCol1Span.textContent = tag
	const cardHeaderRowCol2 = document.createElement('div')
	cardHeaderRowCol2.classList.add("col-auto", "d-flex", "align-items-center")
	const cardHeaderRowCol2H4 = document.createElement('h4')
	cardHeaderRowCol2H4.classList.add("bug-id-gray")
	cardHeaderRowCol2H4.textContent = "Bug ID: "
	const cardHeaderRowCol2H4Span = document.createElement('span')
	cardHeaderRowCol2H4Span.style.fontWeight = "600"
	cardHeaderRowCol2H4Span.textContent = bid
	cardHeaderRowCol1.appendChild(cardHeaderRowCol1H4)
	cardHeaderRowCol1.appendChild(cardHeaderRowCol1Span)
	cardHeaderRowCol2H4.appendChild(cardHeaderRowCol2H4Span)
	cardHeaderRowCol2.appendChild(cardHeaderRowCol2H4)
	cardHeaderRow.appendChild(cardHeaderRowCol1)
	cardHeaderRow.appendChild(cardHeaderRowCol2)
	cardHeader.appendChild(cardHeaderRow)

	var errorArray = error.split(/\r?\n/)

	const cardBody = document.createElement('div')
	cardBody.classList.add("app-card-body", "px-4")
	cardBody.style.width = "100%"
	cardBody.style.height = "auto"
	const cardBodyError = document.createElement('div')
	cardBodyError.classList.add("p-2", "app-card-error")
	const cardBodyErrorLineError1 = document.createElement('div')
	cardBodyErrorLineError1.classList.add("line-error", "d-flex", "justify-content-between", "align-items-center")
	cardBodyErrorLineError1.style.fontFamily = "Fira Code,monospace"
	cardBodyErrorLineError1.style.fontWeight = "500"
	cardBodyErrorLineError1.style.fontSize = "0.875rem"
	const cardBodyErrorLineError1Div = document.createElement('div')
	cardBodyErrorLineError1Div.classList.add("d-flex", "align-items-center")
	const cardBodyErrorLineError1DivIcon = document.createElement('i')
	cardBodyErrorLineError1DivIcon.classList.add("bi", "bi-x-circle-fill")
	const cardBodyErrorLineError1DivP = document.createElement('p') //if not styled, add id = "error-line"
	cardBodyErrorLineError1DivP.style.margin = "0 0 0 0.5rem"
	cardBodyErrorLineError1DivP.textContent = errorArray[0]
	const cardBodyErrorLineError1P = document.createElement('p') //if not styled add id = "source-line"
	cardBodyErrorLineError1P.style.margin = "0 0.5rem 0 0"
	cardBodyErrorLineError1P.style.textDecoration = "underline"
	cardBodyErrorLineError1P.style.whiteSpace = "nowrap"
	cardBodyErrorLineError1P.style.color = "dimgray"
	cardBodyErrorLineError1P.textContent = source + ":" + line
	const cardBodyErrorLineErrorNoIcon = document.createElement('div')
	cardBodyErrorLineErrorNoIcon.classList.add("line-error-no-icon", "d-flex", "justify-content-between", "align-items-center")
	cardBodyErrorLineErrorNoIcon.style.fontFamily = "Fira Code,monospace"
	cardBodyErrorLineErrorNoIcon.style.fontWeight = "500"
	cardBodyErrorLineErrorNoIcon.style.fontSize = "0.875rem"
	const cardBodyErrorLineErrorNoIconDiv = document.createElement('div')
	cardBodyErrorLineErrorNoIconDiv.classList.add("d-flex", "align-items-center")
	const cardBodyErrorLineErrorNoIconDivIcon = document.createElement('i')
	cardBodyErrorLineErrorNoIconDivIcon.classList.add("bi", "bi-x-circle-fill")
	cardBodyErrorLineErrorNoIconDivIcon.style.visibility = "hidden"
	const cardBodyErrorLineErrorNoIconDivP = document.createElement('p')
	cardBodyErrorLineErrorNoIconDivP.style.margin = "0 0 0 0.5rem"
	cardBodyErrorLineErrorNoIconDivP.textContent = errorArray[1] //"at HTMLButtonElement.document.getElementById.onclick (main.js:5)"
	cardBodyErrorLineError1Div.appendChild(cardBodyErrorLineError1DivIcon)
	cardBodyErrorLineError1Div.appendChild(cardBodyErrorLineError1DivP)
	cardBodyErrorLineError1.appendChild(cardBodyErrorLineError1Div)
	cardBodyErrorLineError1.appendChild(cardBodyErrorLineError1P)
	cardBodyErrorLineErrorNoIconDiv.appendChild(cardBodyErrorLineErrorNoIconDivIcon)
	cardBodyErrorLineErrorNoIconDiv.appendChild(cardBodyErrorLineErrorNoIconDivP)
	cardBodyErrorLineErrorNoIcon.appendChild(cardBodyErrorLineErrorNoIconDiv)
	cardBodyError.appendChild(cardBodyErrorLineError1)
	cardBodyError.appendChild(cardBodyErrorLineErrorNoIcon)
	cardBody.appendChild(cardBodyError)

	const cardFooter = document.createElement('div')
	cardFooter.classList.add("app-card-footer", "p-4", "mt-auto")
	const cardFooterView = document.createElement('a')
	cardFooterView.classList.add("btn", "app-btn-secondary")
	cardFooterView.textContent = "View full report"
	const cardFooterMark = document.createElement('a')
	cardFooterMark.classList.add("btn", "app-btn-secondary")
	cardFooterMark.style.marginLeft = "0.25rem"
	cardFooterMark.textContent = "Mark as resolved"
	cardFooter.appendChild(cardFooterView)
	cardFooter.appendChild(cardFooterMark)

	card.appendChild(cardHeader)
	card.appendChild(cardBody)
	card.appendChild(cardFooter)

	col.appendChild(card)
	
	// if (newBug) {
	// 	document.getElementById("load-bugs-below").insertBefore(col, document.getElementById("insertNewBugsBefore"))
	// } else {
	// 	// loading existing bug
	// 	document.getElementById("load-bugs-below").appendChild(col)
	// }

	document.getElementById("load-bugs-below").appendChild(col)
}




























