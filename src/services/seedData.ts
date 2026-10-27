import {
  Customer,
  Pet,
  VaccinationRecord,
  CatalogItem,
  Supplier,
  Appointment,
  Invoice,
  StockVoucher,
  UserAccount,
  NotificationItem
} from '../types/petflow';

export const INITIAL_USER_ACCOUNT: UserAccount = {
  id: 'usr_owner_01',
  fullName: 'Nguyễn Minh Quân',
  phoneNumber: '0901234567',
  email: 'admin@petflow.vn',
  address: {
    province: 'TP. Hồ Chí Minh',
    ward: 'Phường Bến Nghé (Quận 1)',
    streetDetail: 'Số 88 Đường Nguyễn Du'
  },
  passwordHash: 'Password@123'
};

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'ncc_001',
    code: 'NCC001',
    name: 'Công ty Cổ phần Thú Y Xanh Việt Nam',
    businessType: 'Công ty',
    phoneNumber: '02838991234',
    email: 'contact@thuyxanh.com.vn',
    taxCode: '0312456789',
    address: {
      province: 'TP. Hồ Chí Minh',
      ward: 'Phường Tân Phong (Quận 7)',
      streetDetail: 'Lô C2, Đường Nguyễn Văn Linh'
    },
    notes: 'Chuyên cung cấp vaccine Vanguard, Rabisin và kim tiêm y tế tiêm chủng.'
  },
  {
    id: 'ncc_002',
    code: 'NCC002',
    name: 'Nhà phân phối Thức ăn Thú cưng MegaPet',
    businessType: 'Công ty',
    phoneNumber: '02437654321',
    email: 'sales@megapet.vn',
    taxCode: '0108976543',
    address: {
      province: 'TP. Hà Nội',
      ward: 'Phường Dịch Vọng (Quận Cầu Giấy)',
      streetDetail: 'Tòa nhà MegaPet, 102 Cầu Giấy'
    },
    notes: 'Phân phối độc quyền Royal Canin, Monge và súp thưởng Ciao Churu.'
  },
  {
    id: 'ncc_003',
    code: 'NCC003',
    name: 'Hộ kinh doanh Phụ kiện Spa Sài Gòn',
    businessType: 'Cá nhân/Hộ kinh doanh',
    phoneNumber: '0933888999',
    email: 'spasaigonpet@gmail.com',
    taxCode: '8392019283',
    address: {
      province: 'TP. Hồ Chí Minh',
      ward: 'Phường 2 (Quận Phú Nhuận)',
      streetDetail: 'Số 45 Đường Phan Xích Long'
    },
    notes: 'Khăn siêu thấm, kéo cắt tỉa và sữa tắm SOS.'
  },
  {
    id: 'ncc_004',
    code: 'NCC004',
    name: 'Công ty TNHH Dược Thú Y Marphavet Miền Nam',
    businessType: 'Công ty',
    phoneNumber: '02743899888',
    email: 'marphavet.south@gmail.com',
    taxCode: '3701239876',
    address: {
      province: 'Bình Dương',
      ward: 'Phường Lái Thiêu (TP. Thuận An)',
      streetDetail: 'Đại lộ Bình Dương, Khu phố Bình Đức'
    },
    notes: 'Thuốc nhỏ gáy trị ve rận Frontline, sữa tắm trị nấm Dermaleen.'
  },
  {
    id: 'ncc_005',
    code: 'NCC005',
    name: 'Đại lý Thức ăn Hạt & Cát Vệ Sinh Hoàng Long',
    businessType: 'Cá nhân/Hộ kinh doanh',
    phoneNumber: '0908765432',
    email: 'hoanglongpet@yahoo.com',
    taxCode: '0309988776',
    address: {
      province: 'TP. Đà Nẵng',
      ward: 'Phường Hải Châu 1 (Quận Hải Châu)',
      streetDetail: 'Số 76 Đường Bạch Đằng'
    },
    notes: 'Cát vệ sinh đậu nành Cature, hạt Catsrang, Me-O.'
  },
  {
    id: 'ncc_006',
    code: 'NCC006',
    name: 'Công ty TNHH Thiết Bị Spa PetCare Hà Nội',
    businessType: 'Công ty',
    phoneNumber: '02439871122',
    email: 'support@petcarehanoi.vn',
    taxCode: '0107765544',
    address: {
      province: 'TP. Hà Nội',
      ward: 'Phường Bách Khoa (Quận Hai Bà Trưng)',
      streetDetail: 'Số 22 Phố Tạ Quang Bửu'
    },
    notes: 'Máy sấy lông chuyên dụng, bàn cắt tỉa thủy lực, kéo cong titan.'
  }
];

