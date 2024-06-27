let roomsData = [];
let isProcessing = false;

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
            roomsData = data;
            displayRooms(roomsData);
        })
        .catch(error => {
            console.error('Error:', error);
            showError('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message);
        });
}

function displayRooms(rooms) {
    const roomList = document.getElementById('roomList');
    roomList.innerHTML = '';
    
    if (rooms.length === 0) {
        roomList.innerHTML = '<p>ไม่พบข้อมูลห้องพัก</p>';
        return;
    }

    rooms.forEach((room, index) => {
        let carouselItems = '';
        let carouselIndicators = '';
        room.images.forEach((image, i) => {
            carouselItems += `
                <div class="carousel-item ${i === 0 ? 'active' : ''}">
                    <img src="${image}" class="d-block w-100" alt="Room ${room.room_number} Image ${i+1}">
                </div>
            `;
            carouselIndicators += `
                <button type="button" data-bs-target="#carousel${index}" data-bs-slide-to="${i}" 
                    ${i === 0 ? 'class="active" aria-current="true"' : ''} aria-label="Slide ${i+1}"></button>
            `;
        });

        const roomCard = `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="card room-card">
                    <div id="carousel${index}" class="carousel slide" data-bs-ride="carousel">
                        <div class="carousel-indicators">
                            ${carouselIndicators}
                        </div>
                        <div class="carousel-inner">
                            ${carouselItems}
                        </div>
                        <button class="carousel-control-prev" type="button" data-bs-target="#carousel${index}" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Previous</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#carousel${index}" data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Next</span>
                        </button>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${room.room_number}</h5>
                        <p class="card-text ${room.status.toLowerCase() === 'ว่าง' ? 'status-available' : 'status-occupied'}">
                            สถานะ: ${room.status}
                        </p>
                        <p class="price">฿${room.price.toLocaleString()} / เดือน</p>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-primary btn-sm" onclick="showRoomDetails(${index})">ดูรายละเอียด</button>
                    </div>
                </div>
            </div>
        `;
        roomList.innerHTML += roomCard;
    });
}

function filterRooms() {
    if (isProcessing) return;
    isProcessing = true;

    try {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value.toLowerCase();
        const minPrice = document.getElementById('minPrice').value;
        const maxPrice = document.getElementById('maxPrice').value;

        const filteredRooms = roomsData.filter(room => {
            const matchesSearch = room.room_number.toLowerCase().includes(searchTerm);
            const matchesStatus = statusFilter === '' || room.status.toLowerCase() === statusFilter;
            const matchesPrice = (minPrice === '' || room.price >= parseInt(minPrice)) && 
                                 (maxPrice === '' || room.price <= parseInt(maxPrice));

            return matchesSearch && matchesStatus && matchesPrice;
        });

        displayRooms(filteredRooms);
    } catch (error) {
        console.error('Error in filterRooms:', error);
        showError('เกิดข้อผิดพลาดในการกรองข้อมูล');
    } finally {
        isProcessing = false;
    }
}

function showRoomDetails(index) {
    const room = roomsData[index];
    const amenitiesList = room.amenities.join(', ');

    const detailContent = `
        <h4 class="mb-3">${room.room_number}</h4>
        <p><strong>ราคา:</strong> ฿${room.price.toLocaleString()} / เดือน</p>
        <p><strong>สถานะ:</strong> <span class="${room.status.toLowerCase() === 'ว่าง' ? 'status-available' : 'status-occupied'}">${room.status}</span></p>
        <p><strong>ขนาดห้อง:</strong> ${room.size}</p>
        <p><strong>สิ่งอำนวยความสะดวก:</strong> ${amenitiesList}</p>
        <p><strong>รายละเอียด:</strong> ${room.description}</p>
        <h5 class="mt-4 mb-2">ประวัติการเช่า</h5>
        <ul class="list-unstyled">
            <li><strong>วันที่เริ่มต้น:</strong> ${formatDate(room.rental_start)}</li>
            <li><strong>วันที่สิ้นสุด:</strong> ${formatDate(room.rental_end)}</li>
        </ul>
        <p><a href="https://www.google.com/maps?q=${room.latitude},${room.longitude}" target="_blank" class="btn btn-primary btn-sm"><i class="fas fa-map-marker-alt"></i> ดูตำแหน่งบน Google Maps</a></p>
    `;

    document.getElementById('roomDetailContent').innerHTML = detailContent;
    new bootstrap.Modal(document.getElementById('roomDetailModal')).show();
}

function formatDate(dateString) {
    if (!dateString || dateString === '9999-12-31') return 'ไม่ระบุ';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
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
