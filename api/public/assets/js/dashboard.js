const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var last7DaysArray = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1]

function formatDate(date){
  var dd = date.getDate();
  var mm = date.getMonth()+1;
  date = mm+'/'+dd;
  return date
}

function wordDate(md){
  var parts = md.split('/')
  return monthNames[parts[0]-1] + " " + parts[1]
}

function lastWeek(md){
  var parts = md.split('/')
  var currentYear = new Date().getFullYear()
  var current = new Date(currentYear, parts[0], parts[1])
  var last = new Date(current - 7 * 24 * 60 * 60 * 1000)
  var formatted = monthNames[last.getMonth()-1] + " " + last.getDate()
  return formatted
}

function lastMonth(md){
  var parts = md.split('/')
  var currentYear = new Date().getFullYear()
  var current = new Date(currentYear, parts[0], parts[1])
  var last = new Date(current - 28 * 24 * 60 * 60 * 1000)
  var formatted = monthNames[last.getMonth()-1] + " " + last.getDate()
  return formatted
}

function getCurrentDateMD() {
  var current = formatDate(new Date())
  return current
}

function Last7Days () {
  var result = [];
  for (var i=0; i<7; i++) {
    var d = new Date();
    d.setDate(d.getDate() - i);
    result.push( formatDate(d) )
  }
  return result.reverse();
}

function Last28Days () {
  var result = [];
  for (var i=0; i<28; i++) {
    var d = new Date();
    d.setDate(d.getDate() - i);
    result.push( formatDate(d) )
  }
  return result.reverse();
}

function add60ticks(array) {
  var currentFill = 0;
  let graphdata = new Array(1440)
  for (var i = 0; i < 1440; i++) {
    if (i % 60 == 0) {
      currentFill = array[i/60]
    }
    graphdata[i] = currentFill
  }
  return graphdata
}

function configFirebaseArray(array) {
  // split into separate time periods and reverse for display
  var half_length = Math.floor(array.length / 2);
  var full_length = array.length;
  var lastWeekArray = array.slice(0,half_length)
  var thisWeekArray = array.slice(half_length, full_length)
  return [thisWeekArray, lastWeekArray]
}

function returnHHMM() {
  var d = new Date();
  var hours;
  var minutes;
  var meridiem;
  if (d.getHours() > 12) {
    hours = d.getHours() - 12
      meridiem = " PM"
  } else {
    hours = d.getHours()
      meridiem = " AM"
  }
  if (d.getMinutes() < 10) {
    minutes = "0" + d.getMinutes()
  } else {
    minutes = d.getMinutes()
  }
  return hours + ":" + minutes + meridiem
}

// var x = 1; //minutes interval
// var times = []; // time array
// var tt = 0; // start time
// var ap = ['AM', 'PM']; // AM-PM

// //loop to increment the time and push results in array
// for (var i=0;tt<24*60; i++) {
//   var hh = Math.floor(tt/60); // getting hours of day in 0-24 format
//   var mm = (tt%60); // getting minutes of the hour in 0-55 format
//   times[i] = ("0" + (hh % 12)).slice(-2) + ':' + ("0" + mm).slice(-2) + " " + ap[Math.floor(hh/12)]; // pushing data in array in [00:00 - 12:00 AM/PM format]
//   tt = tt + x;
// }


// **************************
//
//
// TODAY CHART CONFIGURATION
//
//
// **************************

