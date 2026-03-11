const input = document.querySelector('.add input[type="text"]');
const addBtn = document.getElementById('add-task');
const taskList = document.getElementById('task-list');

document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  animateExistingItems();
});

addBtn.addEventListener('click', addTask);

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask();
});

function addTask() {
  const text = input.value.trim();
  if (!text) {
    shakeInput();
    return;
  }

  const li = createTaskElement(text);
  taskList.prepend(li);

  requestAnimationFrame(() => {
    li.style.opacity = '1';
    li.style.transform = 'translateY(0)';
  });

  saveTask(text);
  input.value = '';
  input.focus();
  updateTaskCounter();
}

function createTaskElement(text, completed = false) {
  const li = document.createElement('li');
  li.style.opacity = '0';
  li.style.transform = 'translateY(-10px)';
  li.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

  if (completed) {
    li.classList.add('completed');
  } 

  const span = document.createElement('span');
  span.textContent = text;
  span.style.cursor = 'pointer';
  span.title = 'Click to toggle complete';

  span.addEventListener('click', () => {
    li.classList.toggle('completed');
    updateTaskStorage();
    updateTaskCounter(); 
  });

  const btn = document.createElement('button');
  btn.textContent = 'X';
  btn.title = 'Delete task'; 

  btn.addEventListener('click', () => {
    li.style.opacity = '0';
    li.style.transform = 'translateX(20px)';
    li.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    setTimeout(() => {
      li.remove();
      updateTaskStorage();
      updateTaskCounter(); 
    }, 250);
  });

  li.appendChild(span);
  li.appendChild(btn);
  return li;
}

function shakeInput() {
  input.classList.add('shake');
  input.addEventListener('animationend', () => {
    input.classList.remove('shake');
  }, { once: true });
}

function saveTask(text) {
  const tasks = getStoredTasks();
  tasks.unshift({ text, completed: false });
  localStorage.setItem('penit-tasks', JSON.stringify(tasks));
}

function loadTasks() {
  const tasks = getStoredTasks();

  if (tasks.length > 0) {
    taskList.innerHTML = '';
  }

  tasks.forEach(({ text, completed }) => {
    const li = createTaskElement(text, completed);
    li.style.opacity = '1';
    li.style.transform = 'translateY(0)';
    taskList.appendChild(li);
  });
  updateTaskCounter(); 
}

function updateTaskStorage() {
  const items = [...taskList.querySelectorAll('li')];
  const tasks = items.map(li => ({
    text: li.querySelector('span').textContent,
    completed: li.classList.contains('completed'),
  }));
  localStorage.setItem('penit-tasks', JSON.stringify(tasks));
}

function getStoredTasks() {
  try {
    return JSON.parse(localStorage.getItem('penit-tasks')) || [];
  } catch {
    return [];
  }
}

function animateExistingItems() {
  const items = taskList.querySelectorAll('li');
  items.forEach((li, i) => {
    li.style.opacity = '0';
    li.style.transform = 'translateY(8px)';
    li.style.transition = `opacity 0.3s ease ${i * 0.07}s, transform 0.3s ease ${i * 0.07}s`;
    requestAnimationFrame(() => {
      li.style.opacity = '1';
      li.style.transform = 'translateY(0)';
    });
  });
}

const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-6px); }
    40%       { transform: translateX(6px); }
    60%       { transform: translateX(-4px); }
    80%       { transform: translateX(4px); }
  }
  .shake { animation: shake 0.35s ease; }

  li.completed span {
    text-decoration: line-through;
    opacity: 0.45;
  }
`;
document.head.appendChild(style);

function updateTaskCounter() {
  const total = taskList.querySelectorAll('li').length;
  const completed = taskList.querySelectorAll('li.completed').length;
  const remaining = total - completed;

  let counter = document.getElementById('task-counter');
  if (!counter) {
    counter = document.createElement('p');
    counter.id = 'task-counter';
    counter.style.cssText = 'text-align:center; font-size:0.85rem; opacity:0.6; margin-top:10px;';
    taskList.insertAdjacentElement('afterend', counter);
  }

  counter.textContent = remaining === 0 && total === 0
    ? 'No tasks yet. Add one!'
    : `${remaining} of ${total} task${total !== 1 ? 's' : ''} remaining`;
}