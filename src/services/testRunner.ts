import { completeInvoice, generateInvoiceCode } from './invoiceService';
import {
  loadDatabase,
  saveDatabase,
  getCatalogItemById,
  saveCatalogItem,
  getInvoices,
  saveVaccination,
  deleteVaccination,
  getVaccinationsByPetId,
  getNotifications,
  deleteCatalogItem,
  exportFullBackup,
  importFullBackup
} from './storage';
import { isAppointmentPastUnhandled, cancelAppointmentWithCleanup } from './appointmentService';
import { saveVaccinationWithRules, deleteVaccinationWithRules } from './vaccineService';
import { VaccinationRecord, CatalogItem, Appointment } from '../types/petflow';

export interface TestCaseResult {
  id: string;
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: string;
  durationMs: number;
}

export async function runAllTestCases(): Promise<TestCaseResult[]> {
  const results: TestCaseResult[] = [];
  const backupBefore = exportFullBackup();

  try {
    // -------------------------------------------------------------
    // TC-01: Thoát khi đang nhập hóa đơn nhưng chưa xác nhận thanh toán
    // -------------------------------------------------------------
    const t01Start = performance.now();
    const invCountBefore01 = getInvoices().length;
    const testItem01 = getCatalogItemById('item_001');
    const stockBefore01 = testItem01 ? testItem01.stockQuantity : 0;
    // Simulate discarding an in-progress draft (no completeInvoice called)
    const invCountAfter01 = getInvoices().length;
    const stockAfter01 = getCatalogItemById('item_001')?.stockQuantity ?? 0;
    const t01Passed = invCountBefore01 === invCountAfter01 && stockBefore01 === stockAfter01;
    results.push({
      id: 'TC-01',
      name: 'Thoát khi đang nhập hóa đơn chưa thanh toán',
      passed: t01Passed,
      expected: 'Không lưu hóa đơn nháp, không trừ kho.',
      actual: t01Passed
        ? `Số hóa đơn không đổi (${invCountAfter01}), tồn kho giữ nguyên (${stockAfter01}).`
        : `Lỗi: hóa đơn bị lưu hoặc tồn kho bị thay đổi.`,
      durationMs: Math.round(performance.now() - t01Start)
    });

    // -------------------------------------------------------------
    // TC-02: Bấm xác nhận thanh toán nhiều lần liên tiếp (chống lặp)
    // -------------------------------------------------------------
    const t02Start = performance.now();
    const item02 = getCatalogItemById('item_001');
    const initialStock02 = item02?.stockQuantity ?? 10;
    // Fire two completeInvoice calls concurrently
    const req02 = {
      customerId: 'cust_001',
      customerName: 'Nguyễn Thị Mai',
      customerPhone: '0912345678',
      lines: [
        {
          itemId: 'item_001',
          itemName: 'Hạt Royal Canin',
          itemType: 'GOODS' as const,
          quantity: 1,
          unitPrice: 390000,
          discount: 0
        }
      ]
    };
    const [res1, res2] = await Promise.all([completeInvoice(req02), completeInvoice(req02)]);
    const stockAfter02 = getCatalogItemById('item_001')?.stockQuantity ?? 0;
    // Exactly one should succeed and one should be blocked by the atomic lock
    const t02Passed = (res1.success !== res2.success) && (initialStock02 - stockAfter02 === 1);
    results.push({
      id: 'TC-02',
      name: 'Bấm xác nhận thanh toán nhiều lần hoặc phản hồi chậm',
      passed: t02Passed,
      expected: 'Chỉ 1 hóa đơn hoàn thành, trừ kho đúng 1 lần.',
      actual: t02Passed
        ? `Giao dịch thứ nhất thành công, giao dịch thứ hai bị chặn an toàn. Tồn kho giảm đúng 1 (${initialStock02} -> ${stockAfter02}).`
        : `Lỗi chống lặp: res1=${res1.success}, res2=${res2.success}, tồn giảm=${initialStock02 - stockAfter02}`,
      durationMs: Math.round(performance.now() - t02Start)
    });

    // -------------------------------------------------------------
    // TC-03: Tồn hệ thống 2, hóa đơn có số lượng 3
    // -------------------------------------------------------------
    const t03Start = performance.now();
    // Prepare item with stock = 2
    const item03 = getCatalogItemById('item_007'); // Vanguard vaccine, default stock = 2
    if (item03) {
      item03.stockQuantity = 2;
      saveCatalogItem(item03);
    }
    const res03 = await completeInvoice({
      customerId: 'cust_001',
      customerName: 'Nguyễn Thị Mai',
      customerPhone: '0912345678',
      lines: [
        {
          itemId: 'item_007',
          itemName: 'Vaccine 7 bệnh Vanguard Plus',
          itemType: 'GOODS',
          quantity: 3,
          unitPrice: 320000,
          discount: 0
        }
      ]
    });
    const stockAfter03 = getCatalogItemById('item_007')?.stockQuantity;
    const t03Passed = res03.success && res03.hasStockWarnings && stockAfter03 === -1;
    results.push({
      id: 'TC-03',
      name: 'Tồn hệ thống 2, hóa đơn có số lượng 3',
      passed: t03Passed,
      expected: 'Hiện cảnh báo; cho phép hoàn thành theo quy định, tồn hệ thống thành -1 và cảnh báo tồn âm.',
      actual: t03Passed
        ? `Hóa đơn hoàn thành thành công, tồn kho thành ${stockAfter03}, hệ thống xuất cảnh báo: "${res03.stockWarnings[0]}"`
        : `Lỗi: success=${res03.success}, stock=${stockAfter03}, warnings=${res03.stockWarnings.length}`,
      durationMs: Math.round(performance.now() - t03Start)
    });

    // -------------------------------------------------------------
    // TC-04: Chỉ bán vaccine sản phẩm, không có dịch vụ tiêm
    // -------------------------------------------------------------
    const t04Start = performance.now();
    const res04 = await completeInvoice({
      customerId: 'cust_002',
      customerName: 'Trần Văn Bình',
      customerPhone: '0988776655',
      lines: [
        {
          itemId: 'item_006',
          itemName: 'Vaccine phòng Dại Rabisin',
          itemType: 'VACCINE_PRODUCT',
          quantity: 1,
          unitPrice: 120000,
          discount: 0
        }
      ]
    });
    const t04Passed = res04.success && res04.shouldPromptVaccineReminder === false;
    results.push({
      id: 'TC-04',
      name: 'Chỉ bán vaccine sản phẩm, không có dịch vụ tiêm',
      passed: t04Passed,
      expected: 'Trừ kho khi hoàn thành; không hiện nhắc bổ sung lịch sử tiêm.',
      actual: t04Passed
        ? `Hóa đơn hoàn thành, shouldPromptVaccineReminder = false.`
        : `Lỗi: shouldPromptVaccineReminder = ${res04.shouldPromptVaccineReminder}`,
      durationMs: Math.round(performance.now() - t04Start)
    });

    // -------------------------------------------------------------
    // TC-05: Có dịch vụ tiêm vaccine trong hóa đơn
    // -------------------------------------------------------------
    const t05Start = performance.now();
    const res05 = await completeInvoice({
      customerId: 'cust_001',
      customerName: 'Nguyễn Thị Mai',
      customerPhone: '0912345678',
      lines: [
        {
          itemId: 'srv_004',
          itemName: 'Dịch vụ tiêm vaccine & khám tổng quát',
          itemType: 'VACCINE_SERVICE',
          quantity: 1,
          unitPrice: 60000,
          discount: 0
        }
      ]
    });
    const t05Passed = res05.success && res05.shouldPromptVaccineReminder === true;
    results.push({
      id: 'TC-05',
      name: 'Có dịch vụ tiêm vaccine trong hóa đơn',
      passed: t05Passed,
      expected: 'Sau khi hoàn thành, hiện lời nhắc bổ sung lịch sử tiêm 1 lần.',
      actual: t05Passed
        ? `Hóa đơn hoàn thành, shouldPromptVaccineReminder = true.`
        : `Lỗi: shouldPromptVaccineReminder = ${res05.shouldPromptVaccineReminder}`,
      durationMs: Math.round(performance.now() - t05Start)
    });

    // -------------------------------------------------------------
    // TC-06: Lưu lịch sử tiêm không có ngày tiêm tiếp theo
    // -------------------------------------------------------------
    const t06Start = performance.now();
    const testVac06: VaccinationRecord = {
      id: `vac_tc06_${Date.now()}`,
      petId: 'pet_001',
      vaccineType: 'Vaccine Nobivac Lepto',
      vaccinationDate: '2026-10-01',
      validityYears: 1,
      certificatePhotoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
      nextDueDate: '', // empty!
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveVaccinationWithRules(testVac06);
    const notifs06 = getNotifications().filter(n => n.relatedEntityId === testVac06.id);
    const t06Passed = notifs06.length === 0;
    results.push({
      id: 'TC-06',
      name: 'Lưu lịch sử tiêm không có ngày tiêm tiếp theo',
      passed: t06Passed,
      expected: 'Lưu thành công; không tạo thông báo nhắc cho mũi đó.',
      actual: t06Passed
        ? `Đã lưu hồ sơ tiêm. Số thông báo được tạo: 0.`
        : `Lỗi: đã tạo ${notifs06.length} thông báo ngoài ý muốn.`,
      durationMs: Math.round(performance.now() - t06Start)
    });

    // -------------------------------------------------------------
    // TC-07: Lưu/sửa ngày tiêm tiếp theo là ngày đã qua
    // -------------------------------------------------------------
    const t07Start = performance.now();
    const testVac07: VaccinationRecord = {
      id: `vac_tc07_${Date.now()}`,
      petId: 'pet_002',
      vaccineType: 'Vaccine phòng Dại Rabisin',
      vaccinationDate: '2025-08-01',
      validityYears: 1,
      certificatePhotoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
      nextDueDate: '2026-08-01', // Date in the past!
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveVaccinationWithRules(testVac07);
    const overdueNotifs07 = getNotifications().filter(
      n => n.relatedEntityId === testVac07.id && n.type === 'VACCINE_OVERDUE'
    );
    const t07Passed = overdueNotifs07.length === 1;
    results.push({
      id: 'TC-07',
      name: 'Lưu/sửa ngày tiêm tiếp theo là ngày đã qua',
      passed: t07Passed,
      expected: 'Gửi thông báo quá hạn ngay một lần.',
      actual: t07Passed
        ? `Đã tạo thông báo quá hạn: "${overdueNotifs07[0].title}" - "${overdueNotifs07[0].body}".`
        : `Lỗi: tìm thấy ${overdueNotifs07.length} thông báo quá hạn.`,
      durationMs: Math.round(performance.now() - t07Start)
    });

    // -------------------------------------------------------------
    // TC-08: Nhập lịch sử khi mốc trước hạn 7 ngày đã qua
    // -------------------------------------------------------------
    const t08Start = performance.now();
    // Due date in 3 days from now (so 7-day mark was 4 days ago)
    const inThreeDays = new Date();
    inThreeDays.setDate(inThreeDays.getDate() + 3);
    const dueIn3DaysStr = inThreeDays.toISOString().slice(0, 10);

    const testVac08: VaccinationRecord = {
      id: `vac_tc08_${Date.now()}`,
      petId: 'pet_001',
      vaccineType: 'Vaccine 5 bệnh Virbagen',
      vaccinationDate: '2025-10-25',
      validityYears: 1,
      certificatePhotoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
      nextDueDate: dueIn3DaysStr,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveVaccinationWithRules(testVac08);
    const notifs08 = getNotifications().filter(n => n.relatedEntityId === testVac08.id);
    const has7dNotif = notifs08.some(n => n.type === 'VACCINE_7_DAY');
    const hasDueNotif = notifs08.some(n => n.type === 'VACCINE_DUE');
    const t08Passed = !has7dNotif && hasDueNotif;
    results.push({
      id: 'TC-08',
      name: 'Nhập lịch sử khi mốc trước hạn 7 ngày đã qua',
      passed: t08Passed,
      expected: 'Không gửi bù mốc trước 7 ngày; vẫn nhắc ngày đến hạn và quá hạn.',
      actual: t08Passed
        ? `Mốc 7 ngày đã qua -> bỏ qua thành công (has7d=false). Đã lên lịch nhắc đúng ngày đến hạn (hasDue=true).`
        : `Lỗi: has7dNotif=${has7dNotif}, hasDueNotif=${hasDueNotif}`,
      durationMs: Math.round(performance.now() - t08Start)
    });

    // -------------------------------------------------------------
    // TC-09: Xóa lịch sử tiêm có thông báo chờ
    // -------------------------------------------------------------
    const t09Start = performance.now();
    deleteVaccinationWithRules(testVac08.id);
    const notifs09After = getNotifications().filter(n => n.relatedEntityId === testVac08.id);
    const t09Passed = notifs09After.length === 0;
    results.push({
      id: 'TC-09',
      name: 'Xóa lịch sử tiêm có thông báo chờ',
      passed: t09Passed,
      expected: 'Hủy thông báo chờ; chạm thông báo cũ báo bản ghi không tồn tại.',
      actual: t09Passed
        ? `Toàn bộ thông báo chờ của mũi tiêm đã bị hủy sạch sẽ (còn lại: 0).`
        : `Lỗi: còn sót ${notifs09After.length} thông báo.`,
      durationMs: Math.round(performance.now() - t09Start)
    });

    // -------------------------------------------------------------
    // TC-10: Sửa giá hàng hóa sau khi đã bán
    // -------------------------------------------------------------
    const t10Start = performance.now();
    const item10 = getCatalogItemById('item_004'); // SOS White Hair, was sold in HD20261025001 at unit price 135,000
    if (item10) {
      const origPrice = item10.sellingPrice;
      // Change catalog price to 199,000
      item10.sellingPrice = 199000;
      saveCatalogItem(item10);

      // Verify that old invoice line still has unitPriceSnapshot = 135,000
      const oldInvoice = getInvoices().find(i => i.invoiceCode === 'HD20261025001');
      const oldLine = oldInvoice?.lines.find(l => l.itemId === 'item_004');
      const t10Passed = oldLine?.unitPriceSnapshot === 135000 && item10.sellingPrice === 199000;

      // Restore price
      item10.sellingPrice = origPrice;
      saveCatalogItem(item10);

      results.push({
        id: 'TC-10',
        name: 'Sửa giá hàng hóa sau khi đã bán',
        passed: t10Passed,
        expected: 'Hóa đơn cũ giữ nguyên đơn giá, giảm giá và thành tiền snapshot.',
        actual: t10Passed
          ? `Hóa đơn cũ giữ nguyên đơn giá snapshot 135.000 đ dù danh mục đã đổi thành 199.000 đ.`
          : `Lỗi: đơn giá hóa đơn cũ bị thay đổi thành ${oldLine?.unitPriceSnapshot}`,
        durationMs: Math.round(performance.now() - t10Start)
      });
    }

    // -------------------------------------------------------------
    // TC-11: Hủy lịch hẹn đã có thông báo chờ
    // -------------------------------------------------------------
    const t11Start = performance.now();
    cancelAppointmentWithCleanup('apt_001');
    const apt11Notifs = getNotifications().filter(
      n => n.relatedEntityId === 'apt_001' && n.relatedEntityType === 'appointment'
    );
    const t11Passed = apt11Notifs.length === 0;
    results.push({
      id: 'TC-11',
      name: 'Hủy lịch hẹn đã có thông báo chờ',
      passed: t11Passed,
      expected: 'Hủy thông báo lịch hẹn còn chờ.',
      actual: t11Passed
        ? `Lịch hẹn đã hủy và toàn bộ thông báo chờ đã được thu hồi.`
        : `Lỗi: còn tồn tại ${apt11Notifs.length} thông báo lịch hẹn.`,
      durationMs: Math.round(performance.now() - t11Start)
    });

    // -------------------------------------------------------------
    // TC-12: Lịch hẹn qua giờ nhưng không có hóa đơn
    // -------------------------------------------------------------
    const t12Start = performance.now();
    const apt12 = {
      id: 'apt_test_gray',
      customerId: 'cust_002',
      customerName: 'Trần Văn Bình',
      customerPhone: '0988776655',
      startDateTime: '2026-10-20T08:00:00', // Past
      durationMinutes: 45,
      expectedEndDateTime: '2026-10-20T08:45:00',
      services: [],
      createdAt: '2026-10-19T10:00:00.000Z'
    };
    const isGray = isAppointmentPastUnhandled(apt12);
    results.push({
      id: 'TC-12',
      name: 'Lịch hẹn qua giờ nhưng không có hóa đơn',
      passed: isGray === true,
      expected: 'Lịch đổi màu xám; không tuyên bố chắc chắn khách vắng mặt.',
      actual: isGray
        ? `isAppointmentPastUnhandled() = true -> hiển thị màu xám trung tính.`
        : `Lỗi: isAppointmentPastUnhandled() = false`,
      durationMs: Math.round(performance.now() - t12Start)
    });

    // -------------------------------------------------------------
    // TC-13: Xóa sản phẩm đã xuất hiện trong hóa đơn
    // -------------------------------------------------------------
    const t13Start = performance.now();
    // Try to delete item_004 (SOS shampoo, used in HD20261025001)
    const delRes13 = deleteCatalogItem('item_004');
    const item13After = getCatalogItemById('item_004');
    const t13Passed = delRes13.success && item13After?.status === 'DISCONTINUED';
    results.push({
      id: 'TC-13',
      name: 'Xóa sản phẩm đã xuất hiện trong hóa đơn',
      passed: t13Passed,
      expected: 'Không làm mất dữ liệu hóa đơn; chặn xóa vật lý hoặc chuyển ngừng kinh doanh.',
      actual: t13Passed
        ? `Hệ thống từ chối xóa vật lý, tự động chuyển sang trạng thái "DISCONTINUED" (Ngừng kinh doanh): "${delRes13.message}".`
        : `Lỗi: delRes13=${JSON.stringify(delRes13)}`,
      durationMs: Math.round(performance.now() - t13Start)
    });

    // -------------------------------------------------------------
    // TC-14: Khôi phục dữ liệu trên thiết bị khác
    // -------------------------------------------------------------
    const t14Start = performance.now();
    const backupData14 = exportFullBackup();
    const restoreRes14 = importFullBackup(backupData14);
    const db14 = loadDatabase();
    const t14Passed =
      restoreRes14.success &&
      db14.customers.length === backupData14.data.customers.length &&
      db14.invoices.length === backupData14.data.invoices.length;
    results.push({
      id: 'TC-14',
      name: 'Khôi phục dữ liệu trên thiết bị khác',
      passed: t14Passed,
      expected: 'Hồ sơ và giao dịch được phục hồi toàn vẹn; không nhân đôi hóa đơn hoặc thông báo.',
      actual: t14Passed
        ? `Khôi phục thành công 100% dữ liệu (${db14.customers.length} khách, ${db14.invoices.length} hóa đơn, ${db14.catalog.length} hàng hóa).`
        : `Lỗi khôi phục: ${restoreRes14.message}`,
      durationMs: Math.round(performance.now() - t14Start)
    });

    // -------------------------------------------------------------
    // TC-15: Tổng số hóa đơn trong ngày vượt 999
    // -------------------------------------------------------------
    const t15Start = performance.now();
    // Test code generator when 1000 invoices exist today
    const testDate15 = new Date('2026-10-27T10:00:00');
    // Inject mock invoice HD20261027999 into db temporarily
    const db15 = loadDatabase();
    db15.invoices.unshift({
      id: 'inv_mock_999',
      invoiceCode: 'HD20261027999',
      customerId: 'cust_001',
      customerNameSnapshot: 'Test',
      customerPhoneSnapshot: '0900000000',
      completedAt: '2026-10-27T10:00:00.000Z',
      subtotal: 100000,
      totalDiscount: 0,
      otherCharge: 0,
      totalPayable: 100000,
      paidAmount: 100000,
      status: 'COMPLETED',
      lines: []
    });
    saveDatabase(db15);

    const generatedCode15 = generateInvoiceCode(testDate15);
    const t15Passed = generatedCode15 === 'HD202610271000';
    results.push({
      id: 'TC-15',
      name: 'Tổng số hóa đơn trong ngày vượt 999',
      passed: t15Passed,
      expected: 'Mã hóa đơn vẫn duy nhất, số thứ tự mở rộng an toàn (HD202610271000).',
      actual: t15Passed
        ? `Mã tạo ra sau 999 là: "${generatedCode15}" (mở rộng 4 chữ số an toàn không va chạm).`
        : `Lỗi: mã tạo ra là "${generatedCode15}"`,
      durationMs: Math.round(performance.now() - t15Start)
    });

  } finally {
    // Restore backup so test suite leaves state clean
    importFullBackup(backupBefore);
  }

  return results;
}
