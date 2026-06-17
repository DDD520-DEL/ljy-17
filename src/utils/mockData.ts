import { Ancestor, Ritual, FamilyMember, RitualReservation, FamilyBranch, FamilyEvent, OfferingItem } from '@/types';

const getFutureDate = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

export const mockBranches: FamilyBranch[] = [
  {
    id: 'branch-1',
    name: '长房',
    description: '长子张大山一脉',
    color: '#dc2626',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'branch-2',
    name: '二房',
    description: '次子张三一脉',
    color: '#2563eb',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const mockReservations: RitualReservation[] = [
  {
    id: '1',
    ancestorId: '3',
    ancestorName: '张爷爷',
    date: getFutureDate(5),
    location: '南山陵园A区12号',
    participants: ['张三', '李四', '张小明'],
    offerings: ['水果', '糕点', '白酒', '香烛', '纸钱'],
    notes: '提前准备好供品，通知家属集合时间。',
    status: 'pending',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    ancestorId: '1',
    ancestorName: '张老太爷',
    date: getFutureDate(14),
    location: '家中祠堂',
    participants: ['张大山', '张三', '张大爷', '张小明', '张小红'],
    offerings: ['三牲', '水果', '清茶', '香烛'],
    notes: '家族聚会，安排好食宿。',
    status: 'pending',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    ancestorId: '4',
    ancestorName: '张奶奶',
    date: getFutureDate(30),
    location: '南山陵园A区13号',
    participants: ['张三', '张小红'],
    offerings: ['鲜花', '水果', '糕点'],
    status: 'pending',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const mockAncestors: Ancestor[] = [
  {
    id: '1',
    name: '张老太爷',
    relationship: '曾祖父',
    birthDate: '1920-03-15',
    deathDate: '1995-08-20',
    biography: '勤劳一生，养育五子二女，为人正直善良，深受乡邻敬重。',
    generation: -2,
    photos: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Elderly%20Chinese%20man%20portrait%20from%201980s%20black%20and%20white%20photograph%20formal%20pose&image_size=square',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Vintage%20Chinese%20family%20photo%201970s%20group%20portrait%20sepia%20tones&image_size=landscape_4_3',
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: '张老太君',
    relationship: '曾祖母',
    birthDate: '1922-05-08',
    deathDate: '2000-12-03',
    biography: '贤淑善良，擅长烹饪和针线活，是家中的主心骨。',
    generation: -2,
    photos: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Elderly%20Chinese%20woman%20portrait%20traditional%20dress%201990s%20photograph%20warm%20lighting&image_size=square',
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: '张爷爷',
    relationship: '祖父',
    birthDate: '1945-07-12',
    deathDate: '2020-04-18',
    biography: '退休教师，教书育人四十载，桃李满天下。',
    generation: -1,
    branchId: 'branch-1',
    photos: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20gentleman%20teacher%20portrait%20warm%20smile%202010s%20photograph&image_size=square',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20grandfather%20with%20grandchildren%20park%20scene%20warm%20afternoon&image_size=landscape_4_3',
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: '张奶奶',
    relationship: '祖母',
    birthDate: '1948-11-25',
    deathDate: '2018-09-10',
    biography: '医务工作者，一生救死扶伤，宅心仁厚。',
    generation: -1,
    branchId: 'branch-1',
    photos: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20grandmother%20portrait%20kind%20face%20warm%20lighting%20photograph&image_size=square',
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const mockRituals: Ritual[] = [
  {
    id: '1',
    ancestorId: '3',
    ancestorName: '张爷爷',
    date: '2024-04-04',
    location: '南山陵园A区12号',
    participants: ['张三', '李四', '张小明', '张小红'],
    offerings: ['水果', '糕点', '白酒', '香烛', '纸钱'],
    notes: '清明时节，全家老小一同前往祭扫，天气晴朗。',
    branchId: 'branch-1',
    photos: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20tomb%20sweeping%20day%20ceremony%20family%20gathering%20cemetery%20incense%20offerings&image_size=landscape_4_3',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Qingming%20festival%20family%20offering%20incense%20at%20grave%20cemetery%20flowers&image_size=landscape_16_9',
    ],
    createdAt: '2024-04-04T00:00:00Z',
  },
  {
    id: '2',
    ancestorId: '4',
    ancestorName: '张奶奶',
    date: '2024-09-10',
    location: '南山陵园A区13号',
    participants: ['张三', '张小明'],
    offerings: ['鲜花', '水果', '糕点', '香烛'],
    notes: '忌日祭拜，恰逢教师节，献上鲜花表达怀念。',
    branchId: 'branch-1',
    photos: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20memorial%20ceremony%20fresh%20flowers%20on%20grave%20solemn%20atmosphere&image_size=landscape_4_3',
    ],
    createdAt: '2024-09-10T00:00:00Z',
  },
  {
    id: '3',
    ancestorId: '1',
    ancestorName: '张老太爷',
    date: '2024-08-20',
    location: '南山陵园A区10号',
    participants: ['张三', '李四', '张小明', '张小红', '张大山'],
    offerings: ['三牲', '水果', '白酒', '香烛', '纸钱'],
    notes: '诞辰一百周年纪念，家族团聚，共同缅怀。',
    photos: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20family%20memorial%20ceremony%20large%20gathering%20traditional%20offerings%20incense&image_size=landscape_16_9',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20ancestral%20worship%20ritual%20family%20members%20bowing%20respectful&image_size=landscape_4_3',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Traditional%20Chinese%20memorial%20offerings%20food%20incense%20candles%20altar&image_size=square',
    ],
    createdAt: '2024-08-20T00:00:00Z',
  },
  {
    id: '4',
    ancestorId: '3',
    ancestorName: '张爷爷',
    date: '2025-01-23',
    location: '家中祠堂',
    participants: ['张三', '李四', '张小明'],
    offerings: ['年糕', '糖果', '清茶', '香烛'],
    notes: '小年祭拜，在家中举行简单仪式。',
    branchId: 'branch-1',
    createdAt: '2025-01-23T00:00:00Z',
  },
];

export const mockEvents: FamilyEvent[] = [
  {
    id: 'event-1',
    type: 'wedding',
    title: '张小明与王丽婚礼',
    date: '2025-05-20',
    description: '张小明与王丽喜结连理，在市区大酒店举办婚礼，宴请亲朋好友共15桌。',
    participants: ['张小明', '王丽', '张三', '李四', '张小红', '张大山'],
    location: '城市大酒店 宴会厅A',
    branchId: 'branch-2',
    photos: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20wedding%20ceremony%20bride%20and%20groom%20traditional%20red%20dress%20happy%20celebration&image_size=landscape_4_3',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20wedding%20banquet%20hall%20decorated%20red%20gold%20elegant&image_size=landscape_16_9',
    ],
    createdAt: '2025-05-20T00:00:00Z',
    updatedAt: '2025-05-20T00:00:00Z',
  },
  {
    id: 'event-2',
    type: 'birth',
    title: '张小宝出生',
    date: '2025-10-15',
    description: '张小明之子张小宝出生，重3.6公斤，母子平安。',
    participants: ['张小明', '王丽', '张三', '李四'],
    location: '市妇幼保健院',
    branchId: 'branch-2',
    photos: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Newborn%20baby%20Chinese%20family%20happy%20parents%20holding%20infant%20warm%20lighting&image_size=landscape_4_3',
    ],
    createdAt: '2025-10-15T00:00:00Z',
    updatedAt: '2025-10-15T00:00:00Z',
  },
  {
    id: 'event-3',
    type: 'move',
    title: '张三一家乔迁新居',
    date: '2024-12-28',
    description: '张三一家搬进了位于市中心的新房子，面积180平米，举行了简单的入宅仪式。',
    participants: ['张三', '李四', '张小明', '张小红'],
    location: '阳光花园 3栋 1802',
    branchId: 'branch-2',
    photos: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20family%20moving%20into%20new%20house%20housewarming%20celebration%20traditional%20rituals&image_size=landscape_4_3',
    ],
    createdAt: '2024-12-28T00:00:00Z',
    updatedAt: '2024-12-28T00:00:00Z',
  },
  {
    id: 'event-4',
    type: 'birthday',
    title: '张大山七十大寿',
    date: '2025-04-10',
    description: '大伯张大山七十大寿，全家齐聚一堂祝寿，儿孙满堂，其乐融融。',
    participants: ['张大山', '张三', '李四', '张小明', '张小红', '张大爷'],
    location: '老家大院',
    branchId: 'branch-1',
    photos: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20elderly%2070th%20birthday%20celebration%20family%20gathering%20birthday%20cake%20longevity%20noodles&image_size=landscape_16_9',
    ],
    createdAt: '2025-04-10T00:00:00Z',
    updatedAt: '2025-04-10T00:00:00Z',
  },
  {
    id: 'event-5',
    type: 'graduation',
    title: '张小红大学毕业',
    date: '2024-06-30',
    description: '张小红以优异成绩从名牌大学毕业，获得学士学位，全家为之骄傲。',
    participants: ['张小红', '张三', '李四', '张小明'],
    location: '名牌大学 体育馆',
    branchId: 'branch-2',
    photos: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20university%20graduation%20ceremony%20student%20in%20cap%20and%20gown%20happy%20family&image_size=landscape_4_3',
    ],
    createdAt: '2024-06-30T00:00:00Z',
    updatedAt: '2024-06-30T00:00:00Z',
  },
];