const externalTodayTooltipHandler = (context) => {
  const {chart, tooltip} = context;
  if (tooltip.body) {
    const titleLines = tooltip.title || [];
    const bodyLines = tooltip.body.map(b => b.lines);

    titleLines.forEach(title => {
      document.getElementById("today-time").innerHTML = 'Today, ' + title
      document.getElementById("yesterday-time").innerHTML = 'Yesterday, ' + title
    });

    var compiledText = ''

    bodyLines.forEach((body, i) => {
      const colors = tooltip.labelColors[i];
      compiledText += body + "~"
    });

    var fields = compiledText.split('~');

    if (fields[1] == '') {
      document.getElementById("today-bugs-label").innerHTML = '<span id = "today-amount">&mdash;</span>'
      // document.getElementById("today-amount").innerHTML = ''
      document.getElementById("today-time").innerHTML = 'Upcoming'
      document.getElementById("yesterday-amount").innerHTML = fields[0]
      document.getElementById('dailyPercentageIncrease').style.visibility = "hidden"

    } else {
      document.getElementById("today-bugs-label").innerHTML = '<span id = "today-amount">' + fields[0] + '</span> bugs'
      document.getElementById("yesterday-amount").innerHTML = fields[1]
      var pchange = '%'
      if (fields[1] == fields[0]) {
        pchange = 'No Change'
        document.getElementById('dailyPercentageIncrease').classList.remove('percentage-bg-positive', 'percentage-bg-negative')
        document.getElementById('dailyPercentageIncrease').classList.add('percentage-bg-nochange')
      } else if (fields[1] == 0) {
        pchange = '+100.0%'
      } else {
        if ( (((fields[0] - fields[1]) / fields[1] ) * 100) > 0) {  
          pchange = '+' + ( ( (fields[0] - fields[1]) / fields[1] ) * 100).toFixed(1) + '%'
          document.getElementById('dailyPercentageIncrease').classList.remove('percentage-bg-positive', 'percentage-bg-nochange')
          document.getElementById('dailyPercentageIncrease').classList.add('percentage-bg-negative')
        } else {
          pchange = ( ( (fields[0] - fields[1]) / fields[1] ) * 100).toFixed(1) + '%'
          if ( (((fields[0] - fields[1]) / fields[1] ) * 100) == 0) {
            document.getElementById('dailyPercentageIncrease').classList.remove('percentage-bg-positive', 'percentage-bg-negative')
            document.getElementById('dailyPercentageIncrease').classList.add('percentage-bg-nochange')
          } else {
            document.getElementById('dailyPercentageIncrease').classList.remove('percentage-bg-negative', 'percentage-bg-nochange')
            document.getElementById('dailyPercentageIncrease').classList.add('percentage-bg-positive')
          }
        }
      }
      document.getElementById('dailyPercentageIncrease').textContent = pchange
      document.getElementById('dailyPercentageIncrease').style.visibility = "visible"
    }

  }
};

const todayLabels =  ["12:00 AM", "1:00 AM", "2:00 AM", "3:00 AM", "4:00 AM", "5:00 AM", "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
                      "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM", "11:59 PM"];
var todayData = {
  labels: todayLabels,
  datasets: [
    {
      data: [], //replace with current today data
      borderColor: 'rgba(65, 84, 241, 0.7)',
      borderRadius: 4,
      tension: 0,
    },
    {
      data: [0, 0, 0, 0, 0, 0,
             0, 0, 0, 0, 0, 0,
             0, 0, 0, 0, 0, 0,
             0, 0, 0, 0, 0, 0], //replace with last today data
      borderColor:'rgba(211, 211, 211, 0.7)',
      borderRadius: 4,
      tension: 0,
    }
  ]
};

var todayConfig = {
  type: 'line',
  data: todayData,
  options: {
    interaction: {
      mode: 'index',
      intersect: false,
    },
    elements: {
      point:{
          radius: 1
      }
    },
    responsive: true,
    scales: {
      x: {
        grid: {
          display: true,
          drawTicks: false,
        },
        ticks: {
          display: false,
          callback: function(value, index, values) {
            if (value == 0) {
              return '12:00 AM'
            } else if (value == 24) {
              return '11:59 PM'
            } else {
              return ''
            }
            
          }
        }
      },
      y: {
        display: true,
        grid: {
          borderDash: [8,4],
          drawBorder: false,
          display: false
        },
        beginAtZero: true,
        ticks: {
          // forces step size to be 50 units
          // stepSize: 3
          display: false
        } 
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: false,
        position: 'nearest',
        external: externalTodayTooltipHandler
      },
      datalabels: {
        display: false,
      },
    }
  },
};

