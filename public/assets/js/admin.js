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
    document.getElementById('tenantForm').addEventListener('submit', handleAddTenant);
});

function fetchTenants() {
    fetch('/api/tenants')
        .then(response => response.json())
        .then(data => {
            tenants = data;
            displayTenants();
            populateTenantSelect();
        })
        .catch(error => console.error('Error:', error));
}

function fetchRooms() {
    fetch('/api/rooms')
        .then(response => response.json())
        .then(data => {
            rooms = data;
            populateRoomSelect();
            displayRooms();
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
                        <p class="card-text">ขนาด: ${room.size || 'ไม่ระบุ'} ตร.ม.</p>
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
    roomSelect.innerHTML = '<option value="">เลือกห้อง</option>';
    rooms.forEach(room => {
        if (!tenants.some(tenant => tenant.room_id === room.id)) {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = `ห้อง ${room.room_number}`;
            roomSelect.appendChild(option);
        }
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

function handleAddTenant(e) {
    e.preventDefault();
    const tenantId = document.getElementById('tenantId').value;
    const tenantData = {
        name: document.getElementById('tenantName').value,
        phone: document.getElementById('tenantPhone').value,
        email: document.getElementById('tenantEmail').value,
        room_id: document.getElementById('roomId').value,
        move_in_date: document.getElementById('moveInDate').value,
        move_out_date: document.getElementById('moveOutDate').value || null
    };

    if (tenantId) {
        updateTenant(tenantId, tenantData);
    } else {
        addTenant(tenantData);
    }
}

function addTenant(tenantData) {
    fetch('/api/tenants', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(tenantData),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Tenant added successfully:', data);
        fetchTenants();
        fetchRooms();
        const modal = bootstrap.Modal.getInstance(document.getElementById('addTenantModal'));
        modal.hide();
        showAlert('เพิ่มผู้เช่าสำเร็จ', 'ข้อมูลผู้เช่าใหม่ได้รับการบันทึกเรียบร้อยแล้ว', 'success');
        resetTenantForm();
    })
    .catch(error => {
        console.error('Error adding tenant:', error);
        showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถเพิ่มผู้เช่าได้ กรุณาลองใหม่อีกครั้ง', 'error');
    });
}

function updateTenant(id, tenantData) {
    fetch(`/api/tenants/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(tenantData),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Tenant updated successfully:', data);
        fetchTenants();
        fetchRooms();
        const modal = bootstrap.Modal.getInstance(document.getElementById('addTenantModal'));
        modal.hide();
        showAlert('แก้ไขข้อมูลสำเร็จ', 'ข้อมูลผู้เช่าได้รับการปรับปรุงเรียบร้อยแล้ว', 'success');
        resetTenantForm();
    })
    .catch(error => {
        console.error('Error updating tenant:', error);
        showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถแก้ไขข้อมูลผู้เช่าได้ กรุณาลองใหม่อีกครั้ง', 'error');
    });
}

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
        
        document.querySelector('#addTenantModal .modal-title').textContent = 'แก้ไขข้อมูลผู้เช่า';
        document.querySelector('#addTenantModal button[type="submit"]').textContent = 'บันทึกการแก้ไข';
        
        new bootstrap.Modal(document.getElementById('addTenantModal')).show();
    }
}

function deleteTenant(id) {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบผู้เช่านี้?')) {
        fetch(`/api/tenants/${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                fetchTenants();
                fetchRooms();
                showAlert('ลบข้อมูลสำเร็จ', 'ข้อมูลผู้เช่าได้ถูกลบเรียบร้อยแล้ว', 'success');
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถลบข้อมูลผู้เช่าได้ กรุณาลองใหม่อีกครั้ง', 'error');
            });
    }
}

function resetTenantForm() {
    document.getElementById('tenantId').value = '';
    document.getElementById('tenantForm').reset();
    document.querySelector('#addTenantModal .modal-title').textContent = 'เพิ่มผู้เช่าใหม่';
    document.querySelector('#addTenantModal button[type="submit"]').textContent = 'บันทึก';
}

function editRoom(id) {
    const room = rooms.find(r => r.id === id);
    if (room) {
        document.getElementById('editRoomId').value = room.id;
        document.getElementById('editRoomNumber').value = room.room_number;
        document.getElementById('editRoomPrice').value = room.price;
        document.getElementById('editRoomSize').value = room.size || '';
        document.getElementById('editRoomDescription').value = room.description || '';
        new bootstrap.Modal(document.getElementById('editRoomModal')).show();
    }
}

function deleteRoom(id) {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบห้องเช่านี้?')) {
        fetch(`/api/rooms/${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                fetchRooms();
                showAlert('ลบข้อมูลสำเร็จ', 'ข้อมูลห้องเช่าได้ถูกลบเรียบร้อยแล้ว', 'success');
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถลบข้อมูลห้องเช่าได้ กรุณาลองใหม่อีกครั้ง', 'error');
            });
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
                showAlert('ลบข้อมูลสำเร็จ', 'ข้อมูลการชำระเงินได้ถูกลบเรียบร้อยแล้ว', 'success');
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถลบข้อมูลการชำระเงินได้ กรุณาลองใหม่อีกครั้ง', 'error');
            });
    }
}

function showAlert(title, message, icon) {
    Swal.fire({
        title: title,
        text: message,
        icon: icon,
        confirmButtonText: 'ตกลง'
    });
}

function formatDate(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}
