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
        const currentMonth = new Date().toISOString().slice(0, 7); // format: 'YYYY-MM'
        const monthlyIncome = payments
            .filter(payment => payment.payment_for_month === currentMonth)
            .reduce((sum, payment) => sum + payment.amount, 0);

        const paidRoomsThisMonth = new Set(payments
            .filter(payment => payment.payment_for_month === currentMonth)
            .map(payment => payment.room_id));

        const unpaidCount = totalRooms - paidRoomsThisMonth.size;

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

        console.log('Dashboard data fetched successfully');
        res.status(200).json(dashboardData);
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล Dashboard', error: error.message });
    }
};

function processMonthlyPayments(payments) {
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const currentYear = new Date().getFullYear().toString();
    
    return months.map(month => {
        const monthlyTotal = payments
            .filter(p => p.payment_for_month === `${currentYear}-${month}`)
            .reduce((sum, payment) => sum + payment.amount, 0);
        return monthlyTotal;
    });
}
