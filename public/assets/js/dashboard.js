document.addEventListener('DOMContentLoaded', function() {
    fetchDashboardData();
});

function fetchDashboardData() {
    fetch('/api/dashboard')
        .then(response => response.json())
        .then(data => {
            updateDashboardUI(data);
        })
        .catch(error => {
            console.error('Error fetching dashboard data:', error);
        });
}

function updateDashboardUI(data) {
    // อัพเดตข้อมูลทั่วไป
    document.getElementById('totalRooms').textContent = data.totalRooms;
    document.getElementById('vacantRooms').textContent = data.vacantRooms;
    document.getElementById('monthlyIncome').textContent = '฿' + data.monthlyIncome.toLocaleString();
    document.getElementById('unpaidCount').textContent = data.unpaidCount;

    // สร้างกราฟรายได้รายเดือน
    createIncomeChart(data.monthlyPayments);

    // สร้างกราฟวงกลมแสดงสถานะการชำระเงิน
    createPaymentStatusChart(data.paymentStatus);

    // อัพเดตตารางการชำระเงินล่าสุด
    updateRecentPaymentsTable(data.recentPayments);
}

function createIncomeChart(monthlyData) {
    const ctx = document.getElementById('incomeChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
            datasets: [{
                label: 'รายได้ (บาท)',
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

function createPaymentStatusChart(statusData) {
    const ctx = document.getElementById('paymentStatusChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
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

function updateRecentPaymentsTable(payments) {
    const tableBody = document.getElementById('recentPaymentsTable');
    tableBody.innerHTML = '';

    payments.forEach(payment => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${formatDate(payment.payment_date)}</td>
            <td>${payment.rooms.room_number}</td>
            <td>${payment.tenants.name}</td>
            <td>฿${payment.amount.toLocaleString()}</td>
        `;
    });
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('th-TH', options);
}
