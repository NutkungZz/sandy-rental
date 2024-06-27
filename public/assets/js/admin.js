let tenants = [];
let rooms = [];

document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    fetchTenants();
    fetchRooms();
});

function fetchTenants() {
    fetch('/api/tenants')
        .then(response => response.json())
        .then(data => {
            tenants = data;
            displayTenants();
        })
        .catch(error => console.error('Error:', error));
}

function fetchRooms() {
    fetch('/api/rooms')
        .then(response => response.json())
        .then(data => {
            rooms = data;
            populateRoomSelect();
        })
        .catch(error => console.error('Error:', error));
}

function displayTenants() {
    const tenantList = document.getElementById('tenantList');
    tenantList.innerHTML = '';

    tenants.forEach(tenant => {
        const tenantCard = `
            <div class="card mb-3">
                <div class="card-body">
                    <h5 class="card-title">${tenant.name}</h5>
                    <p class="card-text">ห้อง: ${tenant.rooms.room_number}</p>
                    <p class="card-text">โทรศัพท์: ${tenant.phone}</p>
                    <p class="card-text">อีเมล: ${tenant.email}</p>
                    <p class="card-text">วันที่เข้าอยู่: ${formatDate(tenant.move_in_date)}</p>
                    <p class="card-text">วันที่ย้ายออก: ${formatDate(tenant.move_out_date) || 'ยังไม่กำหนด'}</p>
                    <button class="btn btn-primary btn-sm" onclick="editTenant(${tenant.id})">แก้ไข</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteTenant(${tenant.id})">ลบ</button>
                </div>
            </div>
        `;
        tenantList.innerHTML += tenantCard;
    });
}

function populateRoomSelect() {
    const roomSelect = document.getElementById('roomId');
    roomSelect.innerHTML = '';
    rooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room.id;
        option.textContent = room.room_number;
        roomSelect.appendChild(option);
    });
}

document.getElementById('tenantForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const tenantData = {
        id: document.getElementById('tenantId').value,
        room_id: document.getElementById('roomId').value,
        name: document.getElementById('tenantName').value,
        phone: document.getElementById('tenantPhone').value,
        email: document.getElementById('tenantEmail').value,
        move_in_date: document.getElementById('moveInDate').value,
        move_out_date: document.getElementById('moveOutDate').value || null
    };

    const url = tenantData.id ? `/api/tenants/${tenantData.id}` : '/api/tenants';
    const method = tenantData.id ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(tenantData),
    })
    .then(response => response.json())
    .then(data => {
        fetchTenants();
        document.getElementById('tenantForm').reset();
        new bootstrap.Modal(document.getElementById('addTenantModal')).hide();
    })
    .catch(error => console.error('Error:', error));
});

function editTenant(id) {
    const tenant = tenants.find(t => t.id === id);
    if (tenant) {
        document.getElementById('tenantId').value = tenant.id;
        document.getElementById('roomId').value = tenant.room_id;
        document.getElementById('tenantName').value = tenant.name;
        document.getElementById('tenantPhone').value = tenant.phone;
        document.getElementById('tenantEmail').value = tenant.email;
        document.getElementById('moveInDate').value = tenant.move_in_date;
        document.getElementById('moveOutDate').value = tenant.move_out_date || '';
        new bootstrap.Modal(document.getElementById('addTenantModal')).show();
    }
}

function deleteTenant(id) {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบผู้เช่านี้?')) {
        fetch(`/api/tenants/${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                fetchTenants();
            })
            .catch(error => console.error('Error:', error));
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}