document.getElementById('todayCanvasContainer').onmouseleave = function() {
  document.getElementById("today-bugs-label").innerHTML = '<span id = "today-amount">' + Math.max.apply(Math, todayData.datasets[0].data) + '</span> bugs' 
  document.getElementById("yesterday-amount").textContent = Math.max.apply(Math, todayData.datasets[1].data)
  document.getElementById("today-time").textContent = "Today, " + returnHHMM() //replace with actual dates
  document.getElementById("yesterday-time").textContent = "Yesterday" //replace with actual dates
  document.getElementById('dailyPercentageIncrease').style.visibility = "hidden"
}

// **************************
//
//
// WEEKLY CHART CONFIGURATION
//
//
// **************************

const externalTooltipHandler = (context) => {
  const {chart, tooltip} = context;
  if (tooltip.body) {
    const titleLines = tooltip.title || [];
    const bodyLines = tooltip.body.map(b => b.lines);

    titleLines.forEach(title => {
      document.getElementById("todaydate").innerHTML = wordDate(title)
      document.getElementById("lastdate").innerHTML = lastWeek(title)
    });

    var compiledText = ''

    bodyLines.forEach((body, i) => {
      const colors = tooltip.labelColors[i];
      compiledText += body + "~"
    });

    var fields = compiledText.split('~');

    document.getElementById("todayamount").innerHTML = fields[0]
    document.getElementById("lastamount").innerHTML = fields[1]

    var pchange = '%'
    if (fields[1] == fields[0]) {
      pchange = 'No Change'
      document.getElementById('weeklyPercentageIncrease').classList.remove('percentage-bg-positive', 'percentage-bg-negative')
      document.getElementById('weeklyPercentageIncrease').classList.add('percentage-bg-nochange')
    } else if (fields[1] == 0) {
      pchange = '+100.0%'
    } else {
      if ( (((fields[0] - fields[1]) / fields[1] ) * 100) > 0) {  
        pchange = '+' + ( ( (fields[0] - fields[1]) / fields[1] ) * 100).toFixed(1) + '%'
        document.getElementById('weeklyPercentageIncrease').classList.remove('percentage-bg-positive', 'percentage-bg-nochange')
        document.getElementById('weeklyPercentageIncrease').classList.add('percentage-bg-negative')
      } else {
        pchange = ( ( (fields[0] - fields[1]) / fields[1] ) * 100).toFixed(1) + '%'
        if ( (((fields[0] - fields[1]) / fields[1] ) * 100) == 0) {
          document.getElementById('weeklyPercentageIncrease').classList.remove('percentage-bg-positive', 'percentage-bg-negative')
          document.getElementById('weeklyPercentageIncrease').classList.add('percentage-bg-nochange')
        } else {
          document.getElementById('weeklyPercentageIncrease').classList.remove('percentage-bg-negative', 'percentage-bg-nochange')
          document.getElementById('weeklyPercentageIncrease').classList.add('percentage-bg-positive')
        }
      }
    }
    document.getElementById('weeklyPercentageIncrease').textContent = pchange
  }
};

const labels = Last7Days()

var weeklyData = {
  labels: labels,
  datasets: [
    {
      data: configFirebaseArray([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])[0], //replace with current week data, sum: 28 // THIS WEEK
      borderColor: 'rgba(65, 84, 241, 0.7)',
      borderRadius: 4,
    },
    {
      data: configFirebaseArray([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])[1], //replace with last week data, sum: 25 // LAST WEEK
      borderColor:'rgba(211, 211, 211, 0.7)',
      borderRadius: 4,
    }
  ]
};

