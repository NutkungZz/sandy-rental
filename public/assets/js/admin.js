let tenants = [];
let rooms = [];
let payments = [];

document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    fetchTenants();
    fetchRooms();
    fetchPayments();

    document.getElementById('logoutBtn').addEventListener('click', logout);
});

function fetchTenants() {
    fetch('/api/tenants')
        .then(response => response.json())
        .then(data => {
            tenants = data;
            displayTenants();
            populateTenantSelect();
            displayRooms(); // เพิ่มการแสดงข้อมูลห้องเช่า
        })
        .catch(error => console.error('Error:', error));
}

function fetchRooms() {
    fetch('/api/rooms')
        .then(response => response.json())
        .then(data => {
            rooms = data;
            populateRoomSelect();
            displayRooms(); // เรียกฟังก์ชันแสดงข้อมูลห้องเช่า
        })
        .catch(error => console.error('Error:', error));
}

function fetchPayments() {
    fetch('/api/payments')
        .then(response => response.json())
        .then(data => {
            payments = data;
            displayPayments();
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

function displayRooms() {
    const roomList = document.getElementById('roomList');
    roomList.innerHTML = '';

    rooms.forEach(room => {
        const tenant = tenants.find(t => t.room_id === room.id);
        const status = tenant ? 'มีผู้เช่า' : 'ว่าง';
        const statusClass = tenant ? 'status-occupied' : 'status-vacant';

        const roomCard = `
            <div class="col-md-4 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">ห้อง ${room.room_number}</h5>
                        <p class="card-text">
                            <span class="status-badge ${statusClass}">${status}</span>
                        </p>
                        <p class="card-text">ราคา: ${room.price} บาท/เดือน</p>
                        ${tenant ? `
                            <p class="card-text">ผู้เช่า: ${tenant.name}</p>
                            <p class="card-text">เบอร์โทร: ${tenant.phone}</p>
                        ` : ''}
                        <div class="mt-3">
                            <button class="btn btn-sm btn-primary btn-edit" onclick="editRoom(${room.id})">
                                <i class="fas fa-edit"></i> แก้ไข
                            </button>
                            <button class="btn btn-sm btn-danger btn-delete" onclick="deleteRoom(${room.id})">
                                <i class="fas fa-trash"></i> ลบ
                            </button>
			</div>
                    </div>
                </div>
            </div>
        `;
        roomList.innerHTML += roomCard;
    });
}

function displayPayments() {
    const paymentList = document.getElementById('paymentList');
    paymentList.innerHTML = '';

    payments.forEach(payment => {
        const tenant = tenants.find(t => t.id === payment.tenant_id);
        const paymentCard = `
            <div class="card mb-3">
                <div class="card-body">
                    <h5 class="card-title">การชำระเงิน - ${tenant ? tenant.name : 'ไม่ระบุผู้เช่า'}</h5>
                    <p class="card-text">จำนวนเงิน: ${payment.amount} บาท</p>
                    <p class="card-text">วันที่ชำระ: ${formatDate(payment.payment_date)}</p>
                    <p class="card-text">วิธีการชำระ: ${payment.payment_method}</p>
                    <button class="btn btn-primary btn-sm" onclick="editPayment(${payment.id})">แก้ไข</button>
                    <button class="btn btn-danger btn-sm" onclick="deletePayment(${payment.id})">ลบ</button>
                </div>
            </div>
        `;
        paymentList.innerHTML += paymentCard;
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

function populateTenantSelect() {
    const tenantSelect = document.getElementById('paymentTenantId');
    tenantSelect.innerHTML = '';
    tenants.forEach(tenant => {
        const option = document.createElement('option');
        option.value = tenant.id;
        option.textContent = `${tenant.name} (ห้อง ${tenant.rooms.room_number})`;
        tenantSelect.appendChild(option);
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
        fetchTenants(); // This will update both tenants and rooms display
        document.getElementById('tenantForm').reset();
        new bootstrap.Modal(document.getElementById('addTenantModal')).hide();
    })
    .catch(error => console.error('Error:', error));
});

document.getElementById('paymentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const paymentData = {
        id: document.getElementById('paymentId').value,
        tenant_id: document.getElementById('paymentTenantId').value,
        amount: document.getElementById('paymentAmount').value,
        payment_date: document.getElementById('paymentDate').value,
        payment_method: document.getElementById('paymentMethod').value
    };

    const url = paymentData.id ? `/api/payments/${paymentData.id}` : '/api/payments';
    const method = paymentData.id ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
    })
    .then(response => response.json())
    .then(data => {
        fetchPayments();
        document.getElementById('paymentForm').reset();
        new bootstrap.Modal(document.getElementById('addPaymentModal')).hide();
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

function editPayment(id) {
    const payment = payments.find(p => p.id === id);
    if (payment) {
        document.getElementById('paymentId').value = payment.id;
        document.getElementById('paymentTenantId').value = payment.tenant_id;
        document.getElementById('paymentAmount').value = payment.amount;
        document.getElementById('paymentDate').value = payment.payment_date;
        document.getElementById('paymentMethod').value = payment.payment_method;
        new bootstrap.Modal(document.getElementById('addPaymentModal')).show();
    }
}

function deletePayment(id) {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบการชำระเงินนี้?')) {
        fetch(`/api/payments/${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                fetchPayments();
            })
            .catch(error => console.error('Error:', error));
    }
}

function editRoom(id) {
    const room = rooms.find(r => r.id === id);
    if (room) {
        document.getElementById('editRoomId').value = room.id;
        document.getElementById('editRoomNumber').value = room.room_number;
        document.getElementById('editRoomPrice').value = room.price;
        new bootstrap.Modal(document.getElementById('editRoomModal')).show();
    }
}

function deleteRoom(id) {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบห้องเช่านี้?')) {
        fetch(`/api/rooms/${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                fetchRooms();
            })
            .catch(error => console.error('Error:', error));
    }
}

document.getElementById('editRoomForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const roomData = {
        id: document.getElementById('editRoomId').value,
        room_number: document.getElementById('editRoomNumber').value,
        price: document.getElementById('editRoomPrice').value
    };

    fetch(`/api/rooms/${roomData.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
    })
    .then(response => response.json())
    .then(data => {
        fetchRooms();
        new bootstrap.Modal(document.getElementById('editRoomModal')).hide();
    })
    .catch(error => console.error('Error:', error));
});

function formatDate(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}