export const INITIAL_CATALOG: CatalogItem[] = [
  // --- THỨC ĂN (HÀNG HÓA) ---
  {
    id: 'item_001',
    code: 'SP001',
    name: 'Hạt Royal Canin Mini Adult (Bao 2kg)',
    type: 'GOODS',
    group: 'Thức ăn',
    subType: 'Hạt',
    costPrice: 280000,
    sellingPrice: 390000,
    status: 'ACTIVE',
    supplierId: 'ncc_002',
    expiryDate: '2027-08-15',
    stockQuantity: 14,
    createdAt: '2026-09-01T08:00:00.000Z'
  },
  {
    id: 'item_002',
    code: 'SP002',
    name: 'Pate Monge Monoprotein Vị Cá Hồi (Hộp 400g)',
    type: 'GOODS',
    group: 'Thức ăn',
    subType: 'Pate',
    costPrice: 38000,
    sellingPrice: 65000,
    status: 'ACTIVE',
    supplierId: 'ncc_002',
    expiryDate: '2027-05-20',
    stockQuantity: 4, // Tồn kho thấp (1-5) để kích hoạt cảnh báo
    createdAt: '2026-09-01T08:30:00.000Z'
  },
  {
    id: 'item_003',
    code: 'SP003',
    name: 'Súp thưởng Ciao Churu Gà & Sò Điệp (Gói 4 thanh)',
    type: 'GOODS',
    group: 'Thức ăn',
    subType: 'Súp thưởng',
    costPrice: 24000,
    sellingPrice: 45000,
    status: 'ACTIVE',
    supplierId: 'ncc_002',
    expiryDate: '2026-12-10', // Cận hạn < 3 tháng để kích hoạt cảnh báo HSD
    stockQuantity: 18,
    createdAt: '2026-09-02T09:00:00.000Z'
  },
  {
    id: 'item_010',
    code: 'SP010',
    name: 'Hạt Mèo Catsrang All Stages (Gói 1.5kg)',
    type: 'GOODS',
    group: 'Thức ăn',
    subType: 'Hạt',
    costPrice: 110000,
    sellingPrice: 165000,
    status: 'ACTIVE',
    supplierId: 'ncc_005',
    expiryDate: '2027-10-01',
    stockQuantity: 22,
    createdAt: '2026-09-05T10:00:00.000Z'
  },
  {
    id: 'item_011',
    code: 'SP011',
    name: 'Pate Mèo Whiskas Vị Cá Thu & Cá Hồi (Gói 85g)',
    type: 'GOODS',
    group: 'Thức ăn',
    subType: 'Pate',
    costPrice: 12000,
    sellingPrice: 20000,
    status: 'ACTIVE',
    supplierId: 'ncc_005',
    expiryDate: '2027-06-15',
    stockQuantity: 40,
    createdAt: '2026-09-05T11:00:00.000Z'
  },
  {
    id: 'item_012',
    code: 'SP012',
    name: 'Bánh thưởng xương gặm sạch răng Pedigree Dentastix',
    type: 'GOODS',
    group: 'Thức ăn',
    subType: 'Khác',
    costPrice: 32000,
    sellingPrice: 55000,
    status: 'ACTIVE',
    supplierId: 'ncc_002',
    expiryDate: '2027-09-20',
    stockQuantity: 25,
    createdAt: '2026-09-06T09:30:00.000Z'
  },

  // --- CHĂM SÓC BODY (HÀNG HÓA) ---
  {
    id: 'item_004',
    code: 'SP004',
    name: 'Sữa tắm SOS Special for White Hair 530ml',
    type: 'GOODS',
    group: 'Chăm sóc body',
    subType: 'Sữa tắm/Dầu gội',
    costPrice: 75000,
    sellingPrice: 135000,
    status: 'ACTIVE',
    supplierId: 'ncc_003',
    expiryDate: '2028-01-01',
    stockQuantity: 8,
    createdAt: '2026-09-02T10:00:00.000Z'
  },
  {
    id: 'item_005',
    code: 'SP005',
    name: 'Khăn tắm siêu thấm hút lông thú cưng 66x43cm',
    type: 'GOODS',
    group: 'Chăm sóc body',
    subType: 'Khăn/Tấm lót',
    costPrice: 25000,
    sellingPrice: 60000,
    status: 'ACTIVE',
    supplierId: 'ncc_003',
    expiryDate: '2029-01-01',
    stockQuantity: 20,
    createdAt: '2026-09-03T11:00:00.000Z'
  },
  {
    id: 'item_013',
    code: 'SP013',
    name: 'Lược chải lông nút bấm tự đẩy lông rụng',
    type: 'GOODS',
    group: 'Chăm sóc body',
    subType: 'Bàn chải',
    costPrice: 45000,
    sellingPrice: 90000,
    status: 'ACTIVE',
    supplierId: 'ncc_003',
    expiryDate: '2030-01-01',
    stockQuantity: 15,
    createdAt: '2026-09-07T14:00:00.000Z'
  },
  {
    id: 'item_014',
    code: 'SP014',
    name: 'Nước rửa tai Bioline Ear Care làm sạch ráy tai 50ml',
    type: 'GOODS',
    group: 'Chăm sóc body',
    subType: 'Nước rửa tai',
    costPrice: 35000,
    sellingPrice: 70000,
    status: 'ACTIVE',
    supplierId: 'ncc_004',
    expiryDate: '2027-11-30',
    stockQuantity: 12,
    createdAt: '2026-09-08T08:00:00.000Z'
  },
  {
    id: 'item_015',
    code: 'SP015',
    name: 'Xịt dưỡng lông khử mùi hương nước hoa JoyPet 200ml',
    type: 'GOODS',
    group: 'Chăm sóc body',
    subType: 'Xịt dưỡng',
    costPrice: 60000,
    sellingPrice: 120000,
    status: 'ACTIVE',
    supplierId: 'ncc_003',
    expiryDate: '2028-03-15',
    stockQuantity: 9,
    createdAt: '2026-09-08T15:30:00.000Z'
  },

  // --- TIÊM CHỦNG (VACCINE & VẬT TƯ) ---
  {
    id: 'item_006',
    code: 'SP006',
    name: 'Vaccine phòng Dại Rabisin (Lọ 1 liều)',
    type: 'GOODS',
    group: 'Tiêm chủng',
    subType: 'Vaccine',
    costPrice: 65000,
    sellingPrice: 120000,
    status: 'ACTIVE',
    supplierId: 'ncc_001',
    expiryDate: '2027-04-10',
    stockQuantity: 12,
    createdAt: '2026-09-03T14:00:00.000Z'
  },
  {
    id: 'item_007',
    code: 'SP007',
    name: 'Vaccine 7 bệnh Vanguard Plus 5/L (Lọ 1 liều)',
    type: 'GOODS',
    group: 'Tiêm chủng',
    subType: 'Vaccine',
    costPrice: 180000,
    sellingPrice: 320000,
    status: 'ACTIVE',
    supplierId: 'ncc_001',
    expiryDate: '2027-03-30',
    stockQuantity: 2, // Còn 2 liều để kiểm thử TC-03
    createdAt: '2026-09-04T09:00:00.000Z'
  },
  {
    id: 'item_016',
    code: 'SP016',
    name: 'Vaccine 4 bệnh cho mèo Nobivac Tricat Trio',
    type: 'GOODS',
    group: 'Tiêm chủng',
    subType: 'Vaccine',
    costPrice: 150000,
    sellingPrice: 260000,
    status: 'ACTIVE',
    supplierId: 'ncc_001',
    expiryDate: '2027-05-10',
    stockQuantity: 8,
    createdAt: '2026-09-08T09:00:00.000Z'
  },
  {
    id: 'item_008',
    code: 'SP008',
    name: 'Kim tiêm vô trùng Vinahankook 1ml (Hộp 100 cái)',
    type: 'GOODS',
    group: 'Tiêm chủng',
    subType: 'Kim tiêm',
    costPrice: 45000,
    sellingPrice: 85000,
    status: 'ACTIVE',
    supplierId: 'ncc_001',
    expiryDate: '2028-12-31',
    stockQuantity: 25,
    createdAt: '2026-09-04T10:00:00.000Z'
  },
  {
    id: 'item_009',
    code: 'SP009',
    name: 'Bông gòn y tế tẩm cồn sát trùng Bạch Tuyết',
    type: 'GOODS',
    group: 'Tiêm chủng',
    subType: 'Bông',
    costPrice: 15000,
    sellingPrice: 30000,
    status: 'ACTIVE',
    supplierId: 'ncc_001',
    expiryDate: '2028-06-01',
    stockQuantity: 0, // Hết hàng
    createdAt: '2026-09-04T11:00:00.000Z'
  },

  // --- DỊCH VỤ SPA & TIÊM CHỦNG (KHÔNG CÓ GIÁ VỐN) ---
  {
    id: 'srv_001',
    code: 'DV001',
    name: 'Tắm vệ sinh tiêu chuẩn (Thú cưng < 5kg)',
    type: 'SERVICE',
    group: 'Dịch vụ',
    costPrice: 0, // Dịch vụ không có giá vốn
    sellingPrice: 150000,
    status: 'ACTIVE',
    durationMinutes: 45,
    stockQuantity: 0,
    createdAt: '2026-09-01T08:00:00.000Z'
  },
  {
    id: 'srv_002',
    code: 'DV002',
    name: 'Tắm vệ sinh tiêu chuẩn (Thú cưng 5kg - 10kg)',
    type: 'SERVICE',
    group: 'Dịch vụ',
    costPrice: 0,
    sellingPrice: 220000,
    status: 'ACTIVE',
    durationMinutes: 60,
    stockQuantity: 0,
    createdAt: '2026-09-01T08:00:00.000Z'
  },
  {
    id: 'srv_003',
    code: 'DV003',
    name: 'Cắt tỉa lông tạo hình phong cách Hàn Quốc',
    type: 'SERVICE',
    group: 'Dịch vụ',
    costPrice: 0,
    sellingPrice: 350000,
    status: 'ACTIVE',
    durationMinutes: 90,
    stockQuantity: 0,
    createdAt: '2026-09-01T08:00:00.000Z'
  },
  {
    id: 'srv_004',
    code: 'DV004',
    name: 'Dịch vụ tiêm vaccine & khám tổng quát',
    type: 'SERVICE',
    group: 'Dịch vụ',
    costPrice: 0,
    sellingPrice: 60000,
    status: 'ACTIVE',
    durationMinutes: 20,
    stockQuantity: 0,
    createdAt: '2026-09-01T08:00:00.000Z'
  },
  {
    id: 'srv_005',
    code: 'DV005',
    name: 'Vệ sinh tai, nhổ lông tai & vắt tuyến hôi',
    type: 'SERVICE',
    group: 'Dịch vụ',
    costPrice: 0,
    sellingPrice: 80000,
    status: 'ACTIVE',
    durationMinutes: 30,
    stockQuantity: 0,
    createdAt: '2026-09-01T08:00:00.000Z'
  },
  {
    id: 'srv_006',
    code: 'DV006',
    name: 'Nhuộm lông tai & đuôi thảo mộc organic',
    type: 'SERVICE',
    group: 'Dịch vụ',
    costPrice: 0,
    sellingPrice: 180000,
    status: 'ACTIVE',
    durationMinutes: 45,
    stockQuantity: 0,
    createdAt: '2026-09-02T14:00:00.000Z'
  },
  {
    id: 'srv_007',
    code: 'DV007',
    name: 'Tắm xông hơi trị liệu nấm ngứa & dưỡng da',
    type: 'SERVICE',
    group: 'Dịch vụ',
    costPrice: 0,
    sellingPrice: 250000,
    status: 'ACTIVE',
    durationMinutes: 60,
    stockQuantity: 0,
    createdAt: '2026-09-03T16:00:00.000Z'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust_001',
    code: 'KH001',
    fullName: 'Nguyễn Thị Mai',
    phoneNumber: '0912345678',
    email: 'mainguyen@gmail.com',
    address: {
      province: 'TP. Hồ Chí Minh',
      ward: 'Phường Thảo Điền (TP. Thủ Đức)',
      streetDetail: 'Số 14 Đường Quốc Hương'
    },
    createdAt: '2026-09-10T10:00:00.000Z',
    updatedAt: '2026-09-10T10:00:00.000Z'
  },
  {
    id: 'cust_002',
    code: 'KH002',
    fullName: 'Trần Văn Bình',
    phoneNumber: '0988776655',
    email: 'binhtran.arch@gmail.com',
    address: {
      province: 'TP. Hồ Chí Minh',
      ward: 'Phường Bến Thành (Quận 1)',
      streetDetail: '128 Lê Lai'
    },
    createdAt: '2026-09-12T14:20:00.000Z',
    updatedAt: '2026-09-12T14:20:00.000Z'
  },
  {
    id: 'cust_003',
    code: 'KH003',
    fullName: 'Lê Hoàng Yến',
    phoneNumber: '0903112233',
    email: 'yenle.design@gmail.com',
    address: {
      province: 'TP. Hồ Chí Minh',
      ward: 'Phường Tân Phong (Quận 7)',
      streetDetail: 'Khu đô thị Phú Mỹ Hưng, Đường Tôn Dật Tiên'
    },
    createdAt: '2026-09-15T09:15:00.000Z',
    updatedAt: '2026-09-15T09:15:00.000Z'
  },
  {
    id: 'cust_004',
    code: 'KH004',
    fullName: 'Phạm Quốc Dũng',
    phoneNumber: '0977223344',
    email: 'quocdung.pham@yahoo.com',
    address: {
      province: 'TP. Hồ Chí Minh',
      ward: 'Phường 25 (Quận Bình Thạnh)',
      streetDetail: 'Số 32 Điện Biên Phủ'
    },
    createdAt: '2026-10-01T11:00:00.000Z',
    updatedAt: '2026-10-01T11:00:00.000Z'
  },
  {
    id: 'cust_005',
    code: 'KH005',
    fullName: 'Hoàng Kim Chi',
    phoneNumber: '0938445566',
    email: 'kimchi.hoang@outlook.com',
    address: {
      province: 'TP. Hồ Chí Minh',
      ward: 'Phường 1 (Quận 3)',
      streetDetail: 'Số 15 Lý Chính Thắng'
    },
    createdAt: '2026-10-05T16:30:00.000Z',
    updatedAt: '2026-10-05T16:30:00.000Z'
  },
  {
    id: 'cust_006',
    code: 'KH006',
    fullName: 'Đỗ Anh Tuấn',
    phoneNumber: '0909654321',
    email: 'tuan.do@gmail.com',
    address: {
      province: 'TP. Hà Nội',
      ward: 'Phường Hàng Bạc (Quận Hoàn Kiếm)',
      streetDetail: 'Số 42 Phố Hàng Bạc'
    },
    createdAt: '2026-10-10T08:30:00.000Z',
    updatedAt: '2026-10-10T08:30:00.000Z'
  },
  {
    id: 'cust_007',
    code: 'KH007',
    fullName: 'Vũ Thu Thảo',
    phoneNumber: '0945112299',
    email: 'thuthao.vu@gmail.com',
    address: {
      province: 'TP. Đà Nẵng',
      ward: 'Phường An Hải Bắc (Quận Sơn Trà)',
      streetDetail: 'Số 88 Đường Võ Nguyên Giáp'
    },
    createdAt: '2026-10-12T14:00:00.000Z',
    updatedAt: '2026-10-12T14:00:00.000Z'
  },
  {
    id: 'cust_008',
    code: 'KH008',
    fullName: 'Ngô Thanh Vân',
    phoneNumber: '0918889900',
    email: 'van.ngo@hotmail.com',
    address: {
      province: 'Bình Dương',
      ward: 'Phường Phú Cường (TP. Thủ Dầu Một)',
      streetDetail: 'Số 20 Đường Yersin'
    },
    createdAt: '2026-10-15T09:40:00.000Z',
    updatedAt: '2026-10-15T09:40:00.000Z'
  },
  {
    id: 'cust_009',
    code: 'KH009',
    fullName: 'Bùi Hải Đăng',
    phoneNumber: '0937123987',
    email: 'haidang.bui@gmail.com',
    address: {
      province: 'TP. Hồ Chí Minh',
      ward: 'Phường 2 (Quận Tân Bình)',
      streetDetail: 'Số 10 Phổ Quang'
    },
    createdAt: '2026-10-18T11:15:00.000Z',
    updatedAt: '2026-10-18T11:15:00.000Z'
  },
  {
    id: 'cust_010',
    code: 'KH010',
    fullName: 'Lâm Gia Hân',
    phoneNumber: '0981992288',
    email: 'giahan.lam@gmail.com',
    address: {
      province: 'TP. Cần Thơ',
      ward: 'Phường Tân An (Quận Ninh Kiều)',
      streetDetail: 'Số 65 Đại lộ Hòa Bình'
    },
    createdAt: '2026-10-20T15:00:00.000Z',
    updatedAt: '2026-10-20T15:00:00.000Z'
  }
];

