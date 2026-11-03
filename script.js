let requests = JSON.parse(localStorage.getItem('requests') || '[]');

// Уведомления
function showToast(msg, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(() => toast.className = 'toast', 3000);
}

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
  const newRequest = {
    id: Date.now(),
    client: document.getElementById('client').value,
    phone: document.getElementById('phone').value,
    desc: document.getElementById('desc').value,
    service: document.getElementById('service').value,
    status: 'Новая'
  };
  requests.push(newRequest);
  save();
  render();
  document.getElementById('request-form').reset();
  showToast('Заявка успешно создана!');
}

function changeStatus(id) {
  const order = ['Новая', 'В работе', 'Выполнена'];
  const req = requests.find(r => r.id === id);
  if (req) {
    let idx = order.indexOf(req.status);
    req.status = order[(idx + 1) % order.length];
    save();
    render();
    showToast('Статус изменён: ' + req.status);
  }
}

function deleteRequest(id) {
  if (confirm('Удалить эту заявку?')) {
    requests = requests.filter(r => r.id !== id);
    save();
    render();
    showToast('Заявка удалена');
  }
}

// Редактирование
function openEditModal(id) {
  const req = requests.find(r => r.id === id);
  if (!req) return;
  document.getElementById('edit-id').value = id;
  document.getElementById('edit-client').value = req.client;
  document.getElementById('edit-desc').value = req.desc;
  document.getElementById('edit-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('edit-modal').classList.remove('active');
}

function saveEdit() {
  const id = Number(document.getElementById('edit-id').value);
  const req = requests.find(r => r.id === id);
  if (req) {
    req.client = document.getElementById('edit-client').value;
    req.desc = document.getElementById('edit-desc').value;
    save();
    render();
    closeModal();
    showToast('Изменения сохранены');
  }
}

// Таблица
function render() {
  const search = document.getElementById('search').value.toLowerCase();
  const tbody = document.getElementById('requests');
  tbody.innerHTML = '';

  const filtered = requests.filter(r => 
    r.client.toLowerCase().includes(search) || r.desc.toLowerCase().includes(search)
  );

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#999;">Заявок пока нет</td></tr>';
    return;
  }

  filtered.forEach(r => {
    let badgeClass = r.status === 'Новая' ? 'new' : r.status === 'В работе' ? 'work' : 'done';
    tbody.innerHTML += `
      <tr>
        <td>${r.id.toString().slice(-4)}</td>
        <td><b>${r.client}</b><br><small style="color:#888">${r.phone || '-'}</small></td>
        <td>${r.desc}<br><small style="color:#888">${r.service}</small></td>
        <td><span class="badge ${badgeClass}">${r.status}</span></td>
        <td>
          <button class="action-btn" title="Редактировать" onclick="openEditModal(${r.id})">✏️</button>
          <button class="action-btn" title="Сменить статус" onclick="changeStatus(${r.id})">🔄</button>
          <button class="action-btn" title="Удалить" onclick="deleteRequest(${r.id})">❌</button>
        </td>
      </tr>
    `;
  });
}

// Импорт и Экспорт
function downloadData() {
  if (requests.length === 0) return showToast('Нет данных для скачивания', true);
  const blob = new Blob([JSON.stringify(requests, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'zayavki_backup.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('База сохранена в файл');
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        requests = imported;
        save();
        render();
        showToast('База успешно загружена!');
      } else {
        showToast('Неверный формат файла', true);
      }
    } catch (err) {
      showToast('Ошибка чтения файла', true);
    }
  };
  reader.readAsText(file);
  event.target.value = ''; // сброс инпута
}

// Запуск
updateStats();
render();