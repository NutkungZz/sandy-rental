let monthlyExpenseChart = null;
let expenseTypeChart = null;

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addExpenseBtn').addEventListener('click', showExpenseModal);
    document.getElementById('expenseForm').addEventListener('submit', handleExpenseSubmit);
    document.getElementById('expenses-tab').addEventListener('click', loadExpenses);
    document.getElementById('expenseModal').addEventListener('show.bs.modal', function () {
        populateRoomSelect();
    });
    populateRoomSelect();
});

function showExpenseModal() {
    document.getElementById('expenseId').value = '';
    document.getElementById('expenseForm').reset();
    document.getElementById('expenseModalTitle').textContent = 'เพิ่มค่าใช้จ่าย';
    new bootstrap.Modal(document.getElementById('expenseModal')).show();
}

function handleExpenseSubmit(e) {
    e.preventDefault();
    const expenseData = {
        date: document.getElementById('expenseDate').value,
        type: document.getElementById('expenseType').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        details: document.getElementById('expenseDetails').value,
        room_id: document.getElementById('expenseRoom').value || null
    };

    const expenseId = document.getElementById('expenseId').value;
    if (expenseId) {
        updateExpense(expenseId, expenseData);
    } else {
        addExpense(expenseData);
    }
}

function addExpense(expenseData) {
    fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('เพิ่มค่าใช้จ่ายสำเร็จ');
            loadExpenses();
            bootstrap.Modal.getInstance(document.getElementById('expenseModal')).hide();
        } else {
            alert('เกิดข้อผิดพลาด: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการเพิ่มค่าใช้จ่าย');
    });
}

function updateExpense(id, expenseData) {
    fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('แก้ไขค่าใช้จ่ายสำเร็จ');
            loadExpenses();
            bootstrap.Modal.getInstance(document.getElementById('expenseModal')).hide();
        } else {
            alert('เกิดข้อผิดพลาด: ' + (data.message || 'ไม่สามารถแก้ไขค่าใช้จ่ายได้'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการแก้ไขค่าใช้จ่าย');
    });
}

function loadExpenses() {
    fetch('/api/expenses')
    .then(response => response.json())
    .then(data => {
        console.log('Expenses data:', data);
        const expenses = Array.isArray(data) ? data : [data];
        displayExpenses(expenses);
        const summary = summarizeExpenses(expenses);
        displayExpenseSummary(summary);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลค่าใช้จ่าย');
    });
}

function displayExpenses(expenses) {
    const tableBody = document.getElementById('expensesTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    expenses.forEach(expense => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${formatDate(expense.date)}</td>
            <td>${expense.type}</td>
            <td>฿${expense.amount.toLocaleString()}</td>
            <td>${expense.details || '-'}</td>
            <td>${expense.rooms ? expense.rooms.room_number : '-'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editExpense(${expense.id})">แก้ไข</button>
                <button class="btn btn-sm btn-danger" onclick="deleteExpense(${expense.id})">ลบ</button>
            </td>
        `;
    });
}

function editExpense(id) {
    fetch(`/api/expenses/${id}`)
    .then(response => response.json())
    .then(data => {
        console.log('Expense data for editing:', data);
        const expense = Array.isArray(data) ? data[0] : data;
        
        if (!expense) {
            throw new Error('ไม่พบข้อมูลค่าใช้จ่าย');
        }

        document.getElementById('expenseId').value = expense.id;
        document.getElementById('expenseDate').value = expense.date.split('T')[0];
        document.getElementById('expenseType').value = expense.type;
        document.getElementById('expenseAmount').value = expense.amount;
        document.getElementById('expenseDetails').value = expense.details || '';
        document.getElementById('expenseRoom').value = expense.room_id || '';
        document.getElementById('expenseModalTitle').textContent = 'แก้ไขค่าใช้จ่าย';
        new bootstrap.Modal(document.getElementById('expenseModal')).show();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลค่าใช้จ่าย: ' + error.message);
    });
}

function deleteExpense(id) {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบค่าใช้จ่ายนี้?')) {
        fetch(`/api/expenses/${id}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('ลบค่าใช้จ่ายสำเร็จ');
                loadExpenses();
            } else {
                alert('เกิดข้อผิดพลาด: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('เกิดข้อผิดพลาดในการลบค่าใช้จ่าย');
        });
    }
}

function populateRoomSelect() {
    fetch('/api/rooms')
    .then(response => response.json())
    .then(rooms => {
        const select = document.getElementById('expenseRoom');
        select.innerHTML = '<option value="">เลือกห้อง</option>';
        rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = room.room_number;
            select.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลห้อง');
    });
}

function summarizeExpenses(expenses) {
    const summary = {
        totalAmount: 0,
        byMonth: {},
        byType: {}
    };

    expenses.forEach(expense => {
        const amount = parseFloat(expense.amount);
        summary.totalAmount += amount;

        const month = expense.date.substring(0, 7);
        if (!summary.byMonth[month]) {
            summary.byMonth[month] = 0;
        }
        summary.byMonth[month] += amount;

        if (!summary.byType[expense.type]) {
            summary.byType[expense.type] = 0;
        }
        summary.byType[expense.type] += amount;
    });

    return summary;
}

function displayExpenseSummary(summary) {
    const summaryElement = document.getElementById('expensesSummary');
    summaryElement.innerHTML = `
        <h4>สรุปค่าใช้จ่าย</h4>
        <p>ยอดรวมทั้งหมด: ฿${summary.totalAmount.toLocaleString()}</p>
    `;

    createMonthlyExpenseChart(summary.byMonth);
    createExpenseTypeChart(summary.byType);
}

function createMonthlyExpenseChart(monthlyData) {
    const canvas = document.getElementById('monthlyExpenseChart');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    const ctx = canvas.getContext('2d');
    
    if (monthlyExpenseChart) {
        monthlyExpenseChart.destroy();
    }

    monthlyExpenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(monthlyData),
            datasets: [{
                label: 'ค่าใช้จ่ายรายเดือน',
                data: Object.values(monthlyData),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'จำนวนเงิน (บาท)'
                    }
                }
            }
        }
    });
}

function createExpenseTypeChart(typeData) {
    const canvas = document.getElementById('expenseTypeChart');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    const ctx = canvas.getContext('2d');
    
    if (expenseTypeChart) {
        expenseTypeChart.destroy();
    }

    expenseTypeChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(typeData),
            datasets: [{
                data: Object.values(typeData),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('th-TH', options);
}
