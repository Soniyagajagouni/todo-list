let taskList = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  document.getElementById('addBtn').addEventListener('click', addTask);
  document.getElementById('taskInput').addEventListener('keyup', e => {
    if (e.key === 'Enter') addTask();
  });
  document.getElementById('clearBtn').addEventListener('click', clearAll);
  document.querySelectorAll('.filters button').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTasks();
    });
  });
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('searchInput').addEventListener('input', e => {
    renderTasks(e.target.value.toLowerCase());
  });
});

function addTask() {
  const text = document.getElementById('taskInput').value.trim();
  const dueDate = document.getElementById('dueDate').value;
  const dueTime = document.getElementById('dueTime').value;
  const priority = document.getElementById('priority').value;

  if (text === '') return;

  taskList.push({ text, completed: false, dueDate, dueTime, priority });

  // Clear inputs
  document.getElementById('taskInput').value = '';
  document.getElementById('dueDate').value = '';
  document.getElementById('dueTime').value = '';
  document.getElementById('priority').value = 'medium';

  saveTasks();
  renderTasks();
}

function renderTasks(searchText = '') {
  const ul = document.getElementById('taskList');
  ul.innerHTML = '';

  let filtered = taskList;
  if (currentFilter === 'active') filtered = filtered.filter(t => !t.completed);
  if (currentFilter === 'completed') filtered = filtered.filter(t => t.completed);
  if (searchText) filtered = filtered.filter(t => t.text.toLowerCase().includes(searchText));

  filtered.forEach((task, index) => {
    const li = document.createElement('li');
    if (task.completed) li.classList.add('completed');

    const textDiv = document.createElement('div');
    textDiv.textContent = task.text;

    const metaDiv = document.createElement('small');
    let datePart = task.dueDate || '';
    let timePart = task.dueTime ? ` at ${formatTime(task.dueTime)}` : '';
    metaDiv.textContent = `${datePart}${timePart} | Priority: ${task.priority}`;
    metaDiv.style.color = getPriorityColor(task.priority);

    const del = document.createElement('span');
    del.textContent = '✖';
    del.className = 'deleteBtn';
    del.addEventListener('click', e => {
      e.stopPropagation();
      deleteTask(index);
    });

    li.appendChild(textDiv);
    li.appendChild(metaDiv);
    li.appendChild(del);

    li.addEventListener('click', () => toggleTask(index));
    li.addEventListener('dblclick', e => {
      e.stopPropagation();
      const newText = prompt('Edit task:', task.text);
      if (newText !== null && newText.trim() !== '') {
        taskList[index].text = newText.trim();
        saveTasks();
        renderTasks();
      }
    });

    ul.appendChild(li);
  });

  document.getElementById('count').textContent = taskList.filter(t => !t.completed).length;

  const total = taskList.length;
  const done = taskList.filter(t => t.completed).length;
  const percent = total ? (done / total) * 100 : 0;
  document.getElementById('progress').style.width = percent + '%';
}

function toggleTask(index) {
  taskList[index].completed = !taskList[index].completed;
  saveTasks();
  renderTasks();
}

function deleteTask(index) {
  taskList.splice(index, 1);
  saveTasks();
  renderTasks();
}

function clearAll() {
  if (confirm('Clear all tasks?')) {
    taskList = [];
    saveTasks();
    renderTasks();
  }
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(taskList));
}

function loadTasks() {
  const stored = localStorage.getItem('tasks');
  if (stored) taskList = JSON.parse(stored);
  renderTasks();
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  document.getElementById('themeToggle').textContent = 
    document.body.classList.contains('dark') ? '☀️' : '🌙';
}

function getPriorityColor(priority) {
  return priority === 'high' ? 'red' : priority === 'medium' ? 'orange' : 'green';
}

// Convert "18:00" → "06:00 PM"
function formatTime(time24) {
  const [hour, minute] = time24.split(':').map(Number);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  let hour12 = hour % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
}
