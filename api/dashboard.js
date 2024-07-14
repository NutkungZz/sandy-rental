const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
    try {
        console.log('Fetching dashboard data...');

        // ดึงข้อมูลจำนวนห้องทั้งหมด
        const { data: rooms, error: roomsError } = await supabase
            .from('rooms')
            .select('*');

        if (roomsError) throw roomsError;

        const totalRooms = rooms.length;
        const vacantRooms = rooms.filter(room => room.status === 'ว่าง').length;

        // ดึงข้อมูลการชำระเงิน
        const { data: payments, error: paymentsError } = await supabase
            .from('payments')
            .select('*, tenants(name), rooms(room_number)')
            .order('payment_date', { ascending: false });

        if (paymentsError) throw paymentsError;

        // คำนวณรายได้เดือนนี้และจำนวนห้องที่ยังไม่ชำระ
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
        const currentMonthYear = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;

        console.log('Current month-year:', currentMonthYear);

        const monthlyIncome = payments
            .filter(payment => payment.payment_for_month === currentMonthYear)
            .reduce((sum, payment) => sum + payment.amount, 0);

        const paidRoomsThisMonth = new Set(payments
            .filter(payment => payment.payment_for_month === currentMonthYear)
            .map(payment => payment.room_id));

        const unpaidCount = totalRooms - paidRoomsThisMonth.size - vacantRooms;

        // จัดรูปแบบข้อมูลสำหรับส่งกลับ
        const dashboardData = {
            totalRooms,
            vacantRooms,
            monthlyIncome,
            unpaidCount,
            monthlyPayments: processMonthlyPayments(payments),
            paymentStatus: [paidRoomsThisMonth.size, unpaidCount],
            recentPayments: payments.slice(0, 5)
        };

        console.log('Dashboard data:', dashboardData);
        res.status(200).json(dashboardData);
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล Dashboard', error: error.message });
    }
};

function processMonthlyPayments(payments) {
    const currentYear = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => {
        const month = String(i + 1).padStart(2, '0');
        return `${currentYear}-${month}-01`;
    });
    
    return months.map(monthYear => {
        const monthlyTotal = payments
            .filter(p => p.payment_for_month === monthYear)
            .reduce((sum, payment) => sum + payment.amount, 0);
        return monthlyTotal;
    });
}
