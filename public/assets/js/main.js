let roomsData = [];

document.addEventListener('DOMContentLoaded', function() {
    fetchRooms();
    
    document.getElementById('searchInput').addEventListener('input', filterRooms);
    document.getElementById('statusFilter').addEventListener('change', filterRooms);
    document.getElementById('minPrice').addEventListener('input', filterRooms);
    document.getElementById('maxPrice').addEventListener('input', filterRooms);
    
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
});

function fetchRooms() {
    fetch('/api/rooms')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Fetched data:", data);
            roomsData = data.sort((a, b) => b.price - a.price); // เรียงลำดับจากแพงสุดไปถูกสุด
            displayRooms(roomsData);
        })
        .catch(error => {
            console.error('Error:', error);
            showError('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message);
        });
}

function filterRooms() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value.toLowerCase();
    const minPrice = document.getElementById('minPrice').value;
    const maxPrice = document.getElementById('maxPrice').value;

    const filteredRooms = roomsData.filter(room => {
        const matchesSearch = room.room_number.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === '' || (room.status && room.status.toLowerCase() === statusFilter);
        const matchesPrice = (minPrice === '' || room.price >= parseInt(minPrice)) && 
                             (maxPrice === '' || room.price <= parseInt(maxPrice));

        return matchesSearch && matchesStatus && matchesPrice;
    });

    displayRooms(filteredRooms);
}

function displayRooms(rooms) {
    const roomList = document.getElementById('roomList');
    roomList.innerHTML = '';

    if (rooms.length === 0) {
        roomList.innerHTML = '<p>ไม่พบห้องพักที่ตรงกับเงื่อนไขการค้นหา</p>';
        return;
    }

    rooms.forEach(room => {
        const status = room.status || 'ว่าง';
        const statusClass = status.toLowerCase() === 'ว่าง' ? 'status-available' : 'status-occupied';

        const roomCard = `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="card room-card">
                    ${room.images && room.images.length > 0 ? `
                        <div id="carousel${room.id}" class="carousel slide" data-bs-ride="carousel">
                            <div class="carousel-inner">
                                ${room.images.map((img, index) => `
                                    <div class="carousel-item ${index === 0 ? 'active' : ''}">
                                        <img src="${img}" class="d-block w-100" alt="Room ${room.room_number}">
                                    </div>
                                `).join('')}
                            </div>
                            ${room.images.length > 1 ? `
                                <button class="carousel-control-prev" type="button" data-bs-target="#carousel${room.id}" data-bs-slide="prev">
                                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                    <span class="visually-hidden">Previous</span>
                                </button>
                                <button class="carousel-control-next" type="button" data-bs-target="#carousel${room.id}" data-bs-slide="next">
                                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                    <span class="visually-hidden">Next</span>
                                </button>
                            ` : ''}
                        </div>
                    ` : '<img src="path/to/default-image.jpg" class="card-img-top" alt="No image available">'}
                    <div class="card-body">
                        <h5 class="card-title">${room.room_number}</h5>
                        <p class="card-text ${statusClass}">
                            สถานะ: ${status}
                        </p>
                        <p class="card-text">ราคา: ฿${room.price.toLocaleString()} / เดือน</p>
                        <p class="card-text">ขนาด: ${room.size || 'ไม่ระบุ'} ตร.ม.</p>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-primary btn-sm" onclick="showRoomDetails(${room.id})">ดูรายละเอียด</button>
                    </div>
                </div>
            </div>
        `;
        roomList.innerHTML += roomCard;
    });
}

function showRoomDetails(id) {
    const room = roomsData.find(r => r.id === id);
    if (!room) {
        console.error('Room not found');
        return;
    }

    const status = room.status || 'ว่าง';
    const statusClass = (status.toLowerCase() === 'ว่าง') ? 'status-available' : 'status-occupied';
    
    const amenitiesList = room.amenities ? room.amenities.join(', ') : 'ไม่มีข้อมูล';

    let imageGallery = '';
    if (room.images && room.images.length > 0) {
        imageGallery = `
            <div class="image-gallery mt-3">
                ${room.images.map((img, index) => `
                    <img src="${img}" alt="Room ${room.room_number} Image ${index + 1}" 
                         class="gallery-thumbnail" onclick="showFullImage('${img}')">
                `).join('')}
            </div>
        `;
    }

    const detailContent = `
        <h4 class="mb-3">${room.room_number}</h4>
        <p><strong>ราคา:</strong> ฿${room.price.toLocaleString()} / เดือน</p>
        <p><strong>สถานะ:</strong> <span class="${statusClass}">${status}</span></p>
        <p><strong>ขนาดห้อง:</strong> ${room.size || 'ไม่ระบุ'} ตร.ม.</p>
        <p><strong>สิ่งอำนวยความสะดวก:</strong> ${amenitiesList}</p>
        <p><strong>รายละเอียด:</strong> ${room.description || 'ไม่มีข้อมูล'}</p>
        ${room.latitude && room.longitude ? `
            <p><a href="https://www.google.com/maps?q=${room.latitude},${room.longitude}" target="_blank" class="btn btn-primary btn-sm"><i class="fas fa-map-marker-alt"></i> ดูตำแหน่งบน Google Maps</a></p>
        ` : ''}
        ${imageGallery}
    `;

    document.getElementById('roomDetailContent').innerHTML = detailContent;
    new bootstrap.Modal(document.getElementById('roomDetailModal')).show();
}

function showFullImage(imageSrc) {
    const fullImageModal = `
        <div class="modal fade" id="fullImageModal" tabindex="-1">
            <div class="modal-dialog modal-fullscreen">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body d-flex align-items-center justify-content-center">
                        <img src="${imageSrc}" class="img-fluid" alt="Full size image">
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', fullImageModal);
    const modal = new bootstrap.Modal(document.getElementById('fullImageModal'));
    modal.show();
    document.getElementById('fullImageModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}
function showError(message) {
    const roomList = document.getElementById('roomList');
    roomList.innerHTML = `<div class="alert alert-danger" role="alert">${message}</div>`;
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'admin.html';
        } else {
            alert(data.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    });
}

function formatDate(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}
