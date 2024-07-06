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
    document.getElementById('addTenantForm').addEventListener('submit', handleAddTenant);
    document.getElementById('editTenantForm').addEventListener('submit', handleEditTenant);
    document.getElementById('addRoomForm').addEventListener('submit', handleAddRoom);
    document.getElementById('editRoomForm').addEventListener('submit', handleEditRoom);
    document.getElementById('paymentForm').addEventListener('submit', handleAddPayment);
    document.getElementById('dashboard-tab').addEventListener('click', initDashboard);
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

    // เพิ่มการ์ดสำหรับเพิ่มห้องใหม่
    const addRoomCard = `
        <div class="col-md-4 mb-3">
            <div class="card add-room-card h-100" data-bs-toggle="modal" data-bs-target="#addRoomModal">
                <div class="card-body d-flex flex-column justify-content-center align-items-center">
                    <i class="fas fa-plus fa-3x mb-3"></i>
                    <h5 class="card-title text-center">เพิ่มห้องเช่าใหม่</h5>
                </div>
            </div>
        </div>
    `;
    roomList.innerHTML = addRoomCard;

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
    const paymentTable = document.getElementById('paymentsTable').getElementsByTagName('tbody')[0];
    paymentTable.innerHTML = '';

    tenants.forEach(tenant => {
        const row = paymentTable.insertRow();
        const latestPayment = payments.find(p => p.tenant_id === tenant.id);
        const status = latestPayment ? 'ชำระแล้ว' : 'รอการชำระ';
        const statusClass = latestPayment ? 'bg-success' : 'bg-warning';

        row.innerHTML = `
            <td>${tenant.rooms.room_number}</td>
            <td>${tenant.name}</td>
            <td><span class="badge ${statusClass}">${status}</span></td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="showPaymentModal(${tenant.id})">บันทึกการชำระเงิน</button>
                <button class="btn btn-info btn-sm" onclick="showPaymentHistory(${tenant.id})">ประวัติการชำระเงิน</button>
            </td>
        `;
    });
}

function populateRoomSelect() {
    const roomSelect = document.getElementById('addRoomId');
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
    const tenantData = {
        name: document.getElementById('addTenantName').value,
        phone: document.getElementById('addTenantPhone').value,
        email: document.getElementById('addTenantEmail').value,
        room_id: document.getElementById('addRoomId').value,
        move_in_date: document.getElementById('addMoveInDate').value,
    };

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
        document.getElementById('addTenantForm').reset();
    })
    .catch(error => {
        console.error('Error adding tenant:', error);
        showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถเพิ่มผู้เช่าได้ กรุณาลองใหม่อีกครั้ง', 'error');
    });
}

function handleEditTenant(e) {
    e.preventDefault();
    const tenantId = document.getElementById('editTenantId').value;
    const tenantData = {
        name: document.getElementById('editTenantName').value,
        phone: document.getElementById('editTenantPhone').value,
        email: document.getElementById('editTenantEmail').value,
        move_in_date: document.getElementById('editMoveInDate').value,
        move_out_date: document.getElementById('editMoveOutDate').value || null,
    };

    fetch(`/api/tenants/${tenantId}`, {
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
        const modal = bootstrap.Modal.getInstance(document.getElementById('editTenantModal'));
        modal.hide();
        showAlert('แก้ไขข้อมูลสำเร็จ', 'ข้อมูลผู้เช่าได้รับการปรับปรุงเรียบร้อยแล้ว', 'success');
    })
    .catch(error => {
        console.error('Error updating tenant:', error);
        showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถแก้ไขข้อมูลผู้เช่าได้ กรุณาลองใหม่อีกครั้ง', 'error');
    });
}

function editTenant(id) {
    const tenant = tenants.find(t => t.id === id);
    if (tenant) {
        document.getElementById('editTenantId').value = tenant.id;
        document.getElementById('editTenantName').value = tenant.name;
        document.getElementById('editTenantPhone').value = tenant.phone;
        document.getElementById('editTenantEmail').value = tenant.email;
        document.getElementById('editMoveInDate').value = tenant.move_in_date;
        document.getElementById('editMoveOutDate').value = tenant.move_out_date || '';
        
        new bootstrap.Modal(document.getElementById('editTenantModal')).show();
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

function handleAddRoom(e) {
    e.preventDefault();
    const roomData = {
        room_number: document.getElementById('addRoomNumber').value,
        price: parseFloat(document.getElementById('addRoomPrice').value),
        size: parseFloat(document.getElementById('addRoomSize').value),
        amenities: document.getElementById('addRoomAmenities').value.split(',').map(item => item.trim()),
        description: document.getElementById('addRoomDescription').value,
        images: document.getElementById('addRoomImages').value.split(',').map(item => item.trim()),
    };

    fetch('/api/rooms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Room added successfully:', data);
        fetchRooms();
        const modal = bootstrap.Modal.getInstance(document.getElementById('addRoomModal'));
        modal.hide();
        showAlert('เพิ่มห้องเช่าสำเร็จ', 'ข้อมูลห้องเช่าใหม่ได้รับการบันทึกเรียบร้อยแล้ว', 'success');
        document.getElementById('addRoomForm').reset();
    })
    .catch(error => {
        console.error('Error adding room:', error);
        showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถเพิ่มห้องเช่าได้ กรุณาลองใหม่อีกครั้ง', 'error');
    });
}