export const INITIAL_PETS: Pet[] = [
  {
    id: 'pet_001',
    customerId: 'cust_001',
    species: 'Chó',
    name: 'Mochi',
    breed: 'Poodle (Tiny / Toy / Standard)',
    gender: 'Đực',
    neutered: 'Đã triệt sản',
    weightKg: 3.8,
    dob: '2024-03-15',
    identificationNotes: 'Đốm trắng nhỏ ở ngực, lông xoăn màu nâu đỏ',
    color: 'Nâu đỏ (Red Apricot)',
    photoUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&q=80',
    createdAt: '2026-09-10T10:05:00.000Z'
  },
  {
    id: 'pet_002',
    customerId: 'cust_001',
    species: 'Mèo',
    name: 'Bông Gòn',
    breed: 'Mèo Anh lông ngắn (British Shorthair)',
    gender: 'Cái',
    neutered: 'Chưa triệt sản',
    weightKg: 4.2,
    dob: '2024-11-20',
    identificationNotes: 'Mắt màu hổ phách, má phúng phính tròn',
    color: 'Xám xanh (Blue)',
    photoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80',
    createdAt: '2026-09-10T10:10:00.000Z'
  },
  {
    id: 'pet_003',
    customerId: 'cust_002',
    species: 'Chó',
    name: 'Bơ (Butter)',
    breed: 'Corgi (Pembroke / Cardigan)',
    gender: 'Đực',
    neutered: 'Đã triệt sản',
    weightKg: 11.5,
    dob: '2023-08-01',
    identificationNotes: 'Tai dựng đứng, mông trái tim đặc trưng',
    color: 'Vàng trắng',
    photoUrl: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=400&q=80',
    createdAt: '2026-09-12T14:25:00.000Z'
  },
  {
    id: 'pet_004',
    customerId: 'cust_003',
    species: 'Mèo',
    name: 'Luna',
    breed: 'Mèo Ba Tư (Persian)',
    gender: 'Cái',
    neutered: 'Đã triệt sản',
    weightKg: 3.5,
    dob: '2023-12-05',
    identificationNotes: 'Mặt tịt, lông dài trắng tuyết dày',
    color: 'Trắng tinh',
    photoUrl: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=400&q=80',
    createdAt: '2026-09-15T09:20:00.000Z'
  },
  {
    id: 'pet_005',
    customerId: 'cust_004',
    species: 'Chó',
    name: 'Lucky',
    breed: 'Golden Retriever',
    gender: 'Đực',
    neutered: 'Chưa triệt sản',
    weightKg: 28.5,
    dob: '2023-05-10',
    identificationNotes: 'Rất thân thiện, đuôi cong xù lông',
    color: 'Vàng kim (Golden)',
    photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&q=80',
    createdAt: '2026-10-01T11:05:00.000Z'
  },
  {
    id: 'pet_006',
    customerId: 'cust_005',
    species: 'Chó',
    name: 'Ken',
    breed: 'Phốc Sóc (Pomeranian)',
    gender: 'Đực',
    neutered: 'Đã triệt sản',
    weightKg: 2.9,
    dob: '2024-06-18',
    identificationNotes: 'Mặt cáo, lông xù phồng như cục bông',
    color: 'Trắng kem',
    photoUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80',
    createdAt: '2026-10-05T16:35:00.000Z'
  },
  {
    id: 'pet_007',
    customerId: 'cust_006',
    species: 'Chó',
    name: 'Taro',
    breed: 'Shiba Inu',
    gender: 'Đực',
    neutered: 'Đã triệt sản',
    weightKg: 9.8,
    dob: '2024-02-14',
    identificationNotes: 'Mặt cười, đuôi cuộn tròn trên lưng',
    color: 'Vàng đỏ (Red)',
    photoUrl: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=400&q=80',
    createdAt: '2026-10-10T08:35:00.000Z'
  },
  {
    id: 'pet_008',
    customerId: 'cust_007',
    species: 'Mèo',
    name: 'Miu Miu',
    breed: 'Mèo Tai cụp Scottish Fold',
    gender: 'Cái',
    neutered: 'Đã triệt sản',
    weightKg: 3.9,
    dob: '2024-04-20',
    identificationNotes: 'Hai tai cụp sát đầu, mắt to tròn xoe',
    color: 'Xám khói Bicolor',
    photoUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=80',
    createdAt: '2026-10-12T14:10:00.000Z'
  },
  {
    id: 'pet_009',
    customerId: 'cust_008',
    species: 'Chó',
    name: 'Bi',
    breed: 'Bulldog Pháp',
    gender: 'Đực',
    neutered: 'Chưa triệt sản',
    weightKg: 12.0,
    dob: '2023-11-11',
    identificationNotes: 'Tai dơi lớn, ngực nở cơ bắp',
    color: 'Vện đen (Brindle)',
    photoUrl: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=400&q=80',
    createdAt: '2026-10-15T09:45:00.000Z'
  },
  {
    id: 'pet_010',
    customerId: 'cust_009',
    species: 'Mèo',
    name: 'Sữa',
    breed: 'Mèo Ragdoll',
    gender: 'Cái',
    neutered: 'Đã triệt sản',
    weightKg: 4.8,
    dob: '2024-01-08',
    identificationNotes: 'Mắt xanh dương ngọc bích, lông dài mềm như tơ',
    color: 'Blue Point',
    photoUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&q=80',
    createdAt: '2026-10-18T11:20:00.000Z'
  },
  {
    id: 'pet_011',
    customerId: 'cust_010',
    species: 'Chó',
    name: 'Simba',
    breed: 'Samoyed',
    gender: 'Đực',
    neutered: 'Chưa triệt sản',
    weightKg: 22.0,
    dob: '2023-09-09',
    identificationNotes: 'Nụ cười Samoyed đặc trưng, lông trắng dày',
    color: 'Trắng tuyết',
    photoUrl: 'https://images.unsplash.com/photo-1529429617124-95b109e86bb8?w=400&q=80',
    createdAt: '2026-10-20T15:05:00.000Z'
  }
];