var weeklyConfig = {
  type: 'line',
  data: weeklyData,
  options: {
    interaction: {
      mode: 'index',
      intersect: false,
    },
    elements: {
      point:{
          radius: 1,
      }
    },
    responsive: true,
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          display: false,
          callback: function(value, index, values) {
            if (value == 6) {
              return "Today"
            } else if (value == 0) {
              return lastWeek(getCurrentDateMD())
            }
          }
        }
      },
      y: {
        display: true,
        grid: {
          borderDash: [8,4],
          drawBorder: false,
          display: false
        },
        beginAtZero: true,
        ticks: {
          // forces step size to be 50 units
          // stepSize: 3
          display: false
        } 
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: false,
        position: 'nearest',
        external: externalTooltipHandler
      }
    }
  },
};

document.getElementById("lastweek-leftlabel").textContent = lastWeek(getCurrentDateMD())

document.getElementById('weeklyCanvasContainer').onmouseleave = function() {
  document.getElementById("todayamount").textContent = weeklyData.datasets[0].data.reduce((a, b) => a + b, 0)
  document.getElementById("lastamount").textContent = weeklyData.datasets[1].data.reduce((a, b) => a + b, 0)
  document.getElementById("todaydate").textContent = "This Week"
  document.getElementById("lastdate").textContent = "Previous"

  var first_total = weeklyData.datasets[0].data.reduce((a, b) => a + b, 0)
  var second_total = weeklyData.datasets[1].data.reduce((a, b) => a + b, 0)

  var pchange = '%'
    if (second_total == first_total) {
      pchange = 'No Change'
    } else if (second_total == 0) {
      pchange = '+100.0%'
    } else {
      if ( (((first_total - second_total) / second_total ) * 100) > 0) {  
        pchange = '+' + ( ( (first_total - second_total) / second_total ) * 100).toFixed(1) + '%'
        document.getElementById('weeklyPercentageIncrease').classList.remove('percentage-bg-positive', 'percentage-bg-nochange')
        document.getElementById('weeklyPercentageIncrease').classList.add('percentage-bg-negative')
      } else {
        pchange = ( ( (first_total - second_total) / second_total ) * 100).toFixed(1) + '%'
        if ( (((first_total - second_total) / second_total ) * 100) == 0) {
          document.getElementById('weeklyPercentageIncrease').classList.remove('percentage-bg-positive', 'percentage-bg-negative')
          document.getElementById('weeklyPercentageIncrease').classList.add('percentage-bg-nochange')
        } else {
          document.getElementById('weeklyPercentageIncrease').classList.remove('percentage-bg-negative', 'percentage-bg-nochange')
          document.getElementById('weeklyPercentageIncrease').classList.add('percentage-bg-positive')
        }
      }
    }
  document.getElementById('weeklyPercentageIncrease').textContent = pchange

}

// **************************
//
//
// MONTHLY CHART CONFIGURATION
//
//
// **************************

const externalMonthlyTooltipHandler = (context) => {
  const {chart, tooltip} = context;

  if (tooltip.body) {
    const titleLines = tooltip.title || [];
    const bodyLines = tooltip.body.map(b => b.lines);

    titleLines.forEach(title => {

    document.getElementById("monthly-todaydate").innerHTML = wordDate(title)
    document.getElementById("monthly-lastdate").innerHTML = lastMonth(title)

    });

    var compiledText = ''

    bodyLines.forEach((body, i) => {
      const colors = tooltip.labelColors[i];
      compiledText += body + "~"
    });

    var fields = compiledText.split('~');

    document.getElementById("monthly-todayamount").innerHTML = fields[0]
    document.getElementById("monthly-lastamount").innerHTML = fields[1]

    var pchange = '%'
    if (fields[1] == fields[0]) {
      pchange = 'No Change'
      document.getElementById('monthlyPercentageIncrease').classList.remove('percentage-bg-positive', 'percentage-bg-negative')
      document.getElementById('monthlyPercentageIncrease').classList.add('percentage-bg-nochange')
    } else if (fields[1] == 0) {
      pchange = '+100.0%'
    } else {
      if ( (((fields[0] - fields[1]) / fields[1] ) * 100) > 0) {  
        pchange = '+' + ( ( (fields[0] - fields[1]) / fields[1] ) * 100).toFixed(1) + '%'
        document.getElementById('monthlyPercentageIncrease').classList.remove('percentage-bg-positive', 'percentage-bg-nochange')
        document.getElementById('monthlyPercentageIncrease').classList.add('percentage-bg-negative')
      } else {
        pchange = ( ( (fields[0] - fields[1]) / fields[1] ) * 100).toFixed(1) + '%'
        if ( (((fields[0] - fields[1]) / fields[1] ) * 100) == 0) {
          document.getElementById('monthlyPercentageIncrease').classList.remove('percentage-bg-positive', 'percentage-bg-negative')
          document.getElementById('monthlyPercentageIncrease').classList.add('percentage-bg-nochange')
        } else {
          document.getElementById('monthlyPercentageIncrease').classList.remove('percentage-bg-negative', 'percentage-bg-nochange')
          document.getElementById('monthlyPercentageIncrease').classList.add('percentage-bg-positive')
        }
      }
    }
    document.getElementById('monthlyPercentageIncrease').textContent = pchange
  }
};

