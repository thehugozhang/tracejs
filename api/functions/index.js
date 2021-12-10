// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

// Access-Control-Allow-Origin S2S communication
const cors = require('cors')({origin: true});

// API Call Format:
// https://tracejs.co/api/v1/function?type=queryInfo
//
// Production Example:
// https://tracejs.co/api/v1/report?uid=FILL&pid=FILL&tag=FILL&error=FILL&line=FILL&source=FILL
//
// Development Example:
// https://us-central1-bug-log-js.cloudfunctions.net/report?uid=FILL&pid=FILL&tag=FILL&error=FILL&line=FILL&source=FILL
exports.report = functions.https.onRequest(async (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

	const userId = req.query.uid;
	const projectId = req.query.pid;
	
	const tagType = req.query.tag;
	const errorCode = req.query.error;
	const lineNo = req.query.line;
	const fileSource = req.query.source;
	const time = getDateTime();

	// const browser = getBrowser();

	// Replace tester-id-888 and test-project with dynamic values from firebase.config
	const getCallsLeft = await admin.firestore().collection('users').doc(userId).get().then((doc) => {
		var userData = doc.data()
		var callsRemaining = userData.remaining_api_calls

		if (callsRemaining > 0) {

			
			admin.firestore().collection('users').doc(userId).collection('projects').doc(projectId).get().then((doc) => {
				var projectData = doc.data()
				var incrementBugs = projectData.todays_bugs
				admin.firestore().collection('users').doc(userId).collection('projects').doc(projectId).update({
					todays_bugs: incrementBugs + 1
				})
			}).catch((error) => {
				// project doesn't exist
			});

			admin.firestore().collection('users').doc(userId).collection('projects').doc(projectId).collection('bugs').add({
				resolved: false,
				time: time,
				tag: tagType,
				error: errorCode,
				line: lineNo,
				source: fileSource,
				// browser: browser.name+' '+browser.version,
			});


			admin.firestore().collection('users').doc(userId).update({
				remaining_api_calls: callsRemaining - 1
			})

			// Send back a message that we've successfully written the message
			res.json({
				result: `Bug successfully reported.`,
				log: [ { time: time }, { tag: tagType }, { error: errorCode }, { line: lineNo }, { source: fileSource } ]
			});
		} else {
			// out of api calls
			res.json({
				result: `Bug not reported. No more API calls remaining. Please upgrade your plan to continue logging bugs.`,
			});
		}
	}).catch((error) => {
		// user doesn't exist
	});
	
});

exports.validate = functions.https.onRequest(async (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

	const url = req.query.url;
	const userId = req.query.uid;
	const projectId = req.query.pid;

	// Replace tester-id-888 and test-project with dynamic values from firebase.config
	const getResult = await admin.firestore().collection('users').doc(userId).collection('projects').doc(projectId).get().then((doc) => {
	    if (doc.exists) {
	        //console.log("Document data:", doc.data());
	        if (doc.data().whitelist.indexOf(url) > -1) {
	        	//part of whitelist
	        	// Send back a message that we've successfully written the message
				res.json({
					result: true,
					log: "Authorized"
				});
	        } else {
	        	//not part of whitelist
	        	res.json({
					result: false,
					log: "Unauthorized request. Please check your whitelist from your User Dashboard."
				});
	        }
	    } else {
	        // doc.data() will be undefined in this case
	        //console.log("No such document!");
	        res.json({
				result: false,
				log: "Project or user not found. Did you copy and paste your TraceJS Config object correctly?"
			});
	    }
	}).catch((error) => {
	    //console.log("Error getting document:", error);
	});	
});

// Listen for changes in all documents in the 'users' collection and all subcollections
exports.listenForBugNotifications = functions.firestore.document('users/{userId}/projects/{projectId}/bugs/{bugId}')
    .onCreate((change, context) => {
      // If we set `/users/marie/incoming_messages/134` to {body: "Hello"} then
      // context.params.userId == "marie";
      // context.params.messageCollectionId == "incoming_messages";
      // context.params.messageId == "134";
      // ... and ...
      // change.after.data() == {body: "Hello"}
    	admin.firestore().collection('users').doc(context.params.userId).collection('projects').doc(context.params.projectId).update({
			new_bugs: true,
		});
    });

exports.updateGraphs = functions.pubsub.schedule('0 * * * *').onRun(async () => {

	const db = admin.firestore();

	const querySnapshot = await db.collection("users").get()

	const usersProjectsPromise = [];

	querySnapshot.forEach(user => {
		const userRef = user.ref;
		// console.log("User ID: " + user.id)
		usersProjectsPromise.push(userRef.collection('projects').get())
	});

	const snapshotArrays = await Promise.all(usersProjectsPromise);

	const updateGraphsPromise = [];

	snapshotArrays.forEach(projectCol => {
		projectCol.forEach(project => {

			var projectData = project.data()


			var currentTodaysBugs = projectData.todays_bugs

			//arrays
	        var todayHourlyBugs = projectData.current24hours
	        var currentLast7days = projectData.last7days
	        var currentLast4weeks = projectData.last4weeks

	        //today array manipulation
			todayHourlyBugs.push(currentTodaysBugs)

			if (todayHourlyBugs.length == 25) {

				//daily array manipulations
				currentLast7days.shift()
	        	currentLast7days.push(currentTodaysBugs)

	        	currentLast4weeks.shift()
	        	currentLast4weeks.push(currentTodaysBugs)

	        	const newCurrent = [ 0 ]
	        	const reset = 0
	        	
				updateGraphsPromise.push(project.ref.update({
	        		current24hours: newCurrent,
					last24hours: todayHourlyBugs,
					last7days: currentLast7days,
					last4weeks: currentLast4weeks,
					todays_bugs: reset
				}))
	        } else {
	        	updateGraphsPromise.push(project.ref.update({
	        		current24hours: todayHourlyBugs
				}))
	        }
		})
	})

	return Promise.all(updateGraphsPromise);
});

// Helper functions

// Returns current date and time (UTC?) in format:
// 2021-6-22 19:57:05
function getDateTime() {
	// var today = new Date();
	// var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	// var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	// var dateTime = date+' '+time;
	return new Date().toLocaleString();
;
}
