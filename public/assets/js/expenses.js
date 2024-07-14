document.addEventListener('DOMContentLoaded', function() {
    // เพิ่ม event listener สำหรับปุ่มเพิ่มค่าใช้จ่าย
    document.getElementById('addExpenseBtn').addEventListener('click', showExpenseModal);

    // เพิ่ม event listener สำหรับฟอร์มค่าใช้จ่าย
    document.getElementById('expenseForm').addEventListener('submit', handleExpenseSubmit);

    // โหลดข้อมูลค่าใช้จ่ายเมื่อคลิกที่แท็บค่าใช้จ่าย
    document.getElementById('expenses-tab').addEventListener('click', loadExpenses);

    // เติมข้อมูลห้องในฟอร์มค่าใช้จ่าย
    populateRoomSelect();
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
