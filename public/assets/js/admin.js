let tenants = [];
let rooms = [];
let payments = [];
let currentMonthYear = '';

document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    initializeMonthYearFilter();
    populatePaymentMonthSelect(); 
        
    const addTenantModal = document.getElementById('addTenantModal');
    addTenantModal.addEventListener('show.bs.modal', function (event) {
        console.log('Add tenant modal is opening');
        console.log('Rooms before populating:', rooms);
        console.log('Tenants before populating:', tenants);
        populateRoomSelect();
    });
    
    Promise.all([fetchTenants(), fetchRooms()])
    .then(() => {
        console.log('All data fetched, calling populateRoomSelect');
        populateRoomSelect();
        return fetchPayments();
    })
    .then(() => {
        console.log('All data loaded successfully');
        populateRoomSelect(); // เรียกใช้อีกครั้งหลังจากโหลดข้อมูลทั้งหมด
    })
    .catch(error => console.error('Error initializing data:', error));

    // Event listeners
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('addTenantForm').addEventListener('submit', handleAddTenant);
    document.getElementById('editTenantForm').addEventListener('submit', handleEditTenant);
    document.getElementById('addRoomForm').addEventListener('submit', handleAddRoom);
    document.getElementById('editRoomForm').addEventListener('submit', handleEditRoom);
    document.getElementById('paymentForm').addEventListener('submit', handleAddPayment);
    document.getElementById('monthYearFilter').addEventListener('change', fetchPayments);

    // Tab change listeners
    document.getElementById('tenants-tab').addEventListener('click', function() {
        displayTenants();
    });
    document.getElementById('rooms-tab').addEventListener('click', function() {
        displayRooms();
    });
    document.getElementById('payments-tab').addEventListener('click', function() {
        fetchPayments();
    });
    document.getElementById('dashboard-tab').addEventListener('click', function() {
        fetchDashboardData();
    });

    // Initialize dashboard
    fetchDashboardData();
});

function fetchRooms() {
    return fetch('/api/rooms')
        .then(response => response.json())
        .then(data => {
            //console.log('All rooms data:', JSON.stringify(data, null, 2));
            rooms = data;
            displayRooms();
            return rooms;
        })
        .catch(error => console.error('Error fetching rooms:', error));
}

function fetchTenants() {
    return fetch('/api/tenants')
        .then(response => response.json())
        .then(data => {
            //console.log('All tenants data:', JSON.stringify(data, null, 2));
            tenants = data;
            displayTenants();
            return tenants;
        })
        .catch(error => console.error('Error fetching tenants:', error));
}

function initializeMonthYearFilter() {
    const select = document.getElementById('monthYearFilter');
    const today = new Date();
    
    for (let i = 3; i >= -12; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
        const optionValue = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const option = document.createElement('option');
        option.value = optionValue;
        
        const buddhistYear = d.getFullYear() + 543;
        const thaiMonth = d.toLocaleString('th-TH', { month: 'long' });
        option.text = `${thaiMonth} ${buddhistYear}`;
        
        select.appendChild(option);
        
        if (i === 0) {
            option.selected = true;
        }
    }
    
    currentMonthYear = select.value;
    console.log('Initial month-year filter value:', currentMonthYear);
}

function convertToThaiDate(dateString) {
    const date = new Date(dateString);
    const thaiYear = date.getFullYear() + 543;
    const thaiMonth = date.toLocaleString('th-TH', { month: 'long' });
    return `${thaiMonth} ${thaiYear}`;
}