export const INITIAL_VACCINATIONS: VaccinationRecord[] = [
  {
    id: 'vac_001',
    petId: 'pet_001', // Poodle Mochi
    vaccineType: 'Vaccine 7 bệnh Vanguard Plus 5/L',
    vaccinationDate: '2026-04-10',
    validityYears: 1,
    certificatePhotoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80',
    notes: 'Đã tiêm phòng định kỳ hàng năm, phản ứng sau tiêm bình thường.',
    nextDueDate: '2027-04-10',
    createdAt: '2026-04-10T09:30:00.000Z',
    updatedAt: '2026-04-10T09:30:00.000Z'
  },
  {
    id: 'vac_002',
    petId: 'pet_001',
    vaccineType: 'Vaccine phòng Dại Rabisin',
    vaccinationDate: '2026-05-15',
    validityYears: 1,
    certificatePhotoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
    notes: 'Tiêm ngừa dại theo khuyến cáo thú y.',
    nextDueDate: '2027-05-15',
    createdAt: '2026-05-15T10:00:00.000Z',
    updatedAt: '2026-05-15T10:00:00.000Z'
  },
  {
    id: 'vac_003',
    petId: 'pet_003', // Corgi Bơ
    vaccineType: 'Vaccine phòng Dại Rabisin',
    vaccinationDate: '2025-09-01',
    validityYears: 1,
    certificatePhotoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
    notes: 'Mũi dại năm trước.',
    nextDueDate: '2026-09-01', // Đã quá hạn! (Để kiểm thử cảnh báo quá hạn)
    createdAt: '2025-09-01T15:00:00.000Z',
    updatedAt: '2025-09-01T15:00:00.000Z'
  },
  {
    id: 'vac_004',
    petId: 'pet_004', // Mèo Luna
    vaccineType: 'Vaccine 4 bệnh cho mèo Nobivac Tricat',
    vaccinationDate: '2026-08-20',
    validityYears: 1,
    certificatePhotoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80',
    notes: 'Không nhập ngày tiêm tiếp theo để kiểm thử TC-06.',
    createdAt: '2026-08-20T11:00:00.000Z',
    updatedAt: '2026-08-20T11:00:00.000Z'
  },
  {
    id: 'vac_005',
    petId: 'pet_005', // Golden Lucky
    vaccineType: 'Vaccine 7 bệnh Vanguard Plus 5/L',
    vaccinationDate: '2026-03-01',
    validityYears: 1,
    certificatePhotoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80',
    notes: 'Sức khỏe tốt, tiêm nhắc lại năm 2027.',
    nextDueDate: '2027-03-01',
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-03-01T08:00:00.000Z'
  },
  {
    id: 'vac_006',
    petId: 'pet_007', // Shiba Taro
    vaccineType: 'Vaccine phòng Dại Rabisin',
    vaccinationDate: '2026-06-18',
    validityYears: 1,
    certificatePhotoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80',
    notes: 'Tiêm phòng dại đầy đủ.',
    nextDueDate: '2027-06-18',
    createdAt: '2026-06-18T14:00:00.000Z',
    updatedAt: '2026-06-18T14:00:00.000Z'
  }
];

