const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
  try {
    console.log('Fetching dashboard data...');

    // ดึงข้อมูลจำนวนห้องทั้งหมด
    const { count: totalRooms, error: totalRoomsError } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true });

    if (totalRoomsError) throw new Error(`Error fetching total rooms: ${totalRoomsError.message}`);

    // ดึงข้อมูลจำนวนห้องว่าง
    const { count: vacantRooms, error: vacantRoomsError } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ว่าง');

    if (vacantRoomsError) throw new Error(`Error fetching vacant rooms: ${vacantRoomsError.message}`);

    // ดึงข้อมูลรายได้เดือนนี้
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: monthlyIncomeData, error: monthlyIncomeError } = await supabase
      .from('payments')
      .select('amount')
      .gte('payment_date', `${currentMonth}-01`)
      .lte('payment_date', `${currentMonth}-31`);

    if (monthlyIncomeError) throw new Error(`Error fetching monthly income: ${monthlyIncomeError.message}`);

    const monthlyIncome = monthlyIncomeData.reduce((sum, payment) => sum + payment.amount, 0);

    // ดึงข้อมูลการชำระเงินรายเดือน
    const { data: monthlyPayments, error: monthlyPaymentsError } = await supabase
      .from('payments')
      .select('payment_month, amount')
      .order('payment_month', { ascending: true });

    if (monthlyPaymentsError) throw new Error(`Error fetching monthly payments: ${monthlyPaymentsError.message}`);

    // ดึงข้อมูลสถานะการชำระเงินของเดือนปัจจุบัน
    const { data: statusData, error: statusError } = await supabase
      .from('tenants')
      .select('id, rooms!inner(id, room_number), payments!inner(payment_month, amount)')
      .eq('payments.payment_month', currentMonth);

    if (statusError) throw new Error(`Error fetching payment status: ${statusError.message}`);

    // จัดรูปแบบข้อมูลสำหรับส่งกลับ
    const dashboardData = {
      totalRooms,
      vacantRooms,
      monthlyIncome,
      unpaidCount: statusData.filter(t => t.payments.length === 0).length,
      monthlyPayments: processMonthlyPayments(monthlyPayments),
      paymentStatus: processPaymentStatus(statusData),
      recentPayments: await getRecentPayments()
    };

    console.log('Dashboard data fetched successfully');
    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล Dashboard', error: error.message });
  }
};

function processMonthlyPayments(data) {
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const currentYear = new Date().getFullYear().toString();
  
  return months.map(month => {
    const matchingPayment = data.find(p => p.payment_month === `${currentYear}-${month}`);
    return matchingPayment ? matchingPayment.amount : 0;
  });
}

function processPaymentStatus(data) {
  const paidCount = data.filter(t => t.payments.length > 0).length;
  const unpaidCount = data.length - paidCount;
  return [paidCount, unpaidCount];
}

async function getRecentPayments() {
  const { data, error } = await supabase
    .from('payments')
    .select('*, tenants(name), rooms(room_number)')
    .order('payment_date', { ascending: false })
    .limit(5);

  if (error) throw new Error(`Error fetching recent payments: ${error.message}`);
  return data;
}
