import { Ancestor, Ritual, FamilyMember, RitualReservation } from '@/types';

const getFutureDate = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

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
    createdAt: '2025-01-23T00:00:00Z',
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
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export const initializeMockData = (): void => {
  const existingAncestors = localStorage.getItem('family_ancestors');
  if (!existingAncestors || JSON.parse(existingAncestors).length === 0) {
    localStorage.setItem('family_ancestors', JSON.stringify(mockAncestors));
  }
  
  const existingRituals = localStorage.getItem('family_rituals');
  if (!existingRituals || JSON.parse(existingRituals).length === 0) {
    localStorage.setItem('family_rituals', JSON.stringify(mockRituals));
  }
  
  const existingReservations = localStorage.getItem('family_reservations');
  if (!existingReservations || JSON.parse(existingReservations).length === 0) {
    localStorage.setItem('family_reservations', JSON.stringify(mockReservations));
  }
  
  const existingMembers = localStorage.getItem('family_members');
  if (!existingMembers || JSON.parse(existingMembers).length === 0) {
    localStorage.setItem('family_members', JSON.stringify(mockMembers));
  }
};
