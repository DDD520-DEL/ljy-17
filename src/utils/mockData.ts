import { Ancestor, Ritual, FamilyMember, RitualReservation, FamilyBranch, FamilyEvent, OfferingItem, FamilyRule, MemorialArticle, OfferingWiki } from '@/types';

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

export const mockRules: FamilyRule[] = [
  {
    id: 'rule-1',
    title: '孝悌为先',
    content: '百善孝为先，子孙须敬重长辈，孝顺父母，友爱兄弟姊妹。每日晨起问安，遇事禀明而行。兄友弟恭，妯娌和睦，以立齐家之本。',
    sourceAncestor: '张老太爷',
    sortOrder: 0,
    branchId: 'branch-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rule-2',
    title: '勤俭持家',
    content: '一粥一饭，当思来处不易；半丝半缕，恒念物力维艰。宜未雨而绸缪，毋临渴而掘井。自奉必须俭约，宴客切勿流连。',
    sourceAncestor: '张老太爷',
    sortOrder: 1,
    branchId: 'branch-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rule-3',
    title: '读书明理',
    content: '子孙须立志读书，非徒科第，实为明理。四书五经，悉心研读；圣贤教诲，铭记于心。知书达理，方能立身处世，不负先人所望。',
    sourceAncestor: '张爷爷',
    sortOrder: 2,
    branchId: 'branch-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rule-4',
    title: '诚信待人',
    content: '言必信，行必果。与人交往，以诚相待，不可有欺诈之心。一诺千金，言出必行。宁可人负我，不可我负人。',
    sourceAncestor: '张老太爷',
    sortOrder: 3,
    branchId: 'branch-2',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rule-5',
    title: '睦邻亲友',
    content: '远亲不如近邻，邻里之间须和睦相处。遇有纷争，以忍为高；见人有难，倾力相助。宗族亲眷，时相往来，共庆佳节，同悼哀思。',
    sourceAncestor: '张老太君',
    sortOrder: 4,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rule-6',
    title: '祭祀诚敬',
    content: '祖宗虽远，祭祀不可不诚。每逢忌日、清明、中元、春节，须备香烛祭品，虔诚祭拜。追思先人恩德，传承家族文脉，使后世子孙不忘根本。',
    sourceAncestor: '张老太爷',
    sortOrder: 5,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const mockArticles: MemorialArticle[] = [
  {
    id: 'article-1',
    ancestorId: '3',
    ancestorName: '张爷爷',
    title: '清明祭扫忆祖父',
    content: '又是一年清明时，细雨纷飞，思绪万千。站在爷爷的墓前，往事如潮水般涌上心头。\n\n爷爷是一位退休教师，教书育人四十载，桃李满天下。记得小时候，爷爷总是拿着那本泛黄的《论语》，教我读"学而时习之，不亦说乎"。他的声音温和而坚定，每一个字都饱含着对知识的敬畏。\n\n爷爷常说："读书人，要明理，要正直。"这句话我一直铭记在心。如今我也走上了工作岗位，每当遇到困难和诱惑时，爷爷的话就会在耳边响起，让我坚守本心。\n\n爷爷虽然离开了我们，但他的教诲永远留在我们心中。今天献上一束鲜花，寄托我们无尽的思念。愿爷爷在天堂安息，您的子孙永远怀念您。',
    date: '2024-04-04',
    author: '张小明',
    branchId: 'branch-1',
    createdAt: '2024-04-04T10:30:00Z',
    updatedAt: '2024-04-04T10:30:00Z',
  },
  {
    id: 'article-2',
    ancestorId: '3',
    ancestorName: '张爷爷',
    title: '爷爷的老花镜',
    content: '整理旧物时，发现了爷爷的那副老花镜。镜框已经有些磨损，镜片也有细微的划痕，但擦拭干净后，依然能看清字。\n\n这副老花镜陪伴了爷爷几十年。每天晚上，爷爷都会戴着它，在昏黄的灯光下批改学生的作业，或者阅读他喜爱的古典文学。有时候我半夜醒来，还能看到书房的灯亮着，爷爷戴着这副眼镜，专注地写着什么。\n\n记得有一次，我不小心把这副眼镜碰到地上，镜框摔歪了。爷爷没有责备我，只是笑着说："没事，修修还能用。"后来他自己用小螺丝刀 carefully 地把镜框修好了，又戴了很多年。\n\n如今，这副老花镜静静地躺在我的书柜里。每当看到它，就仿佛看到爷爷戴着它伏案工作的身影。爷爷虽然离开了，但他对知识的热爱、对工作的认真，永远激励着我前行。',
    date: '2024-09-10',
    author: '张三',
    branchId: 'branch-1',
    createdAt: '2024-09-10T15:20:00Z',
    updatedAt: '2024-09-10T15:20:00Z',
  },
  {
    id: 'article-3',
    ancestorId: '4',
    ancestorName: '张奶奶',
    title: '奶奶的红烧肉',
    content: '今天试着做了奶奶教我的红烧肉，虽然味道已经很接近了，但总觉得还是少了点什么。\n\n奶奶做的红烧肉，是我童年最美好的回忆之一。每逢过节，奶奶都会早早地开始准备。她选的五花肉，总是肥瘦相间，层次分明。先用开水焯过，再用冰糖炒出糖色，然后加入各种调料，小火慢炖几个小时。\n\n炖肉的香味，会飘满整个屋子。我和弟弟妹妹总是守在厨房门口，不停地问："奶奶，肉好了吗？"奶奶总是笑着说："快了快了，小馋猫们再等等。"\n\n肉炖好后，奶奶会先盛出一碗，让我们几个孩子先吃。那肥肉入口即化，瘦肉软烂入味，甜咸适中，回味无穷。奶奶总是看着我们吃，脸上洋溢着满足的笑容，自己却很少吃。\n\n如今，奶奶已经离开了我们，但她做的红烧肉的味道，永远留在了我的记忆里。今天做这道菜，也是为了纪念奶奶，让她的味道，在我们心中延续。奶奶，我们永远想念您。',
    date: '2024-10-15',
    author: '张小红',
    branchId: 'branch-1',
    createdAt: '2024-10-15T12:00:00Z',
    updatedAt: '2024-10-15T12:00:00Z',
  },
  {
    id: 'article-4',
    ancestorId: '1',
    ancestorName: '张老太爷',
    title: '百年诞辰忆曾祖',
    content: '今天是曾祖父张老太爷诞辰一百周年纪念日。我们全家齐聚一堂，共同缅怀这位可敬的老人。\n\n曾祖父生于1920年，那是一个动荡的年代。他勤劳一生，养育了五子二女，在那个物资匮乏的年代，硬是把孩子们都拉扯大了。听爷爷说，曾祖父每天天不亮就起床干活，晚上要等到孩子们都睡了才休息。\n\n曾祖父为人正直善良，深受乡邻敬重。谁家有困难，他总是慷慨相助。他常说："做人要厚道，能帮人处且帮人。"这句话成了我们家的家训，代代相传。\n\n虽然我没有见过曾祖父，但从长辈们的口中，我能感受到他的伟大。他虽然没有读过多少书，但他的人生智慧，比任何书本都要深刻。他用自己的行动，教会了我们什么是责任，什么是担当。\n\n今天，我们在曾祖父的墓前献上最隆重的祭祀，表达我们的敬意和思念。曾祖父，您的子孙没有辜负您的期望，我们会把您的美德传承下去，让张家的家风，代代相传。',
    date: '2024-08-20',
    author: '张大山',
    branchId: 'branch-1',
    createdAt: '2024-08-20T11:00:00Z',
    updatedAt: '2024-08-20T11:00:00Z',
  },
];

export const mockWiki: OfferingWiki[] = [
  {
    id: 'wiki-1',
    name: '三牲',
    category: '三牲',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20traditional%20three%20sacrificial%20meats%20offering%20pork%20chicken%20fish%20arranged%20on%20ceremonial%20red%20plate%20ancestral%20worship&image_size=square',
    meaning: '三牲指猪、鸡、鱼三种牲礼，是祭祀中最为隆重的供品组合，象征对先人的至高敬意与丰厚的奉养之心。',
    occasions: ['春节', '忌日', '周年', '诞辰', '中元节'],
    description: '传统三牲多以整鸡、方块猪肉、全鱼摆盘，讲究“有头有尾、完整无缺”，寓意家族圆满、子孙绵延。',
    usageNotes: '摆放时鸡头朝向先人牌位或墓碑；鱼多取“余”之谐音，寓意年年有余。三牲适用于大祭，日常小祭不宜过度铺张。',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'wiki-2',
    name: '五果',
    category: '五果',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20traditional%20five%20fruits%20offering%20platter%20apples%20bananas%20oranges%20grapes%20persimmon%20ancestral%20worship%20ceremony&image_size=square',
    meaning: '五果取五种时令水果，象征“五福临门”，寓意福、禄、寿、喜、财齐聚，是寄托美好祝愿的吉祥供品。',
    occasions: ['春节', '清明', '忌日', '诞辰', '重阳节'],
    description: '五果多以苹果（平安）、橘子（吉利）、香蕉（招财）、葡萄、柿子等组成，色泽鲜艳、寓意吉祥。',
    usageNotes: '宜选新鲜完整的水果，忌用破损或腐烂者。梨因谐音“离”，部分地区忌讳用于祭祀。',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'wiki-3',
    name: '水果',
    category: '五果',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Fresh%20fruit%20platter%20offering%20apples%20oranges%20bananas%20for%20Chinese%20ancestral%20worship%20ceremony&image_size=square',
    meaning: '水果色泽鲜艳、清甜可口，象征丰收与生机，是表达敬意与追思的常见供品。',
    occasions: ['清明', '忌日', '日常祭拜', '周年'],
    description: '可随季节选用新鲜水果，单数或双数皆可，以新鲜洁净为要。',
    usageNotes: '祭毕可分与家人食用，寓意分享先人福泽。祭前宜清洗擦净，以示诚敬。',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'wiki-4',
    name: '糕点',
    category: '糕点糖果',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Traditional%20Chinese%20pastries%20and%20cakes%20offering%20plate%20memorial%20ceremony%20red%20box&image_size=square',
    meaning: '糕点取“高”之谐音，寓意步步高升、生活甜美，寄托对家族兴旺的美好期盼。',
    occasions: ['春节', '忌日', '诞辰', '日常祭拜'],
    description: '传统糕点如桃酥、绿豆糕、云片糕等，造型精致、寓意吉祥。',
    usageNotes: '宜选用寓意吉祥的糕点，避免过于辛辣或刺激性口味。',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'wiki-5',
    name: '糖果',
    category: '糕点糖果',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Assorted%20Chinese%20candies%20offering%20plate%20memorial%20ceremony%20festive&image_size=square',
    meaning: '糖果象征甜蜜美满，寓意先人在天之灵庇佑子孙生活甜蜜、家运昌隆。',
    occasions: ['春节', '诞辰', '日常祭拜'],
    description: '多以各式喜糖、糖莲子、糖莲藕等摆盘，色泽喜庆。',
    usageNotes: '适合节庆祭拜，忌日等庄重场合可酌情减少。',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'wiki-6',
    name: '年糕',
    category: '糕点糖果',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20new%20year%20rice%20cake%20niangao%20offering%20plate%20ceremonial&image_size=square',
    meaning: '年糕谐音“年高”，寓意年年高升、岁岁登高，是春节祭祀不可或缺的供品。',
    occasions: ['春节'],
    description: '以糯米制成，有红、白、黄等色，象征金银丰收。',
    usageNotes: '春节期间必备，可切片煎食后分与家人，寓意分享福气。',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'wiki-7',
    name: '白酒',
    category: '酒水茶',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20baijiu%20liquor%20bottle%20and%20small%20cup%20offering%20ancestral%20worship%20ceremony&image_size=square',
    meaning: '白酒清冽醇厚，以酒敬先人，表达虔诚敬意与追思之情，是祭礼中敬献的重要环节。',
    occasions: ['清明', '忌日', '春节', '周年', '中元节'],
    description: '通常斟三杯，象征“天、地、人”三才，或取“三叩九首”之敬意。',
    usageNotes: '斟酒宜满，以示诚意。祭毕可洒于墓前或地上，寓意敬献先人。',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'wiki-8',
    name: '清茶',
    category: '酒水茶',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20tea%20cups%20with%20green%20tea%20offering%20ancestral%20worship%20ceremony%20elegant&image_size=square',
    meaning: '清茶素净淡雅，象征清正廉洁、淡泊明志，以茶敬先人寓意子孙清白做人、福泽绵长。',
    occasions: ['清明', '忌日', '日常祭拜', '周年'],
    description: '多以三杯清茶奉于供桌，茶香袅袅，寄托哀思。',
    usageNotes: '宜用新泡热茶，忌用隔夜冷茶。茶水七分满，留三分情。',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'wiki-9',
    name: '香烛',
    category: '香烛',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20incense%20sticks%20and%20red%20candles%20burning%20ancestral%20worship%20altar%20ceremonial&image_size=square',
    meaning: '香烛为沟通人神、传达心意的媒介。烛光照亮幽冥之路，香烟袅袅传递子孙思念。',
    occasions: ['清明', '忌日', '春节', '中元节', '寒衣节', '周年'],
    description: '由香与红烛组成，香多为三炷，烛为一对，象征光明与指引。',
    usageNotes: '点燃后应让其自然燃尽，勿中途吹灭。祭毕注意防火安全，确认熄灭后方可离开。',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'wiki-10',
    name: '纸钱',
    category: '纸扎祭品',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20joss%20paper%20spirit%20money%20offering%20stack%20ancestral%20worship&image_size=square',
    meaning: '纸钱又称冥币，焚化后供先人在冥府使用，是寄托哀思、奉养先人阴间所需的传统方式。',
    occasions: ['清明', '忌日', '中元节', '寒衣节', '周年'],
    description: '多为黄色或白色纸张，印有冥币图案，代表阴间通货。',
    usageNotes: '焚化时宜在指定区域进行，注意防火与环保。焚毕应确认余烬完全熄灭。',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'wiki-11',
    name: '元宝纸',
    category: '纸扎祭品',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20gold%20ingot%20paper%20offering%20joss%20yuanbao%20folded%20ancestral%20worship&image_size=square',
    meaning: '元宝纸折成金锭银锭之形，焚化后寓意为先人奉上金银财宝，祈愿先人在天之灵富足安乐、庇佑家宅兴旺。',
    occasions: ['清明', '中元节', '寒衣节', '忌日', '周年'],
    description: '以金纸或银纸折叠成元宝形状，成串摆放，色泽华贵。',
    usageNotes: '可与纸钱一同焚化。折元宝宜心怀敬意，数量以双数为吉。',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'wiki-12',
    name: '鲜花',
    category: '鲜花',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=White%20and%20yellow%20chrysanthemum%20flowers%20bouquet%20memorial%20offering%20cemetery&image_size=square',
    meaning: '鲜花以菊花为最，象征高洁与怀念，寄托对先人永恒的追思与敬意。',
    occasions: ['清明', '忌日', '周年', '重阳节'],
    description: '多以白菊、黄菊为主，亦可用先人生前喜爱的花种，素雅庄重。',
    usageNotes: '忌用过于鲜艳喜庆的花卉（如红玫瑰）。菊花宜单数，色彩以素净为宜。',
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

  const existingRules = localStorage.getItem('family_rules');
  if (!existingRules || JSON.parse(existingRules).length === 0) {
    localStorage.setItem('family_rules', JSON.stringify(mockRules));
  }

  const existingArticles = localStorage.getItem('memorial_articles');
  if (!existingArticles || JSON.parse(existingArticles).length === 0) {
    localStorage.setItem('memorial_articles', JSON.stringify(mockArticles));
  }

  const existingWiki = localStorage.getItem('offering_wiki');
  if (!existingWiki || JSON.parse(existingWiki).length === 0) {
    localStorage.setItem('offering_wiki', JSON.stringify(mockWiki));
  }
};
