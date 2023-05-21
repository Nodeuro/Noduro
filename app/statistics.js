// Get Statistics
var numOfLessons = 45;
var rating = 4.2;
// Displays

// Progress Bar
// Define the data for the chart
const timelineChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [{
        label: "Average Gesture Accuracy",
        data: [85, 87, 88, 90, 92, 93, 95, 94, 96, 97, 98, 99],
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        lineTension: 0.1
    }]
};

// Define the chart options
const timelineChartOptions = {
    animation: {
        duration: 2000, // set animation duration to 2 seconds
        easing: "easeInOutQuart" // set easing function for animation
    },
    scales: {
        y: {
            ticks: {
                beginAtZero: true,
                max: 100,
                fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
            },
            scaleLabel: {
                display: true,
                labelString: 'Accuracy (%)',
                fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
            }
        },
        x: {
            ticks: {
                fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
            },
            scaleLabel: {
                display: true,
                labelString: 'Month',
                fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
            }
        }
    },
};


//Total number of lessons
function animateValue(obj, text, start, end, duration, endingText) {
    text.style =
      "opacity: 0; transform: translateY(-30px); transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;";
    setTimeout(function () {
      //your code to be executed after 1 second
      let startTimestamp = null;
      const isInteger = Number.isInteger(start) && Number.isInteger(end);
      const decimalPlaces = isInteger ? 0 : 1;
      const increment = isInteger ? 1 : 0.1;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = (progress * (end - start) + start).toFixed(decimalPlaces);
        obj.innerHTML = value;
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
      text.innerHTML = endingText;
      text.style =
        "opacity: 1; transform: translateY(0); transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;";
    }, 1000);
  }
  
  
  

function animateOnIntersection(objId, textId, startValue, endValue, duration,endingText) {
    const obj = document.getElementById(objId);
    const text = document.getElementById(textId);

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const targetValue = parseInt(element.dataset.target);
                animateValue(element, text, startValue, endValue, duration,endingText);
                observer.unobserve(element);
            }
        });
    });

    observer.observe(obj);
}

animateOnIntersection("number_of_lessons_animated", "number_of_lessons", 0, numOfLessons, 1000,"lessons completed");
animateOnIntersection("average_rating_animated", "average_rating", 0, rating, 1000,"Average Rating");


const accuracyChart = new Chart(document.getElementById("accuracyChart").getContext("2d"), {
    type: "line",
    data: timelineChartData,
    options: timelineChartOptions
});