const monthlylabels = Last28Days()

var monthlyData = {
  labels: monthlylabels,
  datasets: [
    {
      data: [2, 3, 0, 7, 4, 3, 9, 5, 6, 8, 3, 1, 3, 10, 11, 6, 9, 10, 11, 7, 8, 13, 21, 16, 13, 8, 10, 12], //replace with current month data set
      borderColor: 'rgba(65, 84, 241, 0.7)',
      borderRadius: 4,
    },
    {
      data: [6, 0, 2, 1, 7, 5, 4, 2, 3, 0, 7, 4, 3, 9, 5, 6, 8, 3, 1, 3, 10, 11, 12, 4, 2, 5, 13, 8], //replace with last month data set
      borderColor:'rgba(211, 211, 211, 0.7)',
      borderRadius: 4,
    }
  ]
};

var monthlyConfig = {
  type: 'line',
  data: monthlyData,
  options: {
    interaction: {
      mode: 'index',
      intersect: false,
    },
    elements: {
      point:{
          radius: 1,
      }
    },
    responsive: true,
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          display: false,
          callback: function(value, index, values) {
            if (value == 27) {
              return "Today"
            } else if (value == 0) {
              return lastMonth(getCurrentDateMD())
            }
          }
        }
      },
      y: {
        display: true,
        grid: {
          borderDash: [8,4],
          drawBorder: false,
          display: false
        },
        beginAtZero: true,
        ticks: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: false,
        position: 'nearest',
        external: externalMonthlyTooltipHandler
      }
    }
  },
};

window.onload = function() {
  document.getElementById("last4weeks-leftlabel").textContent = lastMonth(getCurrentDateMD())
  document.getElementById("monthly-todaydate").textContent = "This Month"
  document.getElementById("monthly-lastdate").textContent = "Previous"

  document.getElementById("lastweek-leftlabel").textContent = lastWeek(getCurrentDateMD())
  document.getElementById("todaydate").textContent = "This Week"
  document.getElementById("lastdate").textContent = "Previous"

}

