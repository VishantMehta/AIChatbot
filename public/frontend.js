const chatbox = document.getElementById('chatbox');
const chatForm = document.getElementById('chatForm');
const inputField = document.getElementById('input');
const sessionId = Math.random().toString(36).substr(2, 9);

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = inputField.value.trim();
  if (input === "") return;
  
  displayMessage(input, 'user');
  inputField.value = '';

  try {
    const response = await fetch('/api/ask', { //api 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input, sessionId }),
    });

    const data = await response.json();

    if (data.error) {
      displayMessage(`Error: ${data.error}`, 'ai');
    } else {
      displayAIResponseWordByWord(data.response);
    }
  } catch (error) {
    displayMessage('Error connecting to the server.', 'ai');
  }
});

const displayMessage = (message, type) => {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('p-3', 'rounded-lg', 'shadow-sm', 'message', 'flex', 'items-center', 'space-x-2', 'whitespace-pre-wrap', 'animate-fade-in');
  
  if (type === 'user') {
    msgDiv.classList.add('bg-green-200', 'self-start');
    msgDiv.innerHTML = `<i class="fas fa-user-circle text-xl"></i><span>${message}</span>`;
  } else {
    msgDiv.classList.add('bg-indigo-200', 'self-end');
    msgDiv.innerHTML = `<i class="fas fa-robot text-xl"></i><span>${message}</span>`;
  }

  chatbox.appendChild(msgDiv);
  chatbox.scrollTop = chatbox.scrollHeight;
};

const displayAIResponseWordByWord = (message) => {
  const words = message.split(' ');
  let index = 0;
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('p-3', 'rounded-lg', 'shadow-sm', 'bg-indigo-200', 'self-end', 'flex', 'items-center', 'space-x-2', 'whitespace-pre-wrap', 'animate-fade-in');
  msgDiv.innerHTML = `<i class="fas fa-robot text-xl"></i><span></span>`;
  chatbox.appendChild(msgDiv);

  const span = msgDiv.querySelector('span');

  const typeWord = () => {
    if (index < words.length) {
      span.textContent += words[index] + ' ';
      index++;
      setTimeout(typeWord, 50);
    } else {
      chatbox.scrollTop = chatbox.scrollHeight;
    }
  };
  typeWord();
};