export const mockMembers: FamilyMember[] = [
  {
    id: '1',
    name: '张大山',
    relationship: '大伯',
    birthDate: '1965-04-10',
    generation: 0,
    gender: 'male',
    isAlive: true,
    phone: '13800138001',
    branchId: 'branch-1',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: '张三',
    relationship: '父亲',
    birthDate: '1968-08-15',
    generation: 0,
    gender: 'male',
    isAlive: true,
    phone: '13800138002',
    branchId: 'branch-2',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: '李四',
    relationship: '母亲',
    birthDate: '1970-02-20',
    generation: 0,
    gender: 'female',
    isAlive: true,
    phone: '13800138003',
    spouseId: '2',
    branchId: 'branch-2',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: '张小明',
    relationship: '本人',
    birthDate: '1995-06-30',
    generation: 1,
    parentId: '2',
    gender: 'male',
    isAlive: true,
    phone: '13800138004',
    branchId: 'branch-2',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    name: '张小红',
    relationship: '妹妹',
    birthDate: '1998-11-12',
    generation: 1,
    parentId: '2',
    gender: 'female',
    isAlive: true,
    phone: '13800138005',
    branchId: 'branch-2',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '6',
    name: '张大爷',
    relationship: '叔叔',
    birthDate: '1972-03-05',
    generation: 0,
    gender: 'male',
    isAlive: true,
    phone: '13800138006',
    branchId: 'branch-1',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export const mockOfferings: OfferingItem[] = [
  {
    id: 'offering-1',
    name: '水果',
    category: '食品',
    quantity: 5,
    unit: '份',
    description: '新鲜水果拼盘',
    lowStockThreshold: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'offering-2',
    name: '糕点',
    category: '食品',
    quantity: 3,
    unit: '份',
    description: '传统糕点',
    lowStockThreshold: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'offering-3',
    name: '白酒',
    category: '酒水',
    quantity: 2,
    unit: '瓶',
    description: '白酒一瓶',
    lowStockThreshold: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'offering-4',
    name: '香烛',
    category: '祭祀用品',
    quantity: 10,
    unit: '包',
    description: '香和蜡烛',
    lowStockThreshold: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'offering-5',
    name: '纸钱',
    category: '祭祀用品',
    quantity: 1,
    unit: '袋',
    description: '冥币纸钱',
    lowStockThreshold: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'offering-6',
    name: '三牲',
    category: '食品',
    quantity: 0,
    unit: '套',
    description: '猪肉、鸡肉、鱼肉',
    lowStockThreshold: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'offering-7',
    name: '清茶',
    category: '酒水',
    quantity: 4,
    unit: '杯',
    description: '清茶三杯',
    lowStockThreshold: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'offering-8',
    name: '鲜花',
    category: '其他',
    quantity: 2,
    unit: '束',
    description: '鲜花一束',
    lowStockThreshold: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'offering-9',
    name: '年糕',
    category: '食品',
    quantity: 1,
    unit: '份',
    description: '年糕',
    lowStockThreshold: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'offering-10',
    name: '糖果',
    category: '食品',
    quantity: 3,
    unit: '袋',
    description: '糖果',
    lowStockThreshold: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const initializeMockData = (): void => {
  const existingBranches = localStorage.getItem('family_branches');
  if (!existingBranches || JSON.parse(existingBranches).length === 0) {
    localStorage.setItem('family_branches', JSON.stringify(mockBranches));
  }
  
  const existingAncestors = localStorage.getItem('family_ancestors');
  if (!existingAncestors || JSON.parse(existingAncestors).length === 0) {
    localStorage.setItem('family_ancestors', JSON.stringify(mockAncestors));
  }
  
  const existingRituals = localStorage.getItem('family_rituals');
  if (!existingRituals || JSON.parse(existingRituals).length === 0) {
    localStorage.setItem('family_rituals', JSON.stringify(mockRituals));
  }

  const existingEvents = localStorage.getItem('family_events');
  if (!existingEvents || JSON.parse(existingEvents).length === 0) {
    localStorage.setItem('family_events', JSON.stringify(mockEvents));
  }
  
  const existingReservations = localStorage.getItem('family_reservations');
  if (!existingReservations || JSON.parse(existingReservations).length === 0) {
    localStorage.setItem('family_reservations', JSON.stringify(mockReservations));
  }
  
  const existingMembers = localStorage.getItem('family_members');
  if (!existingMembers || JSON.parse(existingMembers).length === 0) {
    localStorage.setItem('family_members', JSON.stringify(mockMembers));
  }
  
  const existingOfferings = localStorage.getItem('ritual_offerings');
  if (!existingOfferings || JSON.parse(existingOfferings).length === 0) {
    localStorage.setItem('ritual_offerings', JSON.stringify(mockOfferings));
  }
};
