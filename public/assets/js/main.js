let roomsData = [];

document.addEventListener('DOMContentLoaded', function() {
    fetchRooms();
});

function fetchRooms() {
    fetch('/api/rooms')
        .then(response => response.json())
        .then(data => {
            console.log("Fetched data:", data);
            if (data.error) {
                throw new Error(data.error);
            }
            roomsData = data.map(row => ({c: row.map(cell => ({v: cell}))}));
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
    
    rooms.forEach((room, index) => {
        const roomNumber = room.c[0] && room.c[0].v ? room.c[0].v : 'ไม่ระบุ';
        const price = room.c[1] && room.c[1].v ? room.c[1].v : 'ไม่ระบุ';
        const status = room.c[2] && room.c[2].v ? room.c[2].v : 'ไม่ระบุ';
        const imageUrls = room.c[3] && room.c[3].v ? room.c[3].v.split(',').map(url => url.trim()) : [];
        const latitude = room.c[8] && room.c[8].v ? room.c[8].v : null;
        const longitude = room.c[9] && room.c[9].v ? room.c[9].v : null;

        const statusClass = status.toLowerCase() === 'ว่าง' ? 'status-available' : 'status-occupied';

        let carouselItems = '';
        let carouselIndicators = '';
        if (imageUrls.length > 0) {
            imageUrls.forEach((url, i) => {
                carouselItems += `
                    <div class="carousel-item ${i === 0 ? 'active' : ''}">
                        <img src="${url}" class="d-block w-100 room-image" alt="Room ${roomNumber} Image ${i+1}" onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=Image+Not+Found';">
                    </div>
                `;
                carouselIndicators += `
                    <button type="button" data-bs-target="#carousel${index}" data-bs-slide-to="${i}" ${i === 0 ? 'class="active" aria-current="true"' : ''} aria-label="Slide ${i+1}"></button>
                `;
            });
        } else {
            carouselItems = `
                <div class="carousel-item active">
                    <img src="https://via.placeholder.com/300x200?text=No+Image" class="d-block w-100 room-image" alt="No Image Available">
                </div>
            `;
        }

        const locationLink = latitude && longitude 
            ? `<a href="https://www.google.com/maps?q=${latitude},${longitude}" target="_blank" class="location-link"><i class="fas fa-map-marker-alt"></i> ดูแผนที่</a>`
            : '';

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
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">ห้อง ${roomNumber}</h5>
                        <p class="card-text ${statusClass}">สถานะ: ${status}</p>
                        <p class="price">฿${typeof price === 'number' ? price.toLocaleString() : price} / เดือน</p>
                    </div>
                    <div class="card-footer clearfix">
                        <button class="btn btn-primary btn-sm btn-details" onclick="showRoomDetails(${index})">ดูรายละเอียด</button>
                        ${locationLink}
                    </div>
                </div>
            </div>
        `;
        roomList.innerHTML += roomCard;
    });

    filterRooms();
}

function filterRooms() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value.toLowerCase();
    const minPrice = document.getElementById('minPrice').value;
    const maxPrice = document.getElementById('maxPrice').value;

    const roomCards = document.querySelectorAll('.room-card');

    roomCards.forEach(card => {
        const roomNumber = card.querySelector('.card-title').textContent.toLowerCase();
        const status = card.querySelector('.card-text').textContent.toLowerCase();
        const price = parseInt(card.querySelector('.price').textContent.replace(/[^0-9]/g, ''));

        const matchesSearch = roomNumber.includes(searchTerm);
        const matchesStatus = statusFilter === '' || status.includes(statusFilter);
        const matchesPrice = (minPrice === '' || price >= parseInt(minPrice)) && 
                             (maxPrice === '' || price <= parseInt(maxPrice));

        if (matchesSearch && matchesStatus && matchesPrice) {
            card.parentElement.style.display = '';
        } else {
            card.parentElement.style.display = 'none';
        }
    });
}

function formatDate(dateString) {
    if (!dateString || dateString === 'ไม่ระบุ') return 'ไม่ระบุ';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

function showRoomDetails(index) {
    const room = roomsData[index];
    const roomNumber = room.c[0] && room.c[0].v ? room.c[0].v : 'ไม่ระบุ';
    const price = room.c[1] && room.c[1].v ? room.c[1].v : 'ไม่ระบุ';
    const status = room.c[2] && room.c[2].v ? room.c[2].v : 'ไม่ระบุ';
    const roomSize = room.c[4] && room.c[4].v ? room.c[4].v : 'ไม่ระบุ';
    const amenities = room.c[5] && room.c[5].v ? room.c[5].v : 'ไม่ระบุ';
    const rentalStart = formatDate(room.c[6] && room.c[6].v ? room.c[6].v : 'ไม่ระบุ');
    const rentalEnd = formatDate(room.c[7] && room.c[7].v ? room.c[7].v : 'ไม่ระบุ');
    const latitude = room.c[8] && room.c[8].v ? room.c[8].v : null;
    const longitude = room.c[9] && room.c[9].v ? room.c[9].v : null;

    const statusClass = status.toLowerCase() === 'ว่าง' ? 'status-available' : 'status-occupied';

    const locationLink = latitude && longitude 
        ? `<p><a href="https://www.google.com/maps?q=${latitude},${longitude}" target="_blank" class="btn btn-primary btn-sm"><i class="fas fa-map-marker-alt"></i> ดูตำแหน่งบน Google Maps</a></p>`
        : '';

    const detailContent = `
        <h4 class="mb-3">ห้อง ${roomNumber}</h4>
        <p><strong>ราคา:</strong> ฿${typeof price === 'number' ? price.toLocaleString() : price} / เดือน</p>
        <p><strong>สถานะ:</strong> <span class="${statusClass}">${status}</span></p>
        <p><strong>ขนาดห้อง:</strong> ${roomSize}</p>
        <p><strong>สิ่งอำนวยความสะดวก:</strong> ${amenities}</p>
        <h5 class="mt-4 mb-2">ประวัติการเช่า</h5>
        <ul class="list-unstyled">
            <li><strong>วันที่เริ่มต้น:</strong> ${rentalStart}</li>
            <li><strong>วันที่สิ้นสุด:</strong> ${rentalEnd}</li>
        </ul>
        ${locationLink}
    `;

    document.getElementById('roomDetailContent').innerHTML = detailContent;
    new bootstrap.Modal(document.getElementById('roomDetailModal')).show();
}

function showError(message) {
    const roomList = document.getElementById('roomList');
    roomList.innerHTML = `<div class="alert alert-danger" role="alert">${message}</div>`;
}

document.getElementById('searchInput').addEventListener('input', filterRooms);
document.getElementById('statusFilter').addEventListener('change', filterRooms);
document.getElementById('minPrice').addEventListener('input', filterRooms);
document.getElementById('maxPrice').addEventListener('input', filterRooms);

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = 'admin.html';
        } else {
            alert(data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    });
});