// Helper to format ISO date using local components
export const getLocalDateString = (offsetDays = 0, hour = 9, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, minute, 0, 0);
  const yyyy = d.getFullYear();
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  const dd = d.getDate().toString().padStart(2, '0');
  const hh = d.getHours().toString().padStart(2, '0');
  const min = d.getMinutes().toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt_001',
    customerId: 'cust_001',
    customerName: 'Nguyễn Thị Mai',
    customerPhone: '0912345678',
    startDateTime: getLocalDateString(0, 10, 30),
    durationMinutes: 45,
    expectedEndDateTime: getLocalDateString(0, 11, 15),
    services: [
      {
        serviceId: 'srv_001',
        serviceName: 'Tắm vệ sinh tiêu chuẩn (Thú cưng < 5kg)',
        durationMinutes: 45,
        price: 150000,
        quantity: 1
      }
    ],
    notes: 'Bé Mochi da nhạy cảm, dùng sữa tắm dịu nhẹ.',
    createdAt: '2026-10-25T08:00:00.000Z'
  },
  {
    id: 'apt_002',
    customerId: 'cust_003',
    customerName: 'Lê Hoàng Yến',
    customerPhone: '0903112233',
    startDateTime: getLocalDateString(0, 14, 0),
    durationMinutes: 90,
    expectedEndDateTime: getLocalDateString(0, 15, 30),
    services: [
      {
        serviceId: 'srv_003',
        serviceName: 'Cắt tỉa lông tạo hình phong cách Hàn Quốc',
        durationMinutes: 90,
        price: 350000,
        quantity: 1
      }
    ],
    notes: 'Cắt ngắn gọn phần chân và tạo hình mặt gấu.',
    createdAt: '2026-10-25T14:30:00.000Z'
  },
  {
    id: 'apt_003_past_unhandled',
    customerId: 'cust_002',
    customerName: 'Trần Văn Bình',
    customerPhone: '0988776655',
    startDateTime: getLocalDateString(-1, 9, 0),
    durationMinutes: 60,
    expectedEndDateTime: getLocalDateString(-1, 10, 0),
    services: [
      {
        serviceId: 'srv_002',
        serviceName: 'Tắm vệ sinh tiêu chuẩn (Thú cưng 5kg - 10kg)',
        durationMinutes: 60,
        price: 220000,
        quantity: 1
      }
    ],
    notes: 'Lịch hẹn quá giờ chưa có hóa đơn (hiển thị màu xám).',
    createdAt: '2026-10-24T10:00:00.000Z'
  },
  {
    id: 'apt_004',
    customerId: 'cust_004',
    customerName: 'Phạm Quốc Dũng',
    customerPhone: '0977223344',
    startDateTime: getLocalDateString(1, 9, 30),
    durationMinutes: 65,
    expectedEndDateTime: getLocalDateString(1, 10, 35),
    services: [
      {
        serviceId: 'srv_002',
        serviceName: 'Tắm vệ sinh tiêu chuẩn (Thú cưng 5kg - 10kg)',
        durationMinutes: 60,
        price: 220000,
        quantity: 1
      }
    ],
    notes: 'Bé Golden Lucky rất nghịch, cần giữ nhẹ nhàng.',
    createdAt: '2026-10-25T16:00:00.000Z'
  },
  {
    id: 'apt_005',
    customerId: 'cust_007',
    customerName: 'Vũ Thu Thảo',
    customerPhone: '0945112299',
    startDateTime: getLocalDateString(2, 15, 30),
    durationMinutes: 65,
    expectedEndDateTime: getLocalDateString(2, 16, 35), // 15:30 + 65 min = 16:35 local!
    services: [
      {
        serviceId: 'srv_004',
        serviceName: 'Dịch vụ tiêm vaccine & khám tổng quát',
        durationMinutes: 20,
        price: 60000,
        quantity: 1
      },
      {
        serviceId: 'srv_001',
        serviceName: 'Tắm vệ sinh tiêu chuẩn (Thú cưng < 5kg)',
        durationMinutes: 45,
        price: 150000,
        quantity: 1
      }
    ],
    notes: 'Tiêm phòng định kỳ và spa tắm thơm.',
    createdAt: '2026-10-26T10:00:00.000Z'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv_001',
    invoiceCode: 'HD20261025001',
    customerId: 'cust_002',
    customerNameSnapshot: 'Trần Văn Bình',
    customerPhoneSnapshot: '0988776655',
    completedAt: '2026-10-25T11:30:00.000Z',
    subtotal: 455000,
    totalDiscount: 20000,
    otherCharge: 0,
    totalPayable: 435000,
    paidAmount: 435000,
    status: 'COMPLETED',
    lines: [
      {
        id: 'line_001',
        itemId: 'srv_002',
        itemNameSnapshot: 'Tắm vệ sinh tiêu chuẩn (Thú cưng 5kg - 10kg)',
        itemTypeSnapshot: 'SERVICE',
        quantity: 1,
        unitPriceSnapshot: 220000,
        discount: 20000,
        lineTotal: 200000,
        costPriceSnapshot: 0
      },
      {
        id: 'line_002',
        itemId: 'item_004',
        itemNameSnapshot: 'Sữa tắm SOS Special for White Hair 530ml',
        itemTypeSnapshot: 'GOODS',
        quantity: 1,
        unitPriceSnapshot: 135000,
        discount: 0,
        lineTotal: 135000,
        costPriceSnapshot: 75000
      },
      {
        id: 'line_003',
        itemId: 'item_006',
        itemNameSnapshot: 'Vaccine phòng Dại Rabisin (Lọ 1 liều)',
        itemTypeSnapshot: 'VACCINE_PRODUCT',
        quantity: 1,
        unitPriceSnapshot: 120000,
        discount: 0,
        lineTotal: 120000,
        costPriceSnapshot: 65000
      }
    ]
  },
  {
    id: 'inv_002',
    invoiceCode: 'HD20261026001',
    customerId: 'cust_004',
    customerNameSnapshot: 'Phạm Quốc Dũng',
    customerPhoneSnapshot: '0977223344',
    completedAt: '2026-10-26T15:45:00.000Z',
    subtotal: 430000,
    totalDiscount: 0,
    otherCharge: 20000,
    totalPayable: 450000,
    paidAmount: 450000,
    status: 'COMPLETED',
    lines: [
      {
        id: 'line_004',
        itemId: 'srv_003',
        itemNameSnapshot: 'Cắt tỉa lông tạo hình phong cách Hàn Quốc',
        itemTypeSnapshot: 'SERVICE',
        quantity: 1,
        unitPriceSnapshot: 350000,
        discount: 0,
        lineTotal: 350000,
        costPriceSnapshot: 0
      },
      {
        id: 'line_005',
        itemId: 'srv_005',
        itemNameSnapshot: 'Vệ sinh tai, nhổ lông tai & vắt tuyến hôi',
        itemTypeSnapshot: 'SERVICE',
        quantity: 1,
        unitPriceSnapshot: 80000,
        discount: 0,
        lineTotal: 80000,
        costPriceSnapshot: 0
      }
    ]
  },
  {
    id: 'inv_003',
    invoiceCode: 'HD20261026002',
    customerId: 'retail_walkin',
    customerNameSnapshot: 'Khách lẻ',
    customerPhoneSnapshot: '---',
    isRetailCustomer: true,
    completedAt: '2026-10-26T17:10:00.000Z',
    subtotal: 390000,
    totalDiscount: 10000,
    otherCharge: 0,
    totalPayable: 380000,
    paidAmount: 380000,
    status: 'COMPLETED',
    lines: [
      {
        id: 'line_006',
        itemId: 'item_001',
        itemNameSnapshot: 'Hạt Royal Canin Mini Adult (Bao 2kg)',
        itemTypeSnapshot: 'GOODS',
        quantity: 1,
        unitPriceSnapshot: 390000,
        discount: 10000,
        lineTotal: 380000,
        costPriceSnapshot: 280000
      }
    ]
  }
];

