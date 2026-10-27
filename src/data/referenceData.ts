export interface ProvinceInfo {
  name: string;
  wards: string[];
}

export const VIETNAM_PROVINCES: ProvinceInfo[] = [
  {
    name: 'TP. Hồ Chí Minh',
    wards: [
      'Phường Bến Nghé (Quận 1)',
      'Phường Bến Thành (Quận 1)',
      'Phường Đa Kao (Quận 1)',
      'Phường Thảo Điền (TP. Thủ Đức)',
      'Phường An Phú (TP. Thủ Đức)',
      'Phường Tân Phong (Quận 7)',
      'Phường Phú Mỹ (Quận 7)',
      'Phường Võ Thị Sáu (Quận 3)',
      'Phường 2 (Quận Phú Nhuận)',
      'Phường 25 (Quận Bình Thạnh)',
      'Phường 2 (Quận Tân Bình)',
      'Phường 12 (Quận Gò Vấp)'
    ]
  },
  {
    name: 'TP. Hà Nội',
    wards: [
      'Phường Tràng Tiền (Quận Hoàn Kiếm)',
      'Phường Hàng Bạc (Quận Hoàn Kiếm)',
      'Phường Điện Biên (Quận Ba Đình)',
      'Phường Liễu Giai (Quận Ba Đình)',
      'Phường Dịch Vọng (Quận Cầu Giấy)',
      'Phường Trung Hòa (Quận Cầu Giấy)',
      'Phường Mỹ Đình 1 (Quận Nam Từ Liêm)',
      'Phường Quảng An (Quận Tây Hồ)',
      'Phường Bách Khoa (Quận Hai Bà Trưng)',
      'Phường Khương Mai (Quận Thanh Xuân)'
    ]
  },
  {
    name: 'TP. Đà Nẵng',
    wards: [
      'Phường Hải Châu 1 (Quận Hải Châu)',
      'Phường Thạch Thang (Quận Hải Châu)',
      'Phường An Hải Bắc (Quận Sơn Trà)',
      'Phường Mỹ An (Quận Ngũ Hành Sơn)',
      'Phường Hòa Minh (Quận Liên Chiểu)',
      'Phường Khuê Trung (Quận Cẩm Lệ)'
    ]
  },
  {
    name: 'TP. Hải Phòng',
    wards: [
      'Phường Hoàng Văn Thụ (Quận Hồng Bàng)',
      'Phường Lạch Tray (Quận Ngô Quyền)',
      'Phường Đằng Giang (Quận Ngô Quyền)',
      'Phường Đằng Hải (Quận Hải An)',
      'Phường Trần Nguyên Hãn (Quận Lê Chân)'
    ]
  },
  {
    name: 'TP. Cần Thơ',
    wards: [
      'Phường Tân An (Quận Ninh Kiều)',
      'Phường An Cư (Quận Ninh Kiều)',
      'Phường Cái Khế (Quận Ninh Kiều)',
      'Phường Hưng Phú (Quận Cái Răng)',
      'Phường Trà Nóc (Quận Bình Thủy)'
    ]
  },
  {
    name: 'An Giang',
    wards: ['Phường Mỹ Long (TP. Long Xuyên)', 'Phường Mỹ Bình (TP. Long Xuyên)', 'Phường Châu Phú A (TP. Châu Đốc)', 'Thị trấn Núi Sập (Huyện Thoại Sơn)']
  },
  {
    name: 'Bà Rịa - Vũng Tàu',
    wards: ['Phường 1 (TP. Vũng Tàu)', 'Phường Thắng Tam (TP. Vũng Tàu)', 'Phường Phước Trung (TP. Bà Rịa)', 'Thị xã Phú Mỹ']
  },
  {
    name: 'Bắc Giang',
    wards: ['Phường Hoàng Văn Thụ (TP. Bắc Giang)', 'Phường Trần Phú (TP. Bắc Giang)', 'Thị trấn Thắng (Huyện Hiệp Hòa)', 'Thị xã Việt Yên']
  },
  {
    name: 'Bắc Kạn',
    wards: ['Phường Đức Xuân (TP. Bắc Kạn)', 'Phường Sông Cầu (TP. Bắc Kạn)', 'Thị trấn Chợ Rã (Huyện Ba Bể)']
  },
  {
    name: 'Bạc Liêu',
    wards: ['Phường 1 (TP. Bạc Liêu)', 'Phường 3 (TP. Bạc Liêu)', 'Phường 7 (TP. Bạc Liêu)', 'Thị xã Giá Rai']
  },
  {
    name: 'Bắc Ninh',
    wards: ['Phường Suối Hoa (TP. Bắc Ninh)', 'Phường Tiền An (TP. Bắc Ninh)', 'Thị xã Từ Sơn', 'Thị trấn Phố Mới (Quế Võ)']
  },
  {
    name: 'Bến Tre',
    wards: ['Phường An Hội (TP. Bến Tre)', 'Phường Phú Khương (TP. Bến Tre)', 'Thị trấn Ba Tri', 'Thị trấn Bình Đại']
  },
  {
    name: 'Bình Định',
    wards: ['Phường Lê Lợi (TP. Quy Nhơn)', 'Phường Nguyễn Văn Cừ (TP. Quy Nhơn)', 'Thị xã An Nhơn', 'Thị xã Hoài Nhơn']
  },
  {
    name: 'Bình Dương',
    wards: ['Phường Phú Cường (TP. Thủ Dầu Một)', 'Phường Hiệp Thành (TP. Thủ Dầu Một)', 'Phường Lái Thiêu (TP. Thuận An)', 'Phường Dĩ An (TP. Dĩ An)', 'Phường Bến Cát']
  },
  {
    name: 'Bình Phước',
    wards: ['Phường Tân Phú (TP. Đồng Xoài)', 'Phường Tân Đồng (TP. Đồng Xoài)', 'Thị xã Phước Long', 'Thị xã Bình Long']
  },
  {
    name: 'Bình Thuận',
    wards: ['Phường Phú Thủy (TP. Phan Thiết)', 'Phường Mũi Né (TP. Phan Thiết)', 'Thị xã La Gi', 'Thị trấn Phan Rí Cửa']
  },
  {
    name: 'Cà Mau',
    wards: ['Phường 5 (TP. Cà Mau)', 'Phường 2 (TP. Cà Mau)', 'Thị trấn Năm Căn', 'Thị trấn Sông Đốc']
  },
  {
    name: 'Cao Bằng',
    wards: ['Phường Hợp Giang (TP. Cao Bằng)', 'Phường Sông Bằng (TP. Cao Bằng)', 'Thị trấn Trùng Khánh']
  },
  {
    name: 'Đắk Lắk',
    wards: ['Phường Thắng Lợi (TP. Buôn Ma Thuột)', 'Phường Tân Lợi (TP. Buôn Ma Thuột)', 'Thị xã Buôn Hồ', 'Thị trấn Ea Drăng']
  },
  {
    name: 'Đắk Nông',
    wards: ['Phường Nghĩa Đức (TP. Gia Nghĩa)', 'Phường Nghĩa Thành (TP. Gia Nghĩa)', 'Thị trấn Đắk Mil']
  },
  {
    name: 'Điện Biên',
    wards: ['Phường Mường Thanh (TP. Điện Biên Phủ)', 'Phường Thanh Bình (TP. Điện Biên Phủ)', 'Thị xã Mường Lay']
  },
  {
    name: 'Đồng Nai',
    wards: ['Phường Quyết Thắng (TP. Biên Hòa)', 'Phường Trung Dũng (TP. Biên Hòa)', 'Phường Tân Tiến (TP. Biên Hòa)', 'TP. Long Khánh', 'Huyện Trảng Bom']
  },
  {
    name: 'Đồng Tháp',
    wards: ['Phường 1 (TP. Cao Lãnh)', 'Phường Mỹ Phú (TP. Cao Lãnh)', 'TP. Sa Đéc', 'TP. Hồng Ngự']
  },
  {
    name: 'Gia Lai',
    wards: ['Phường Tây Sơn (TP. Pleiku)', 'Phường Hoa Lư (TP. Pleiku)', 'Thị xã An Khê', 'Thị xã Ayun Pa']
  },
  {
    name: 'Hà Giang',
    wards: ['Phường Trần Phú (TP. Hà Giang)', 'Phường Nguyễn Trãi (TP. Hà Giang)', 'Thị trấn Đồng Văn', 'Thị trấn Mèo Vạc']
  },
  {
    name: 'Hà Nam',
    wards: ['Phường Minh Khai (TP. Phủ Lý)', 'Phường Trần Hưng Đạo (TP. Phủ Lý)', 'Thị xã Duy Tiên']
  },
  {
    name: 'Hà Tĩnh',
    wards: ['Phường Bắc Hà (TP. Hà Tĩnh)', 'Phường Nam Hà (TP. Hà Tĩnh)', 'Thị xã Hồng Lĩnh', 'Thị xã Kỳ Anh']
  },
  {
    name: 'Hải Dương',
    wards: ['Phường Trần Phú (TP. Hải Dương)', 'Phường Lê Thanh Nghị (TP. Hải Dương)', 'TP. Chí Linh', 'Thị xã Kinh Môn']
  },
  {
    name: 'Hậu Giang',
    wards: ['Phường 1 (TP. Vị Thanh)', 'Phường 3 (TP. Vị Thanh)', 'TP. Ngã Bảy', 'Thị xã Long Mỹ']
  },
  {
    name: 'Hòa Bình',
    wards: ['Phường Phương Lâm (TP. Hòa Bình)', 'Phường Đồng Tiến (TP. Hòa Bình)', 'Thị trấn Lương Sơn']
  },
  {
    name: 'Hưng Yên',
    wards: ['Phường Lê Lợi (TP. Hưng Yên)', 'Phường Hiến Nam (TP. Hưng Yên)', 'Thị xã Mỹ Hào', 'Huyện Văn Giang']
  },
  {
    name: 'Khánh Hòa',
    wards: ['Phường Lộc Thọ (TP. Nha Trang)', 'Phường Phước Tiến (TP. Nha Trang)', 'TP. Cam Ranh', 'Thị xã Ninh Hòa']
  },
  {
    name: 'Kiên Giang',
    wards: ['Phường Vĩnh Thanh Vân (TP. Rạch Giá)', 'Phường An Hòa (TP. Rạch Giá)', 'TP. Phú Quốc (Dương Đông)', 'TP. Hà Tiên']
  },
  {
    name: 'Kon Tum',
    wards: ['Phường Quyết Thắng (TP. Kon Tum)', 'Phường Quang Trung (TP. Kon Tum)', 'Thị trấn Măng Đen']
  },
  {
    name: 'Lai Châu',
    wards: ['Phường Tân Phong (TP. Lai Châu)', 'Phường Đoàn Kết (TP. Lai Châu)', 'Thị trấn Phong Thổ']
  },
  {
    name: 'Lâm Đồng',
    wards: ['Phường 1 (TP. Đà Lạt)', 'Phường 2 (TP. Đà Lạt)', 'Phường 10 (TP. Đà Lạt)', 'TP. Bảo Lộc', 'Thị trấn Đức Trọng']
  },
  {
    name: 'Lạng Sơn',
    wards: ['Phường Vĩnh Trại (TP. Lạng Sơn)', 'Phường Hoàng Văn Thụ (TP. Lạng Sơn)', 'Thị trấn Đồng Đăng']
  },
  {
    name: 'Lào Cai',
    wards: ['Phường Kim Tân (TP. Lào Cai)', 'Phường Cốc Lếu (TP. Lào Cai)', 'Thị xã Sa Pa']
  },
  {
    name: 'Long An',
    wards: ['Phường 1 (TP. Tân An)', 'Phường 2 (TP. Tân An)', 'Thị xã Kiến Tường', 'Huyện Bến Lức', 'Huyện Đức Hòa']
  },
  {
    name: 'Nam Định',
    wards: ['Phường Vị Xuyên (TP. Nam Định)', 'Phường Năng Tĩnh (TP. Nam Định)', 'Thị trấn Cổ Lễ']
  },
  {
    name: 'Nghệ An',
    wards: ['Phường Quang Trung (TP. Vinh)', 'Phường Trường Thi (TP. Vinh)', 'Thị xã Cửa Lò', 'Thị xã Thái Hòa', 'Thị xã Hoàng Mai']
  },
  {
    name: 'Ninh Bình',
    wards: ['Phường Vân Giang (TP. Ninh Bình)', 'Phường Nam Thành (TP. Ninh Bình)', 'TP. Tam Điệp']
  },
  {
    name: 'Ninh Thuận',
    wards: ['Phường Kinh Dinh (TP. Phan Rang - Tháp Chàm)', 'Phường Thanh Sơn (TP. Phan Rang)', 'Thị trấn Phước Dân']
  },
  {
    name: 'Phú Thọ',
    wards: ['Phường Gia Cẩm (TP. Việt Trì)', 'Phường Tiên Cát (TP. Việt Trì)', 'Thị xã Phú Thọ']
  },
  {
    name: 'Phú Yên',
    wards: ['Phường 1 (TP. Tuy Hòa)', 'Phường 4 (TP. Tuy Hòa)', 'Thị xã Sông Cầu', 'Thị xã Đông Hòa']
  },
  {
    name: 'Quảng Bình',
    wards: ['Phường Đồng Mỹ (TP. Đồng Hới)', 'Phường Hải Đình (TP. Đồng Hới)', 'Thị xã Ba Đồn']
  },
  {
    name: 'Quảng Nam',
    wards: ['Phường Tân Thạnh (TP. Tam Kỳ)', 'Phường Minh An (TP. Hội An)', 'Phường Cẩm Phô (TP. Hội An)', 'Thị xã Điện Bàn']
  },
  {
    name: 'Quảng Ngãi',
    wards: ['Phường Trần Phú (TP. Quảng Ngãi)', 'Phường Lê Hồng Phong (TP. Quảng Ngãi)', 'Thị xã Đức Phổ']
  },
  {
    name: 'Quảng Ninh',
    wards: ['Phường Bãi Cháy (TP. Hạ Long)', 'Phường Hồng Gai (TP. Hạ Long)', 'TP. Cẩm Phả', 'TP. Móng Cái', 'TP. Uông Bí']
  },
  {
    name: 'Quảng Trị',
    wards: ['Phường 1 (TP. Đông Hà)', 'Phường 2 (TP. Đông Hà)', 'Thị xã Quảng Trị']
  },
  {
    name: 'Sóc Trăng',
    wards: ['Phường 1 (TP. Sóc Trăng)', 'Phường 3 (TP. Sóc Trăng)', 'Thị xã Vĩnh Châu', 'Thị xã Ngã Năm']
  },
  {
    name: 'Sơn La',
    wards: ['Phường Quyết Thắng (TP. Sơn La)', 'Phường Tô Hiệu (TP. Sơn La)', 'Thị trấn Mộc Châu']
  },
  {
    name: 'Tây Ninh',
    wards: ['Phường 1 (TP. Tây Ninh)', 'Phường 3 (TP. Tây Ninh)', 'Thị xã Trảng Bàng', 'Thị xã Hòa Thành']
  },
  {
    name: 'Thái Bình',
    wards: ['Phường Lê Hồng Phong (TP. Thái Bình)', 'Phường Bồ Xuyên (TP. Thái Bình)', 'Thị trấn Diêm Điền']
  },
  {
    name: 'Thái Nguyên',
    wards: ['Phường Hoàng Văn Thụ (TP. Thái Nguyên)', 'Phường Phan Đình Phùng (TP. Thái Nguyên)', 'TP. Sông Công', 'TP. Phổ Yên']
  },
  {
    name: 'Thanh Hóa',
    wards: ['Phường Điện Biên (TP. Thanh Hóa)', 'Phường Ba Đình (TP. Thanh Hóa)', 'TP. Sầm Sơn', 'Thị xã Bỉm Sơn', 'Thị xã Nghi Sơn']
  },
  {
    name: 'Thừa Thiên Huế',
    wards: ['Phường Phú Nhuận (TP. Huế)', 'Phường Vĩnh Ninh (TP. Huế)', 'Phường Thuận Thành (TP. Huế)', 'Thị xã Hương Thủy', 'Thị xã Hương Trà']
  },
  {
    name: 'Tiền Giang',
    wards: ['Phường 1 (TP. Mỹ Tho)', 'Phường 4 (TP. Mỹ Tho)', 'Thị xã Gò Công', 'Thị xã Cai Lậy']
  },
  {
    name: 'Trà Vinh',
    wards: ['Phường 1 (TP. Trà Vinh)', 'Phường 3 (TP. Trà Vinh)', 'Thị xã Duyên Hải']
  },
  {
    name: 'Tuyên Quang',
    wards: ['Phường Tân Quang (TP. Tuyên Quang)', 'Phường Phan Thiết (TP. Tuyên Quang)', 'Thị trấn Na Hang']
  },
  {
    name: 'Vĩnh Long',
    wards: ['Phường 1 (TP. Vĩnh Long)', 'Phường 2 (TP. Vĩnh Long)', 'Thị xã Bình Minh']
  },
  {
    name: 'Vĩnh Phúc',
    wards: ['Phường Liên Bảo (TP. Vĩnh Yên)', 'Phường Đống Đa (TP. Vĩnh Yên)', 'TP. Phúc Yên']
  },
  {
    name: 'Yên Bái',
    wards: ['Phường Đồng Tâm (TP. Yên Bái)', 'Phường Yên Ninh (TP. Yên Bái)', 'Thị xã Nghĩa Lộ']
  }
];

