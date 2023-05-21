async function signIn(email, password) {
  // await firebase.email_sign_in("aadvik.vashist@outlook.com", "password");
  // handle the result
  var val = await firebase.check_user_local();
  if (localStorage.getItem("first_name") != null) {
    document.getElementById("welcome").innerHTML = "Welcome back, " + localStorage.getItem("first_name");
    let last_login = await firebase.get_last_login(86400);
    if (last_login){
    document.getElementById("sign_in").innerHTML =
        "<a class = 'sign_in_link' href= './login/login.html'> Sign In </a> to Noduro";
    }
  } else {
    document.getElementById("welcome").innerHTML = "Welcome to Noduro";
    document.getElementById("sign_in").innerHTML =
        "<a class = 'sign_in_link' href= './sign_up/sign_up.html'> Sign up </a> to Noduro to get started";
  }
}


signIn();
//HEADER ONLY LOADS ONCE
let header = document.getElementById("global_h");


if (Date.now()  - parseInt(sessionStorage.getItem('global_header_anim')) > 4000){
  header.classList.remove("global_header_anim_b4");
}
else if (sessionStorage.getItem('global_header_anim') == null && header.classList.contains("global_header_anim_b4")) {
  window.addEventListener('scroll', function() {
    // Run your code here that should only be executed the first time the user scrolls
  header.classList.add("global_header_anim");
  sessionStorage.setItem('global_header_anim',  Date.now());
  setTimeout(function() {

  header.classList.remove("global_header_anim_b4");

  }, 4000);
  }, { once: true });
  
  
}
else if (sessionStorage.getItem('global_header_anim') != null && header.classList.contains("global_header_anim_b4")) {
  window.addEventListener('scroll', function() {
    // Run your code here that should only be executed the first time the user scrolls
  header.classList.add("global_header_anim");
  }, { once: true });
}

let element = document.querySelector('.animation');

  //MAIN DIV ANIM ONLY ONCE
// console.log((Date.now()  - parseInt(sessionStorage.getItem('index_animation'))));
if (Date.now()  - parseInt(sessionStorage.getItem('index_animation')) < 2000){
  element.classList.remove('animation');
}



window.addEventListener('unload', function() {
  sessionStorage.setItem('index_animation',  Date.now());

});




// Set the data for the chart
const data = {
  labels: ['Easy', 'Intermediate', 'Proficient', 'Mastery'],
  datasets: [{
    label: 'Activity Type',
    data: getRandomData(),
    backgroundColor: ['#ff6861', '#ffb347', '#fdfd96', '#76dd77'],
    borderWidth: 0
  }]
};


// Set the options for the chart
const options = {
  cutoutPercentage: 70,
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    animateRotate: true,
    animateScale: false,
    duration: 2000,
    easing: 'easeInOutCubic'
  },
  legend: {
    display: false
  },
  tooltips: {
    enabled: false
  },
  hover: {
    mode: 'nearest',
    intersect: true
  },
  plugins: {
    beforeDraw: function(chart) {
      drawLabels(chart);
    },
    datalabels: {
      color: 'var(--chart-label-color)',
      font: {
        size: '30',
        // family: 'Arial',
        // style: 'normal',
        // weight: 'normal'
      },
      formatter: function(value, context) {
        return '';
      }
    },
    title: {
      text: 'Activity Type',
      display: true,
      font: {
        size: '24',
        fontFamily: 'Poppins',
        // family: 'Montserrat',
        // style: 'normal',
        // weight: 'bold'
      },
      color: 'var(--chart-title-color)'
    }
  }
};

// Draw the labels next to the doughnut portions
function drawLabels(chart) {
  const ctx = chart.ctx;
  const width = chart.width;
  const height = chart.height;
  const data = chart.data.datasets[0].data;
}
const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
  type: 'doughnut',
  data: data,
  options: options
});


function getRandomData() {
  const data = [];
  const labels = ['Easy', 'Intermediate', 'Proficient', 'Mastery'];
  let remainingValue = 100;

  for (let i = 0; i < labels.length; i++) {
    if (i === labels.length - 1) {
      data.push(remainingValue);
    } else {
      const randomValue = Math.floor(Math.random() * (remainingValue - (labels.length - i - 1))) + 1;
      data.push(randomValue);
      remainingValue -= randomValue;
    }
  }

  return data;
}


