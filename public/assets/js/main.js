let roomsData = [];
let isProcessing = false;

document.addEventListener('DOMContentLoaded', function() {
    fetchRooms();
    
    document.getElementById('searchInput').addEventListener('input', filterRooms);
    document.getElementById('statusFilter').addEventListener('change', filterRooms);
    document.getElementById('minPrice').addEventListener('input', filterRooms);
    document.getElementById('maxPrice').addEventListener('input', filterRooms);
    
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    const adminLoginButton = document.querySelector('.btn-admin');
    if (adminLoginButton) {
        adminLoginButton.addEventListener('click', showLoginModal);
    }

    // เพิ่มการตรวจสอบ token เมื่อโหลดหน้า
    const token = localStorage.getItem('token');
    if (!token && window.location.pathname.includes('admin.html')) {
        // ถ้าไม่มี token และพยายามเข้าถึง admin.html โดยตรง ให้ redirect กลับไปที่ index.html
        window.location.href = 'index.html';
    }
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