export const DOG_BREEDS: string[] = [
  'Poodle (Tiny / Toy / Standard)',
  'Golden Retriever',
  'Corgi (Pembroke / Cardigan)',
  'Phốc Sóc (Pomeranian)',
  'Chó Phốc (Chihuahua)',
  'Shiba Inu',
  'Husky Sibir',
  'Samoyed',
  'Chó Bắc Hà',
  'Chó Phú Quốc',
  'Chó H\'Mông cộc đuôi',
  'Bulldog Pháp',
  'Pug',
  'Chó Ta / Chó cỏ',
  'Labrador Retriever',
  'Border Collie',
  'Chó Lạp Xưởng (Dachshund)',
  'Alaska Malamute',
  'Bichon Frise',
  'Schnauzer',
  'Khác'
];

export const CAT_BREEDS: string[] = [
  'Mèo Anh lông ngắn (British Shorthair)',
  'Mèo Anh lông dài (British Longhair)',
  'Mèo Ba Tư (Persian)',
  'Mèo Mướp (Domestic Shorthair)',
  'Mèo Xiêm (Siamese)',
  'Mèo Ragdoll',
  'Mèo Sphynx (Không lông)',
  'Mèo Tai cụp Scottish Fold',
  'Mèo Bengal',
  'Mèo Nga mắt xanh',
  'Mèo Vàng / Mèo Ta',
  'Mèo Munchkin (Chân ngắn)',
  'Mèo Maine Coon',
  'Khác'
];
