let requests = JSON.parse(localStorage.getItem('requests') || '[]');

function save() {
  localStorage.setItem('requests', JSON.stringify(requests));
  updateStats();
}

function updateStats() {
  document.getElementById('stat-total').textContent = requests.length;
  document.getElementById('stat-new').textContent = requests.filter(r => r.status === 'Новая').length;
  document.getElementById('stat-work').textContent = requests.filter(r => r.status === 'В работе').length;
  document.getElementById('stat-done').textContent = requests.filter(r => r.status === 'Выполнена').length;
}

function addRequest(e) {
  e.preventDefault();
  const client = document.getElementById('client').value;
  const phone = document.getElementById('phone').value;
  const desc = document.getElementById('desc').value;
  const service = document.getElementById('service').value;

  const newRequest = {
    id: Date.now(),
    client: client,
    phone: phone,
    desc: desc,
    service: service,
    status: 'Новая',
    date: new Date().toLocaleDateString('ru-RU')
  };

  requests.push(newRequest);
  save();
  render();
  document.getElementById('request-form').reset();
}

function changeStatus(id) {
  const order = ['Новая', 'В работе', 'Выполнена'];
  const req = requests.find(r => r.id === id);
  if (req) {
    let currentIndex = order.indexOf(req.status);
    req.status = order[(currentIndex + 1) % order.length];
    save();
    render();
  }
}

function deleteRequest(id) {
  if (confirm('Вы уверены, что хотите удалить заявку?')) {
    requests = requests.filter(r => r.id !== id);
    save();
    render();
  }
}

function render() {
  const search = document.getElementById('search').value.toLowerCase();
  const tbody = document.getElementById('requests');
  tbody.innerHTML = '';

  const filtered = requests.filter(r => 
    r.client.toLowerCase().includes(search) || 
    r.desc.toLowerCase().includes(search)
  );

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#999;">Заявок пока нет</td></tr>';
    return;
  }

  filtered.forEach(r => {
    let badgeClass = 'new';
    if (r.status === 'В работе') badgeClass = 'work';
    if (r.status === 'Выполнена') badgeClass = 'done';

    tbody.innerHTML += `
      <tr>
        <td>${r.id.toString().slice(-4)}</td>
        <td><b>${r.client}</b><br><small style="color:#888">${r.phone}</small></td>
        <td>${r.desc}<br><small style="color:#888">${r.service}</small></td>
        <td><span class="badge ${badgeClass}">${r.status}</span></td>
        <td>
          <button class="action-btn" title="Сменить статус" onclick="changeStatus(${r.id})">🔄</button>
          <button class="action-btn" title="Удалить" onclick="deleteRequest(${r.id})">❌</button>
        </td>
      </tr>
    `;
  });
}

function downloadData() {
  if (requests.length === 0) {
    alert('Список заявок пуст');
    return;
  }
  const blob = new Blob([JSON.stringify(requests, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'zayavki.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Инициализация
updateStats();
render();