function fetchPayments() {
    const select = document.getElementById('monthYearFilter');
    currentMonthYear = select.value;

    console.log('Selected month-year:', currentMonthYear);
    
    return fetch(`/api/payments?month=${currentMonthYear}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(`HTTP error! status: ${response.status}, message: ${err.message}`);
                });
            }
            return response.json();
        })
        .then(data => {
            //console.log('Received payments data:', data);
            payments = data;
            displayPayments();
        })
        .catch(error => {
            console.error('Error fetching payments:', error);
            payments = [];
            displayPayments();
            showAlert('เกิดข้อผิดพลาด', `ไม่สามารถดึงข้อมูลการชำระเงินได้: ${error.message}`, 'error');
        });
}

function displayTenants() {
    const tenantList = document.getElementById('tenantList');
    tenantList.innerHTML = '';

    tenants.forEach(tenant => {
        const tenantCard = `
            <div class="card mb-3">
                <div class="card-body">
                    <h5 class="card-title">${tenant.name}</h5>
                    <p class="card-text">ห้อง: ${tenant.rooms ? tenant.rooms.room_number : 'ไม่ระบุ'}</p>
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
    console.log('Displaying payments for:', convertToThaiDate(currentMonthYear));
    //console.log('Available payments:', payments);
    
    const paymentTable = document.getElementById('paymentsTable').getElementsByTagName('tbody')[0];
    paymentTable.innerHTML = '';

    let paidCount = 0;
    let unpaidCount = 0;
    let totalAmount = 0;

    rooms.forEach(room => {
        const payment = payments.find(p => p.room_id === room.id);
        const tenant = tenants.find(t => t.room_id === room.id);

        const row = paymentTable.insertRow();
        row.innerHTML = `
            <td>${room.room_number}</td>
            <td>${tenant ? tenant.name : '-'}</td>
            <td><span class="status-badge ${payment ? 'status-paid' : 'status-unpaid'}">${payment ? 'ชำระแล้ว' : 'ยังไม่ชำระ'}</span></td>
            <td>${payment ? `${payment.amount.toLocaleString()} บาท` : '-'}</td>
            <td>${payment ? formatDate(payment.payment_date) : '-'}</td>
            <td>${tenant ? `<button class="btn btn-sm btn-primary" onclick="showPaymentModal(${tenant.id}, ${room.id})">บันทึก</button>` : '-'}</td>
        `;

        if (payment) {
            paidCount++;
            totalAmount += payment.amount;
        } else if (tenant) {
            unpaidCount++;
        }
    });

    document.getElementById('paidCount').textContent = paidCount;
    document.getElementById('unpaidCount').textContent = unpaidCount;
    document.getElementById('totalAmount').textContent = totalAmount.toLocaleString();
}

function populateTenantSelect() {
    const tenantSelect = document.getElementById('paymentTenantId');
    tenantSelect.innerHTML = '<option value="">เลือกผู้เช่า</option>';
    
    tenants.forEach(tenant => {
        if (tenant.rooms) {
            const option = document.createElement('option');
            option.value = tenant.id;
            option.textContent = `${tenant.name} (ห้อง ${tenant.rooms.room_number})`;
            tenantSelect.appendChild(option);
        }
    });
}

function handleAddTenant(e) {
    e.preventDefault();
    const tenantData = {
        name: document.getElementById('addTenantName').value,
        phone: document.getElementById('addTenantPhone').value,
        email: document.getElementById('addTenantEmail').value,
        room_id: parseInt(document.getElementById('addRoomId').value),
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
            .then(response => {
                console.log('Delete response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Delete response data:', data);
                if (data.success) {
                    fetchTenants();
                    fetchRooms();
                    showAlert('ลบข้อมูลสำเร็จ', 'ข้อมูลผู้เช่าได้ถูกลบเรียบร้อยแล้ว', 'success');
                } else {
                    throw new Error(data.message || 'Failed to delete tenant');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('เกิดข้อผิดพลาด', `ไม่สามารถลบข้อมูลผู้เช่าได้: ${error.message}`, 'error');
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

function showPaymentModal(tenantId, roomId) {
    document.getElementById('paymentTenantId').value = tenantId;
    document.getElementById('paymentRoomId').value = roomId;
    
    // ตั้งค่าเริ่มต้นสำหรับผู้เช่าและห้อง
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
        document.getElementById('paymentTenantId').value = tenant.id;
        document.getElementById('paymentTenantName').textContent = tenant.name;
        document.getElementById('paymentRoomNumber').textContent = tenant.rooms.room_number;
    }
    
    populatePaymentMonthSelect();
    
    // ตั้งค่าเริ่มต้นสำหรับวันที่ชำระเป็นวันปัจจุบัน
    const currentDate = new Date();
    document.getElementById('paymentDate').value = currentDate.toISOString().slice(0, 10);

    new bootstrap.Modal(document.getElementById('addPaymentModal')).show();
}

function populatePaymentMonthSelect() {
    const select = document.getElementById('paymentForMonth');
    const today = new Date();
    
    select.innerHTML = ''; // Clear existing options
    
    for (let i = 3; i >= -3; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
        const optionValue = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const option = document.createElement('option');
        option.value = optionValue;
        
        const buddhistYear = d.getFullYear() + 543;
        const thaiMonth = d.toLocaleString('th-TH', { month: 'long' });
        option.text = `${thaiMonth} ${buddhistYear}`;
        
        select.appendChild(option);
        
        if (i === 0) {
            option.selected = true;
        }
    }
}

function handleAddPayment(e) {
    e.preventDefault();
    const paymentForMonth = document.getElementById('paymentForMonth').value;
    const paymentData = {
        tenant_id: parseInt(document.getElementById('paymentTenantId').value),
        room_id: parseInt(document.getElementById('paymentRoomId').value),
        amount: parseFloat(document.getElementById('paymentAmount').value),
        payment_date: document.getElementById('paymentDate').value,
        payment_method: document.getElementById('paymentMethod').value,
        payment_for_month: paymentForMonth // ใช้ค่า YYYY-MM จาก select
    };

    console.log('Submitting payment data:', paymentData);

    fetch('/api/payments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Payment response:', data);
        if (data.success) {
            fetchPayments();
            const modal = bootstrap.Modal.getInstance(document.getElementById('addPaymentModal'));
            modal.hide();
            showAlert('บันทึกการชำระเงินสำเร็จ', 'ข้อมูลการชำระเงินได้รับการบันทึกเรียบร้อยแล้ว', 'success');
            document.getElementById('paymentForm').reset();
        } else {
            showAlert('เกิดข้อผิดพลาด', data.message || 'ไม่สามารถบันทึกการชำระเงินได้ กรุณาลองใหม่อีกครั้ง', 'error');
        }
    })
    .catch(error => {
        console.error('Error adding payment:', error);
        showAlert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกการชำระเงินได้ กรุณาลองใหม่อีกครั้ง', 'error');
    });
}

function populateRoomSelect() {
    console.log('populateRoomSelect function called');
    try {
        const roomSelect = document.getElementById('addRoomId');
        if (!roomSelect) {
            console.error('Room select element not found');
            return;
        }
        
        console.log('Clearing existing options');
        roomSelect.innerHTML = '<option value="">เลือกห้อง</option>';
        
        console.log('Total rooms:', rooms.length);
        console.log('Total tenants:', tenants.length);
        
        let availableRoomsCount = 0;
        rooms.forEach(room => {
            console.log('Checking room:', room.room_number, 'ID:', room.id);
            const hasTenant = tenants.some(tenant => tenant.room_id === room.id && tenant.move_out_date === null);
            if (!hasTenant) {
                console.log('Room is available:', room.room_number);
                const option = document.createElement('option');
                option.value = room.id;
                option.textContent = `ห้อง ${room.room_number}`;
                roomSelect.appendChild(option);
                availableRoomsCount++;
            } else {
                console.log('Room is occupied:', room.room_number);
            }
        });
        
        console.log(`Populated ${availableRoomsCount} available rooms`);
        console.log('Final room select options:', Array.from(roomSelect.options).map(opt => opt.textContent));
    } catch (error) {
        console.error('Error in populateRoomSelect:', error);
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