document.getElementById("last4weeks-leftlabel").textContent = lastMonth(getCurrentDateMD())
document.getElementById('monthlyCanvasContainer').onmouseleave = function() {
  document.getElementById("monthly-todayamount").textContent = monthlyData.datasets[0].data.reduce((a, b) => a + b, 0)
  document.getElementById("monthly-lastamount").textContent = monthlyData.datasets[1].data.reduce((a, b) => a + b, 0)
  document.getElementById("monthly-todaydate").textContent = "This Month"
  document.getElementById("monthly-lastdate").textContent = "Previous"

  var first_total = monthlyData.datasets[0].data.reduce((a, b) => a + b, 0)
  var second_total = monthlyData.datasets[1].data.reduce((a, b) => a + b, 0)

  var pchange = '%'
    if (second_total == first_total) {
      pchange = 'No Change'
    } else if (second_total == 0) {
      pchange = '+100.0%'
    } else {
      if ( (((first_total - second_total) / second_total ) * 100) > 0) {  
        pchange = '+' + ( ( (first_total - second_total) / second_total ) * 100).toFixed(1) + '%'
        
        document.getElementById('monthlyPercentageIncrease').classList.remove('percentage-bg-positive', 'percentage-bg-nochange')
        document.getElementById('monthlyPercentageIncrease').classList.add('percentage-bg-negative')
      } else {
        pchange = ( ( (first_total - second_total) / second_total ) * 100).toFixed(1) + '%'
        if ( (((first_total - second_total) / second_total ) * 100) == 0) {
          document.getElementById('monthlyPercentageIncrease').classList.remove('percentage-bg-positive', 'percentage-bg-negative')
          document.getElementById('monthlyPercentageIncrease').classList.add('percentage-bg-nochange')
        } else {
          document.getElementById('monthlyPercentageIncrease').classList.remove('percentage-bg-negative', 'percentage-bg-nochange')
          document.getElementById('monthlyPercentageIncrease').classList.add('percentage-bg-positive')
        }
      }
    }
  document.getElementById('monthlyPercentageIncrease').textContent = pchange
}