function handleEditRoom(e) {
    e.preventDefault();
    const roomId = document.getElementById('editRoomId').value;
    const roomData = {
        room_number: document.getElementById('editRoomNumber').value,
        price: parseFloat(document.getElementById('editRoomPrice').value),
        size: parseFloat(document.getElementById('editRoomSize').value),
        amenities: document.getElementById('editRoomAmenities').value.split(',').map(item => item.trim()),
        description: document.getElementById('editRoomDescription').value,
    };

    fetch(`/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Room updated successfully:', data);
        fetchRooms();
        const modal = bootstrap.Modal.getInstance(document.getElementById('editRoomModal'));
        modal.hide();
        showAlert('แก้ไขข้อมูลสำเร็จ', 'ข้อมูลห้องเช่าได้รับการปรับปรุงเรียบร้อยแล้ว', 'success');
    })
    .catch(error => {
        console.error('Error updating room:', error);
        showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถแก้ไขข้อมูลห้องเช่าได้ กรุณาลองใหม่อีกครั้ง', 'error');
    });
}

function editRoom(id) {
    const room = rooms.find(r => r.id === id);
    if (room) {
        document.getElementById('editRoomId').value = room.id;
        document.getElementById('editRoomNumber').value = room.room_number;
        document.getElementById('editRoomPrice').value = room.price;
        document.getElementById('editRoomSize').value = room.size || '';
        document.getElementById('editRoomAmenities').value = room.amenities ? room.amenities.join(', ') : '';
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

function handleAddPayment(e) {
    e.preventDefault();
    const paymentData = {
        tenant_id: parseInt(document.getElementById('paymentTenantId').value),
        amount: parseFloat(document.getElementById('paymentAmount').value),
        payment_date: document.getElementById('paymentDate').value,
        payment_method: document.getElementById('paymentMethod').value
    };

    console.log('Sending payment data:', paymentData);

    fetch('/api/payments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Payment added successfully:', data);
        fetchPayments();
        const modal = bootstrap.Modal.getInstance(document.getElementById('addPaymentModal'));
        modal.hide();
        showAlert('บันทึกการชำระเงินสำเร็จ', 'ข้อมูลการชำระเงินได้รับการบันทึกเรียบร้อยแล้ว', 'success');
        document.getElementById('paymentForm').reset();
    })
    .catch(error => {
        console.error('Error adding payment:', error);
        showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกการชำระเงินได้ กรุณาลองใหม่อีกครั้ง', 'error');
    });
}

function showPaymentModal(tenantId) {
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
        document.getElementById('paymentTenantId').value = tenant.id;
        new bootstrap.Modal(document.getElementById('addPaymentModal')).show();
    }
}

function showPaymentHistory(tenantId) {
    const tenant = tenants.find(t => t.id === tenantId);
    const tenantPayments = payments.filter(p => p.tenant_id === tenantId);
    
    if (tenant && tenantPayments.length > 0) {
        let historyHtml = `
            <h5>ประวัติการชำระเงินของ ${tenant.name}</h5>
            <table class="table">
                <thead>
                    <tr>
                        <th>เดือน</th>
                        <th>จำนวนเงิน</th>
                        <th>วันที่ชำระ</th>
                        <th>วิธีการชำระเงิน</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        tenantPayments.forEach(payment => {
            historyHtml += `
                <tr>
                    <td>${payment.payment_month}</td>
                    <td>${payment.amount} บาท</td>
                    <td>${formatDate(payment.payment_date)}</td>
                    <td>${payment.payment_method}</td>
                </tr>
            `;
        });
        
        historyHtml += `
                </tbody>
            </table>
        `;
        
        Swal.fire({
            title: 'ประวัติการชำระเงิน',
            html: historyHtml,
            width: '800px'
        });
    } else {
        Swal.fire({
            title: 'ไม่พบประวัติการชำระเงิน',
            text: 'ยังไม่มีประวัติการชำระเงินสำหรับผู้เช่านี้',
            icon: 'info'
        });
    }
}

function initDashboard() {
    fetchDashboardData();
}

function fetchDashboardData() {
    fetch('/api/dashboard')
        .then(response => response.json())
        .then(data => {
            updateMonthlyPaymentChart(data.monthlyPayments);
            updatePaymentStatusChart(data.paymentStatus);
            updateRecentPaymentsTable(data.recentPayments);
        })
        .catch(error => {
            console.error('Error fetching dashboard data:', error);
            showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูล Dashboard ได้', 'error');
        });
}

function updateMonthlyPaymentChart(monthlyData) {
    const ctx = document.getElementById('monthlyPaymentChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
            datasets: [{
                label: 'จำนวนเงินที่ได้รับ (บาท)',
                data: monthlyData,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updatePaymentStatusChart(statusData) {
    const ctx = document.getElementById('paymentStatusChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['ชำระแล้ว', 'ยังไม่ชำระ'],
            datasets: [{
                data: statusData,
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 99, 132, 0.6)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        }
    });
}

function updateRecentPaymentsTable(recentPayments) {
    const table = document.getElementById('recentPaymentsTable').getElementsByTagName('tbody')[0];
    table.innerHTML = '';
    
    recentPayments.forEach(payment => {
        const row = table.insertRow();
        row.innerHTML = `
            <td>${payment.rooms.room_number}</td>
            <td>${payment.tenants.name}</td>
            <td>${payment.amount} บาท</td>
            <td>${formatDate(payment.payment_date)}</td>
            <td><span class="badge bg-success">ชำระแล้ว</span></td>
        `;
    });
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
