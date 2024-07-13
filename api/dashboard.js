const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
  try {
    // ดึงข้อมูลการชำระเงินรายเดือน
    const { data: monthlyPayments, error: monthlyError } = await supabase
      .from('payments')
      .select('payment_month, amount')
      .order('payment_month', { ascending: true });

    if (monthlyError) throw monthlyError;

    // ดึงข้อมูลสถานะการชำระเงินของเดือนปัจจุบัน
    const currentMonth = new Date().toISOString().slice(0, 7); // รูปแบบ 'YYYY-MM'
    const { data: statusData, error: statusError } = await supabase
      .from('tenants')
      .select('id, rooms!inner(id, room_number), payments!inner(payment_month, amount)')
      .eq('payments.payment_month', currentMonth);

    if (statusError) throw statusError;

    // จัดรูปแบบข้อมูลสำหรับส่งกลับ
    const dashboardData = {
      totalRooms: (await supabase.from('rooms').select('id', { count: 'exact' })).count || 0,
      vacantRooms: (await supabase.from('rooms').select('id', { count: 'exact' }).eq('status', 'ว่าง')).count || 0,
      monthlyIncome: (await supabase.from('payments').select('amount').gte('payment_date', new Date().toISOString().slice(0, 7)).sum('amount')).sum || 0,
      unpaidCount: statusData.filter(t => t.payments.length === 0).length,
      monthlyPayments: processMonthlyPayments(monthlyPayments),
      paymentStatus: processPaymentStatus(statusData),
      recentPayments: await getRecentPayments()
    };

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

  if (error) throw error;
  return data;
}