// init charts
var weeklyChart;
var monthlyChart;
var todayChart;

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    uid = user.uid;
    // alert(uid)

    var db = firebase.firestore();

    var projectDocRef = db.collection("users").doc(uid).collection("projects").doc(pidParam);

    // LOAD CHARTS
    projectDocRef.get().then((doc) => {
      if (doc.exists) {
        var projectArrays = doc.data()

        //
        // TODAY/YESTERDAY CHART INITIALIZATION
        //
        todayData.datasets[0].data = projectArrays.current24hours
        todayData.datasets[1].data = projectArrays.last24hours
        todayChart = new Chart(document.getElementById('todayChart'), todayConfig);
        document.getElementById("today-bugs-label").innerHTML = '<span id = "today-amount">' + Math.max.apply(Math, todayData.datasets[0].data) + '</span> bugs' 
        document.getElementById("yesterday-amount").textContent = Math.max.apply(Math, todayData.datasets[1].data)
        document.getElementById("today-time").textContent = "Today, " + returnHHMM() //replace with actual dates
        document.getElementById("yesterday-time").textContent = "Yesterday" //replace with actual dates
        document.getElementById('dailyPercentageIncrease').style.visibility = "hidden"

        //
        // LAST 7 DAYS CHART INITIALIZATION
        //
        weeklyData.datasets[0].data = configFirebaseArray(projectArrays.last7days)[0]
        weeklyData.datasets[1].data = configFirebaseArray(projectArrays.last7days)[1]
        weeklyChart = new Chart(document.getElementById('weeklyChart'), weeklyConfig);
        document.getElementById("todayamount").textContent = weeklyData.datasets[0].data.reduce((a, b) => a + b, 0)
        document.getElementById("lastamount").textContent = weeklyData.datasets[1].data.reduce((a, b) => a + b, 0)
        var first_total = weeklyData.datasets[0].data.reduce((a, b) => a + b, 0)
        var second_total = weeklyData.datasets[1].data.reduce((a, b) => a + b, 0)

        var pchange = '%'
          if (second_total == first_total) {
            pchange = 'No Change'
          } else if (second_total == 0) {
            pchange = '+100.0%'
          } else {
            if ( (((first_total - second_total) / second_total ) * 100) > 0) {  
              pchange = '+' + ( ( (first_total - second_total) / second_total ) * 100).toFixed(1) + '%'
              document.getElementById('weeklyPercentageIncrease').classList.remove('percentage-bg-positive', 'percentage-bg-nochange')
              document.getElementById('weeklyPercentageIncrease').classList.add('percentage-bg-negative')
            } else {
              pchange = ( ( (first_total - second_total) / second_total ) * 100).toFixed(1) + '%'
              if ( (((first_total - second_total) / second_total ) * 100) == 0) {
                document.getElementById('weeklyPercentageIncrease').classList.remove('percentage-bg-positive', 'percentage-bg-negative')
                document.getElementById('weeklyPercentageIncrease').classList.add('percentage-bg-nochange')
              } else {
                document.getElementById('weeklyPercentageIncrease').classList.remove('percentage-bg-negative', 'percentage-bg-nochange')
                document.getElementById('weeklyPercentageIncrease').classList.add('percentage-bg-positive')
              }
            }
          }
        document.getElementById('weeklyPercentageIncrease').textContent = pchange

        // 
        // LAST 4 WEEKS CHART INITIALIZATION
        //
        monthlyData.datasets[0].data = configFirebaseArray(projectArrays.last4weeks)[0]
        monthlyData.datasets[1].data = configFirebaseArray(projectArrays.last4weeks)[1]
        monthlyChart = new Chart(document.getElementById('monthlyChart'), monthlyConfig);
        document.getElementById("monthly-todayamount").textContent = monthlyData.datasets[0].data.reduce((a, b) => a + b, 0)
        document.getElementById("monthly-lastamount").textContent = monthlyData.datasets[1].data.reduce((a, b) => a + b, 0)
        var first_total = monthlyData.datasets[0].data.reduce((a, b) => a + b, 0)
        var second_total = monthlyData.datasets[1].data.reduce((a, b) => a + b, 0)
        var pchange = '%'
          if (second_total == first_total) {
            pchange = 'No Change'
          } else if (second_total == 0) {
            pchange = '+100.0%'
          } else {
            if ( (((first_total - second_total) / second_total ) * 100) > 0) {  
              pchange = '+' + ( ( (first_total - second_total) / second_total ) * 100).toFixed(1) + '%'
              
              document.getElementById('monthlyPercentageIncrease').classList.remove('percentage-bg-positive', 'percentage-bg-nochange')
              document.getElementById('monthlyPercentageIncrease').classList.add('percentage-bg-negative')
            } else {
              pchange = ( ( (first_total - second_total) / second_total ) * 100).toFixed(1) + '%'
              if ( (((first_total - second_total) / second_total ) * 100) == 0) {
                document.getElementById('monthlyPercentageIncrease').classList.remove('percentage-bg-positive', 'percentage-bg-negative')
                document.getElementById('monthlyPercentageIncrease').classList.add('percentage-bg-nochange')
              } else {
                document.getElementById('monthlyPercentageIncrease').classList.remove('percentage-bg-negative', 'percentage-bg-nochange')
                document.getElementById('monthlyPercentageIncrease').classList.add('percentage-bg-positive')
              }
            }
          }
        document.getElementById('monthlyPercentageIncrease').textContent = pchange


      } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
      }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });


    // UPDATE CHARTS
    listenChartUpdates = projectDocRef
      .onSnapshot((doc) => {
        var data = doc.data()

        todayData.datasets[0].data = data.current24hours
        todayData.datasets[1].data = data.last24hours
        todayChart.update()
        document.getElementById("today-bugs-label").innerHTML = '<span id = "today-amount">' + Math.max.apply(Math, todayData.datasets[0].data) + '</span> bugs' 
        document.getElementById("yesterday-amount").textContent = Math.max.apply(Math, todayData.datasets[1].data)
        document.getElementById("today-time").textContent = "Today, " + returnHHMM() //replace with actual dates
        document.getElementById("yesterday-time").textContent = "Yesterday" //replace with actual dates
        document.getElementById('dailyPercentageIncrease').style.visibility = "hidden"
        // 
        // LAST 7 DAYS CHART AND LABEL UPDATE
        //
        weeklyChart.data.datasets[0].data = configFirebaseArray(data.last7days)[0]
        weeklyChart.data.datasets[1].data = configFirebaseArray(data.last7days)[1]
        weeklyChart.update()
        document.getElementById("todayamount").textContent = weeklyData.datasets[0].data.reduce((a, b) => a + b, 0)
        document.getElementById("lastamount").textContent = weeklyData.datasets[1].data.reduce((a, b) => a + b, 0)
        var first_total = weeklyData.datasets[0].data.reduce((a, b) => a + b, 0)
        var second_total = weeklyData.datasets[1].data.reduce((a, b) => a + b, 0)

        var pchange = '%'
          if (second_total == first_total) {
            pchange = 'No Change'
          } else if (second_total == 0) {
            pchange = '+100.0%'
          } else {
            if ( (((first_total - second_total) / second_total ) * 100) > 0) {  
              pchange = '+' + ( ( (first_total - second_total) / second_total ) * 100).toFixed(1) + '%'
              document.getElementById('weeklyPercentageIncrease').classList.remove('percentage-bg-positive', 'percentage-bg-nochange')
              document.getElementById('weeklyPercentageIncrease').classList.add('percentage-bg-negative')
            } else {
              pchange = ( ( (first_total - second_total) / second_total ) * 100).toFixed(1) + '%'
              if ( (((first_total - second_total) / second_total ) * 100) == 0) {
                document.getElementById('weeklyPercentageIncrease').classList.remove('percentage-bg-positive', 'percentage-bg-negative')
                document.getElementById('weeklyPercentageIncrease').classList.add('percentage-bg-nochange')
              } else {
                document.getElementById('weeklyPercentageIncrease').classList.remove('percentage-bg-negative', 'percentage-bg-nochange')
                document.getElementById('weeklyPercentageIncrease').classList.add('percentage-bg-positive')
              }
            }
          }
        document.getElementById('weeklyPercentageIncrease').textContent = pchange

        // 
        // LAST 4 WEEKS CHART AND LABEL UPDATE
        //
        monthlyChart.data.datasets[0].data = configFirebaseArray(data.last4weeks)[0]
        monthlyChart.data.datasets[1].data = configFirebaseArray(data.last4weeks)[1]
        monthlyChart.update()
        document.getElementById("monthly-todayamount").textContent = monthlyData.datasets[0].data.reduce((a, b) => a + b, 0)
        document.getElementById("monthly-lastamount").textContent = monthlyData.datasets[1].data.reduce((a, b) => a + b, 0)
        var first_total = monthlyData.datasets[0].data.reduce((a, b) => a + b, 0)
        var second_total = monthlyData.datasets[1].data.reduce((a, b) => a + b, 0)
        var pchange = '%'
          if (second_total == first_total) {
            pchange = 'No Change'
          } else if (second_total == 0) {
            pchange = '+100.0%'
          } else {
            if ( (((first_total - second_total) / second_total ) * 100) > 0) {  
              pchange = '+' + ( ( (first_total - second_total) / second_total ) * 100).toFixed(1) + '%'
              
              document.getElementById('monthlyPercentageIncrease').classList.remove('percentage-bg-positive', 'percentage-bg-nochange')
              document.getElementById('monthlyPercentageIncrease').classList.add('percentage-bg-negative')
            } else {
              pchange = ( ( (first_total - second_total) / second_total ) * 100).toFixed(1) + '%'
              if ( (((first_total - second_total) / second_total ) * 100) == 0) {
                document.getElementById('monthlyPercentageIncrease').classList.remove('percentage-bg-positive', 'percentage-bg-negative')
                document.getElementById('monthlyPercentageIncrease').classList.add('percentage-bg-nochange')
              } else {
                document.getElementById('monthlyPercentageIncrease').classList.remove('percentage-bg-negative', 'percentage-bg-nochange')
                document.getElementById('monthlyPercentageIncrease').classList.add('percentage-bg-positive')
              }
            }
          }
        document.getElementById('monthlyPercentageIncrease').textContent = pchange

        


      });
    // ...
  } else {
    // alert('No user logged in.')
    window.location.href = "login.html";
  }
});

var updateLocalTime = setInterval(function() {
    document.getElementById("today-time").textContent = "Today, " + returnHHMM()
}, 60000);















