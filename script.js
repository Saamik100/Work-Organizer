// Initial state
let userData = {
    email: '',
    coins: 0,
    dailyTasks: {}, // { taskName: dailyTimeSpent (in seconds) }
    allTimeTasks: {}, // { taskName: allTimeSpent (in seconds) }
    activeTask: null,
    lastReset: null, // Date of the last daily reset
    dailyTimeSpent: 0, // total time spent on tasks for the current day
    allTimeSpent: 0, // total time spent on tasks for all time
    NTLevel: 0,
    CPLevel: 0,
    GeoLevel: 0,
    AlgLevel: 0,
    Overall: 0,
    PrepProbLevel: 0,
    PlayTimeMinutes: 0
  };
  
  let taskTime = 0; // in seconds
  let timer;
  let isTimerRunning = false;
  var NTLevel=0;
  // Load stored data when the page loads
  window.onload = function() {
    const storedData = JSON.parse(localStorage.getItem('userData'));
    if (storedData) {
      userData = storedData;
  
      // Ensure that tasks and time are initialized correctly
      if (!userData.dailyTasks) userData.dailyTasks = {};
      if (!userData.allTimeTasks) userData.allTimeTasks = {};
      if (isNaN(userData.allTimeSpent)) userData.allTimeSpent = 0;
      if (isNaN(userData.dailyTimeSpent)) userData.dailyTimeSpent = 0;
  
      document.getElementById('loginSection').style.display = 'none';
      document.getElementById('taskSection').style.display = 'block';
      checkDailyReset();
      updateStats();
    }
  };
  
  // Event listeners
  document.getElementById('loginBtn').addEventListener('click', login);
  document.getElementById('addTaskBtn').addEventListener('click', addTask);
  document.getElementById('startTimerBtn').addEventListener('click', startTimer);
  document.getElementById('stopTimerBtn').addEventListener('click', stopTimer);
  document.getElementById('profileBtn').addEventListener('click', showProfile);
  
  function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    // Basic email and password check
    if (email === 'bob12$$@gmail.com' && password === 'bob12$$') {
      const storedData = JSON.parse(localStorage.getItem('userData'));
  
      if (storedData && storedData.email === email) {
        userData = storedData;
  
        if (!userData.dailyTasks) userData.dailyTasks = {};
        if (!userData.allTimeTasks) userData.allTimeTasks = {};
        if (isNaN(userData.allTimeSpent)) userData.allTimeSpent = 0;
        if (isNaN(userData.dailyTimeSpent)) userData.dailyTimeSpent = 0;
      } else {
        userData.email = email;
      }
  
      document.getElementById('loginSection').style.display = 'none';
      document.getElementById('taskSection').style.display = 'block';
      checkDailyReset();
      updateStats();
    } else {
      alert('Invalid email or password!');
    }
  }
  
  function addTask() {
    const taskInput = document.getElementById('taskInput').value;
    if (taskInput) {
      if (!userData.dailyTasks[taskInput]) {
        userData.dailyTasks[taskInput] = 0; // Initialize daily time
      }
      if (!userData.allTimeTasks[taskInput]) {
        userData.allTimeTasks[taskInput] = 0; // Initialize all-time time
      }
  
      const taskList = document.getElementById('taskList');
      const taskItem = document.createElement('li');
      taskItem.innerHTML = `${taskInput} - <span>${formatTime(userData.dailyTasks[taskInput])}</span> today`;
  
      // Create edit button for the task
      const editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.style.marginLeft='50px';
      editButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent task click event
        editTaskTime(taskInput, taskItem);
      });
  
      taskItem.appendChild(editButton);
  
      // Assign click listener to start the task
      taskItem.addEventListener('click', () => {
        if (!isTimerRunning) {
          selectTask(taskInput, taskItem);
        } else {
          alert('You can only work on one task at a time. Stop the current task first.');
        }
      });
  
      taskList.appendChild(taskItem);
      document.getElementById('taskInput').value = '';
    } else {
      alert('Please enter a task.');
    }
  }
  
  function editTaskTime(taskName, taskItem) {
    const newTime = prompt(`Enter the new time in seconds for task: ${taskName}`, userData.dailyTasks[taskName]);
    if (!isNaN(newTime) && newTime >= 0) {
      const newTimeSec = parseInt(newTime);
      const timeDifference = newTimeSec - userData.dailyTasks[taskName];
      
      userData.dailyTasks[taskName] = newTimeSec;
      userData.allTimeTasks[taskName] += timeDifference;
      
      updateStats();
      updateTaskList(taskItem, taskName);
    } else {
      alert('Please enter a valid number.');
    }
  }
  
  function selectTask(taskName, taskItem) {
    userData.activeTask = taskName;
    taskTime = 0;
    document.getElementById('taskTime').textContent = formatTime(taskTime);
    document.getElementById('currentTask').textContent = `Current Task: ${taskName}`;
    localStorage.setItem('userData', JSON.stringify(userData));
  
    updateTaskList(taskItem, taskName);
  }
  
  function updateTaskList(taskItem, taskName) {
    taskItem.innerHTML = `${taskName} - <span>${formatTime(userData.dailyTasks[taskName])}</span> today`;
  
    // Add back the edit button
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent task click event
      editTaskTime(taskName, taskItem);
    });
  
    taskItem.appendChild(editButton);
  }
  
  function startTimer() {
    if (!isTimerRunning && userData.activeTask) {
      isTimerRunning = true;
      document.getElementById('startTimerBtn').disabled = true;
      document.getElementById('stopTimerBtn').disabled = false;
      timer = setInterval(() => {
        taskTime++;
        userData.dailyTasks[userData.activeTask]++;
        userData.allTimeTasks[userData.activeTask]++;
        updateTotalTimeSpent();
        document.getElementById('taskTime').textContent = formatTime(taskTime);
        document.getElementById('timeSpent').textContent = formatTime(userData.dailyTimeSpent);
  
        const taskListItems = document.querySelectorAll('#taskList li');
        taskListItems.forEach((item) => {
          if (item.textContent.startsWith(userData.activeTask)) {
            updateTaskList(item, userData.activeTask);
          }
        });
      }, 1000); // 1 second intervals
    } else if (!userData.activeTask) {
      alert('Please select a task first.');
    }
  }
  
  function stopTimer() {
    clearInterval(timer);
    isTimerRunning = false;
    document.getElementById('startTimerBtn').disabled = false;
    document.getElementById('stopTimerBtn').disabled = true;
    userData.activeTask = null; // Reset active task
    document.getElementById('currentTask').textContent = 'No active task';
    updateStats();
  
    // Save updated data
    localStorage.setItem('userData', JSON.stringify(userData));
  }
  
  function updateStats() {
    document.getElementById('coins').textContent = userData.coins;
    document.getElementById('timeSpent').textContent = formatTime(userData.dailyTimeSpent);
    updateTotalTimeSpent();
  
    // Save updated data
    localStorage.setItem('userData', JSON.stringify(userData));
  }
  
  function updateTotalTimeSpent() {
    userData.dailyTimeSpent = Object.values(userData.dailyTasks).reduce((acc, cur) => acc + cur, 0);
  }
  
  function checkDailyReset() {
    const currentDate = new Date();
    const lastResetDate = new Date(userData.lastReset);
  
    if (!userData.lastReset || (currentDate - lastResetDate) > 24 * 60 * 60 * 1000) {
      userData.dailyTasks = {};
      userData.dailyTimeSpent = 0;
      userData.lastReset = currentDate.toISOString();
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  }
  var kkk = 0;
  function showProfile() {
    document.getElementById("taskstatts").innerHTML="";
for (const task in userData.allTimeTasks) {
    document.getElementById("taskstatts").innerHTML =document.getElementById("taskstatts").innerHTML + `${task}: ${formatTime(userData.allTimeTasks[task])}\n\n`;
    document.getElementById("taskstatts").innerHTML = document.getElementById("taskstatts").innerHTML + "<br>"
  kkk += Number(userData.allTimeTasks[task]);
}
document.getElementById("taskstatts").innerHTML =  `All-time total time spent: ${formatTime(kkk)}\n`+ "<br>" + "<b>Tasks:</b>" + "<br>" +document.getElementById("taskstatts").innerHTML;
document.getElementById("taskstatts").innerHTML = document.getElementById("taskstatts").innerHTML + "<br>" + "<b> Levels: </b>" + "<br>"+ "NT Level: " + Number(userData.NTLevel)+ "<br>" + "CP Level: " + userData.CPLevel+ "<br>" + "Alg Level: " + userData.AlgLevel+ "<br>" + "Geo Level: " + userData.GeoLevel+ "<br>" + "Prep Prob Level: " + userData.PrepProbLevel + "<br>" + "<br>" + "<b>Overall math level:  </b>" + userData.Overall;
document.getElementById("taskstatts").innerHTML = document.getElementById("taskstatts").innerHTML + "<br>" + "<b> Play Time Minutes Avaliable: </b>" + userData.PlayTimeMinutes;
document.getElementById('ggg').style.display="none";
document.getElementById('hhh').style.display="block";
document.getElementById('shop').style.display="none";
  }
  
  // Helper function to format time (seconds -> hours, minutes, seconds)
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0h 0m 0s';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
  
    return `${hours}h ${minutes}m ${secs}s`;
  }
  
  function M(){
    document.getElementById("kk").style.display="block";
  }
  var m = 0;
  function N(){
    document.getElementById("kk").style.display="none";
    m = document.getElementById("k1").value;
    userData.NTLevel=document.getElementById("k2").value
    userData.CPLevel=document.getElementById("k3").value
    userData.AlgLevel=document.getElementById("k4").value
    userData.GeoLevel=document.getElementById("k5").value
    userData.PrepProbLevel=document.getElementById("k6").value
    userData.coins=userData.coins + Number(document.getElementById("k8").value)
    userData.coins=userData.coins - 300;
    userData.PlayTimeMinutes = userData.PlayTimeMinutes - document.getElementById("k7").value
    userData.Overall = Number(document.getElementById("k2").value) + Number(document.getElementById("k3").value) + Number(document.getElementById("k4").value) + Number(document.getElementById("k5").value) + Number(document.getElementById("k6").value)
    userData.Overall /=5;
    userData.coins+=50;
    userData.coins-=m;
    document.getElementById("coins").innerHTML=userData.coins;
    localStorage.setItem('userData', JSON.stringify(userData));

  }
  function Back(){
    document.getElementById('ggg').style.display="block";
document.getElementById('hhh').style.display="none";
document.getElementById('Shop').style.display="none";
  }

function Shop(){
    document.getElementById('hhh').style.display="none";
    document.getElementById('ggg').style.display="none";
    document.getElementById('Shop').style.display="block";
    document.getElementById("shopcoins").innerHTML=userData.coins+"🪙"
}

function Among(){
    if(userData.coins>=Number(document.getElementById("coinsspend").value)){
        document.getElementById("playtime").innerHTML=Number(document.getElementById("coinsspend").value)*1/5
    } else {
        document.getElementById("playtime").innerHTML="You don't have enough coins"
    }
}
function Buy(){
    userData.coins=userData.coins-Number(document.getElementById("coinsspend").value)
    userData.PlayTimeMinutes = userData.PlayTimeMinutes + Number(document.getElementById("coinsspend").value)*1/5
    localStorage.setItem('userData', JSON.stringify(userData));
    Back()
}

function light(){
    document.getElementById("bodd").classList.add("light");
    document.getElementById("light").style.display="none";
    document.getElementById("dark").style.display="block";
}
function dark(){
    document.getElementById("bodd").classList.remove("light");
    document.getElementById("light").style.display="block";
    document.getElementById("dark").style.display="none";
}