export const INITIAL_STOCK_VOUCHERS: StockVoucher[] = [
  {
    id: 'vch_001',
    voucherCode: 'PN20260901001',
    type: 'IMPORT',
    timestamp: '2026-09-01T08:00:00.000Z',
    itemId: 'item_001',
    itemName: 'Hạt Royal Canin Mini Adult (Bao 2kg)',
    quantity: 15,
    previousStock: 0,
    newStock: 15,
    notes: 'Nhập hàng đầu kỳ từ MegaPet'
  },
  {
    id: 'vch_002',
    voucherCode: 'PX20261025001',
    type: 'EXPORT',
    timestamp: '2026-10-25T11:30:00.000Z',
    itemId: 'item_004',
    itemName: 'Sữa tắm SOS Special for White Hair 530ml',
    quantity: 1,
    previousStock: 9,
    newStock: 8,
    notes: 'Xuất kho tự động theo hóa đơn HD20261025001'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_001',
    type: 'STOCK_LOW',
    category: 'Tồn kho',
    relatedEntityId: 'item_002',
    relatedEntityType: 'catalog',
    title: 'Cảnh báo sắp hết hàng',
    body: 'Sản phẩm "Pate Monge Vị Cá Hồi (Hộp 400g)" chỉ còn 4 hộp trong kho. Hãy lên kế hoạch nhập hàng.',
    createdAt: '2026-10-25T16:00:00.000Z',
    deduplicationKey: 'stock_low_item_002'
  },
  {
    id: 'notif_002',
    type: 'VACCINE_OVERDUE',
    category: 'Tiêm phòng',
    relatedEntityId: 'vac_003',
    relatedEntityType: 'vaccine',
    title: 'Nhắc lịch tiêm quá hạn',
    body: 'Bé Bơ (khách Trần Văn Bình) đã quá hạn tiêm "Vaccine phòng Dại Rabisin" vào ngày 01/09/2026. Hãy liên hệ khách hàng.',
    createdAt: '2026-10-26T08:00:00.000Z',
    deduplicationKey: 'vaccine_overdue_vac_003'
  },
  {
    id: 'notif_003',
    type: 'EXPIRY_ALERT',
    category: 'Tồn kho',
    relatedEntityId: 'item_003',
    relatedEntityType: 'catalog',
    title: 'Hàng hóa sắp hết hạn sử dụng',
    body: 'Hàng hóa "Súp thưởng Ciao Churu Gà & Sò Điệp" sắp hết hạn sử dụng vào ngày 10/12/2026. Hãy kiểm tra và đưa ra biện pháp xử lý phù hợp.',
    createdAt: '2026-10-26T09:00:00.000Z',
    deduplicationKey: 'expiry_alert_item_003'
  }
];
