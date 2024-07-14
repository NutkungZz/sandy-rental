document.addEventListener('DOMContentLoaded', function() {
    // เพิ่ม event listener สำหรับปุ่มเพิ่มค่าใช้จ่าย
    document.getElementById('addExpenseBtn').addEventListener('click', showExpenseModal);

    // เพิ่ม event listener สำหรับฟอร์มค่าใช้จ่าย
    document.getElementById('expenseForm').addEventListener('submit', handleExpenseSubmit);

    // โหลดข้อมูลค่าใช้จ่ายเมื่อคลิกที่แท็บค่าใช้จ่าย
    document.getElementById('expenses-tab').addEventListener('click', loadExpenses);

    // เติมข้อมูลห้องในฟอร์มค่าใช้จ่าย
    populateRoomSelect();

    // เพิ่ม event listener สำหรับ Modal
    document.getElementById('expenseModal').addEventListener('show.bs.modal', function () {
        populateRoomSelect();
    });
});

function showExpenseModal() {
    // แสดง modal เพิ่มค่าใช้จ่าย
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
        // แก้ไขค่าใช้จ่าย
        updateExpense(expenseId, expenseData);
    } else {
        // เพิ่มค่าใช้จ่ายใหม่
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
            //alert('เพิ่มค่าใช้จ่ายสำเร็จ');
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
            alert('เกิดข้อผิดพลาด: ' + data.message);
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
        console.log('Expenses data:', data); // เพิ่มบรรทัดนี้
        displayExpenses(data);
    })
    .catch(error => {
        console.error('Error:', error);
        //alert('เกิดข้อผิดพลาดในการโหลดข้อมูลค่าใช้จ่าย');
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
    .then(expense => {
        console.log('Expense data for editing:', expense); // เพิ่ม log เพื่อดูข้อมูลที่ได้รับ
        document.getElementById('expenseId').value = expense.id;
        document.getElementById('expenseDate').value = expense.date.split('T')[0]; // แปลงวันที่ให้อยู่ในรูปแบบที่ input type="date" ต้องการ
        document.getElementById('expenseType').value = expense.type;
        document.getElementById('expenseAmount').value = expense.amount;
        document.getElementById('expenseDetails').value = expense.details || '';
        document.getElementById('expenseRoom').value = expense.room_id || '';
        document.getElementById('expenseModalTitle').textContent = 'แก้ไขค่าใช้จ่าย';
        new bootstrap.Modal(document.getElementById('expenseModal')).show();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลค่าใช้จ่าย');
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

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('th-TH', options);
}
