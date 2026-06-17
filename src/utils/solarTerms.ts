import { SolarTerm, SolarTermWithDate, SOLAR_TERMS_ORDER } from '@/types';

export const SOLAR_TERMS_DATA: SolarTerm[] = [
  {
    id: 'lichun',
    name: '立春',
    englishName: 'Start of Spring',
    month: 2,
    day: 4,
    description: '立春是二十四节气之首，标志着春季的开始。此时阳气上升，万物复苏，民间有"迎春"、"咬春"等习俗。',
    customs: ['迎春祭祀', '咬春吃春饼', '打春牛', '贴春联'],
    hasRitualCustom: true,
    ritualSuggestion: '立春时节适宜举行迎春祭祀，感恩天地造化，祈求先人庇佑家族新一年平安顺遂。',
    offerings: ['春饼', '萝卜', '新鲜蔬菜', '酒水'],
    color: 'from-green-400 to-emerald-500',
    icon: '🌱',
  },
  {
    id: 'yushui',
    name: '雨水',
    englishName: 'Rain Water',
    month: 2,
    day: 19,
    description: '雨水节气标志着降雨开始增多，气温回升，冰雪融化。民间有"回娘屋"、"拉保保"等习俗。',
    customs: ['回娘屋', '拉保保', '接寿'],
    hasRitualCustom: false,
    color: 'from-blue-300 to-cyan-400',
    icon: '🌧️',
  },
  {
    id: 'jingzhe',
    name: '惊蛰',
    englishName: 'Awakening of Insects',
    month: 3,
    day: 6,
    description: '惊蛰时节春雷始鸣，惊醒蛰伏地下的虫类。此时气温回暖，万物生机盎然。',
    customs: ['祭白虎', '打小人', '吃梨润燥'],
    hasRitualCustom: false,
    color: 'from-yellow-400 to-amber-500',
    icon: '⚡',
  },
  {
    id: 'chunfen',
    name: '春分',
    englishName: 'Spring Equinox',
    month: 3,
    day: 21,
    description: '春分日昼夜平分，此后白昼渐长。民间有"竖蛋"、"放风筝"、"吃春菜"等习俗。',
    customs: ['竖蛋', '放风筝', '吃春菜', '祭祖'],
    hasRitualCustom: true,
    ritualSuggestion: '春分时节阴阳平衡，适宜举行祭祖仪式，表达对先人的追思，祈求家族和谐兴旺。',
    offerings: ['春菜', '青团', '时令水果', '香烛'],
    color: 'from-emerald-400 to-green-500',
    icon: '🌸',
  },
  {
    id: 'qingming',
    name: '清明',
    englishName: 'Clear and Bright',
    month: 4,
    day: 5,
    description: '清明是最重要的传统祭祀节日之一，兼具自然与人文两大内涵。此时气清景明，万物皆显。',
    customs: ['扫墓祭祖', '踏青郊游', '插柳戴柳', '放风筝', '吃青团'],
    hasRitualCustom: true,
    ritualSuggestion: '清明节是传统的重大春祭节日，扫墓祭祀、缅怀祖先，是中华民族自古以来的优良传统。',
    offerings: ['青团', '糯米饭', '酒水', '鲜花', '香烛纸钱'],
    color: 'from-lime-400 to-green-500',
    icon: '🌿',
  },
  {
    id: 'guyu',
    name: '谷雨',
    englishName: 'Grain Rain',
    month: 4,
    day: 20,
    description: '谷雨是春季最后一个节气，降水明显增多，有利于谷类作物生长。民间有"走谷雨"、"喝谷雨茶"等习俗。',
    customs: ['走谷雨', '喝谷雨茶', '食香椿', '祭海'],
    hasRitualCustom: false,
    color: 'from-teal-400 to-emerald-500',
    icon: '🌾',
  },
  {
    id: 'lixia',
    name: '立夏',
    englishName: 'Start of Summer',
    month: 5,
    day: 6,
    description: '立夏标志着夏季的开始，万物繁茂，气温明显升高。民间有"尝新"、"斗蛋"、"称人"等习俗。',
    customs: ['尝新活动', '斗蛋游戏', '称人验肥瘦', '饮立夏茶'],
    hasRitualCustom: false,
    color: 'from-red-400 to-orange-500',
    icon: '☀️',
  },
  {
    id: 'xiaoman',
    name: '小满',
    englishName: 'Grain Buds',
    month: 5,
    day: 21,
    description: '小满时节麦类等夏熟作物籽粒开始饱满，但尚未成熟，故称"小满"。',
    customs: ['祭车神', '祈蚕节', '食野菜'],
    hasRitualCustom: false,
    color: 'from-amber-400 to-yellow-500',
    icon: '🌾',
  },
  {
    id: 'mangzhong',
    name: '芒种',
    englishName: 'Grain in Ear',
    month: 6,
    day: 6,
    description: '芒种是夏季第三个节气，此时有芒的麦子可收，有芒的稻子可种，是农事繁忙的时节。',
    customs: ['送花神', '安苗祭祀', '打泥巴仗', '煮梅'],
    hasRitualCustom: true,
    ritualSuggestion: '芒种"安苗"是传统的祭祀活动，祈求秋天有个好收成，同时也可祭祀先人，感恩祖上庇佑。',
    offerings: ['新麦', '青梅', '时令瓜果', '香烛'],
    color: 'from-yellow-500 to-amber-600',
    icon: '🌻',
  },
  {
    id: 'xiazhi',
    name: '夏至',
    englishName: 'Summer Solstice',
    month: 6,
    day: 21,
    description: '夏至日是北半球白昼最长的一天，此后阳气渐衰，阴气渐长。民间有"祭地祀"的习俗。',
    customs: ['祭地祀', '吃夏至面', '消夏避伏'],
    hasRitualCustom: true,
    ritualSuggestion: '夏至是传统"祭地祀"的日子，感恩大地滋养万物，同时可祭祀先人，祈求夏季平安。',
    offerings: ['夏至面', '西瓜', '清凉饮品', '香烛'],
    color: 'from-orange-500 to-red-600',
    icon: '🌞',
  },
  {
    id: 'xiaoshu',
    name: '小暑',
    englishName: 'Minor Heat',
    month: 7,
    day: 7,
    description: '小暑标志着进入盛夏，天气开始炎热，但还未到最热之时。',
    customs: ['食新米', '晒伏', '吃饺子'],
    hasRitualCustom: false,
    color: 'from-orange-400 to-red-500',
    icon: '🌡️',
  },
  {
    id: 'dashu',
    name: '大暑',
    englishName: 'Major Heat',
    month: 7,
    day: 23,
    description: '大暑是一年中最热的时期，高温酷热，雷暴频繁。民间有"晒伏姜"、"喝伏茶"等习俗。',
    customs: ['晒伏姜', '喝伏茶', '烧伏香', '饮羊肉汤'],
    hasRitualCustom: false,
    color: 'from-red-500 to-rose-600',
    icon: '🔥',
  },
  {
    id: 'liqiu',
    name: '立秋',
    englishName: 'Start of Autumn',
    month: 8,
    day: 8,
    description: '立秋标志着秋季的开始，暑去凉来，万物开始从繁茂趋向成熟。民间有"贴秋膘"、"咬秋"等习俗。',
    customs: ['贴秋膘', '咬秋啃瓜', '晒秋', '秋社祭祀'],
    hasRitualCustom: true,
    ritualSuggestion: '立秋"秋社"是传统祭祀土地神的日子，同时也可祭祀先人，感恩先祖庇佑，迎接丰收季节。',
    offerings: ['西瓜', '秋桃', '新收谷物', '酒水'],
    color: 'from-amber-500 to-orange-600',
    icon: '🍂',
  },
  {
    id: 'chushu',
    name: '处暑',
    englishName: 'End of Heat',
    month: 8,
    day: 23,
    description: '处暑意味着炎热即将过去，暑气渐渐消退。民间有"放河灯"、"开渔节"等习俗。',
    customs: ['放河灯', '开渔节', '吃鸭子', '祭祖迎秋'],
    hasRitualCustom: true,
    ritualSuggestion: '处暑时节放河灯是传统习俗，可借以表达对先人的追思，祈福先人安好。',
    offerings: ['鸭子', '河灯', '时令水果', '香烛'],
    color: 'from-orange-400 to-amber-500',
    icon: '🌅',
  },
  {
    id: 'bailu',
    name: '白露',
    englishName: 'White Dew',
    month: 9,
    day: 8,
    description: '白露时节天气转凉，清晨时分可见白色露珠凝结在草木之上。',
    customs: ['收清露', '祭禹王', '吃龙眼', '喝白露茶'],
    hasRitualCustom: false,
    color: 'from-sky-400 to-blue-500',
    icon: '💧',
  },
  {
    id: 'qiufen',
    name: '秋分',
    englishName: 'Autumn Equinox',
    month: 9,
    day: 23,
    description: '秋分日昼夜再次平分，此后夜渐长昼渐短。民间有"祭月"、"竖蛋"、"吃秋菜"等习俗。',
    customs: ['祭月', '竖蛋', '吃秋菜', '送秋牛', '粘雀子嘴'],
    hasRitualCustom: true,
    ritualSuggestion: '秋分曾是传统"祭月节"，中秋节即由祭月节演变而来。此时适宜祭祀先人，寄托思念之情。',
    offerings: ['月饼', '瓜果', '桂花酒', '香烛'],
    color: 'from-amber-400 to-yellow-500',
    icon: '🌕',
  },
  {
    id: 'hanlu',
    name: '寒露',
    englishName: 'Cold Dew',
    month: 10,
    day: 8,
    description: '寒露时节气温更低，露水更寒，将要凝结。此时秋意正浓，菊花盛开。',
    customs: ['登高赏菊', '吃芝麻', '饮菊花酒', '斗蛐蛐'],
    hasRitualCustom: false,
    color: 'from-indigo-400 to-purple-500',
    icon: '🌺',
  },
  {
    id: 'shuangjiang',
    name: '霜降',
    englishName: 'Frost Descent',
    month: 10,
    day: 24,
    description: '霜降是秋季最后一个节气，天气渐冷，初霜出现。民间有"赏菊"、"吃柿子"、"登高远眺"等习俗。',
    customs: ['赏菊', '吃柿子', '登高', '进补'],
    hasRitualCustom: false,
    color: 'from-orange-500 to-red-500',
    icon: '🍁',
  },
  {
    id: 'lidong',
    name: '立冬',
    englishName: 'Start of Winter',
    month: 11,
    day: 8,
    description: '立冬标志着冬季的开始，万物收藏，规避寒冷。民间有"补冬"、"吃饺子"等习俗。',
    customs: ['补冬进补', '吃饺子', '祭祖祈福', '酿黄酒'],
    hasRitualCustom: true,
    ritualSuggestion: '立冬时节宜举行祭祖仪式，感谢先人一年来的庇佑，同时祈求冬季平安健康。',
    offerings: ['饺子', '羊肉', '黄酒', '香烛'],
    color: 'from-slate-500 to-gray-600',
    icon: '❄️',
  },
  {
    id: 'xiaoxue',
    name: '小雪',
    englishName: 'Minor Snow',
    month: 11,
    day: 22,
    description: '小雪时节气温下降，开始降雪，但雪量不大。民间有"腌腊肉"、"吃糍粑"等习俗。',
    customs: ['腌腊肉', '吃糍粑', '晒鱼干'],
    hasRitualCustom: false,
    color: 'from-blue-300 to-slate-400',
    icon: '🌨️',
  },
  {
    id: 'daxue',
    name: '大雪',
    englishName: 'Major Snow',
    month: 12,
    day: 7,
    description: '大雪时节降雪量增多，天气更加寒冷。民间有"腌肉"、"观赏封河"等习俗。',
    customs: ['腌肉', '观赏封河', '进补'],
    hasRitualCustom: false,
    color: 'from-blue-400 to-indigo-500',
    icon: '⛄',
  },
  {
    id: 'dongzhi',
    name: '冬至',
    englishName: 'Winter Solstice',
    month: 12,
    day: 22,
    description: '冬至是北半球白昼最短的一天，此后阳气渐升。民间有"冬至大如年"的说法，是重要的祭祀节日。',
    customs: ['祭祖', '吃饺子', '吃汤圆', '数九', '祭天祀祖'],
    hasRitualCustom: true,
    ritualSuggestion: '冬至是传统重要祭祀节日，自古有"冬至大如年"之说。此时应隆重祭祀先人，感恩祖德，祈求家族兴旺。',
    offerings: ['饺子', '汤圆', '年糕', '酒水', '香烛纸钱'],
    color: 'from-indigo-500 to-purple-600',
    icon: '🌙',
  },
  {
    id: 'xiaohan',
    name: '小寒',
    englishName: 'Minor Cold',
    month: 1,
    day: 6,
    description: '小寒标志着一年中最寒冷日子的开始，气温降到最低点。',
    customs: ['吃糯米饭', '画图数九', '探梅'],
    hasRitualCustom: false,
    color: 'from-cyan-400 to-blue-500',
    icon: '🥶',
  },
  {
    id: 'dahan',
    name: '大寒',
    englishName: 'Major Cold',
    month: 1,
    day: 20,
    description: '大寒是二十四节气之末，是一年中最寒冷的时期。此时年味渐浓，人们开始准备过年。',
    customs: ['除旧布新', '祭灶神', '扫尘', '办年货', '尾牙祭'],
    hasRitualCustom: true,
    ritualSuggestion: '大寒时节除旧布新，适宜举行年终祭祀，感谢先人一年庇佑，同时祈求新年吉祥如意。',
    offerings: ['灶糖', '年糕', '年饼', '酒水', '香烛'],
    color: 'from-red-500 to-rose-600',
    icon: '🧧',
  },
];

const SOLAR_TERM_MAP = new Map(SOLAR_TERMS_DATA.map(st => [st.name, st]));

export function getSolarTermByName(name: string): SolarTerm | undefined {
  return SOLAR_TERM_MAP.get(name);
}

export function getSolarTermsWithDates(year: number): SolarTermWithDate[] {
  return SOLAR_TERMS_DATA.map(st => {
    let month = st.month;
    let day = st.day;
    const yearForDate = st.month >= 2 ? year : year + 1;
    const date = new Date(yearForDate, month - 1, day);
    
    if (st.name === '清明') {
      const baseDate = new Date(year, 3, 5);
      const daysToAdd = Math.floor((year - 1900) * 0.2422 + 4.81) - Math.floor((year - 1944) / 4);
      date.setMonth(3, 4 + daysToAdd);
    } else if (st.name === '冬至') {
      const daysToAdd = Math.floor((year - 1900) * 0.2422 + 21.94) - Math.floor((year - 1900) / 4);
      date.setMonth(11, 21 + daysToAdd);
    }
    
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    return {
      ...st,
      date: dateStr,
      year: date.getFullYear(),
    };
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getCurrentSolarTerm(date: Date = new Date()): SolarTermWithDate {
  const year = date.getFullYear();
  const terms = getSolarTermsWithDates(year);
  const termsNextYear = getSolarTermsWithDates(year + 1);
  const allTerms = [...terms, ...termsNextYear];
  
  const time = date.getTime();
  
  for (let i = 0; i < allTerms.length - 1; i++) {
    const currentTermTime = new Date(allTerms[i].date).getTime();
    const nextTermTime = new Date(allTerms[i + 1].date).getTime();
    
    if (time >= currentTermTime && time < nextTermTime) {
      return allTerms[i];
    }
  }
  
  return allTerms[allTerms.length - 1];
}

export function getNextSolarTerm(date: Date = new Date()): SolarTermWithDate {
  const year = date.getFullYear();
  const terms = getSolarTermsWithDates(year);
  const termsNextYear = getSolarTermsWithDates(year + 1);
  const allTerms = [...terms, ...termsNextYear];
  
  const time = date.getTime();
  
  for (const term of allTerms) {
    if (new Date(term.date).getTime() > time) {
      return term;
    }
  }
  
  return allTerms[0];
}

export function getSolarTermByDate(date: Date): SolarTermWithDate | null {
  const year = date.getFullYear();
  const terms = getSolarTermsWithDates(year);
  const termsNextYear = getSolarTermsWithDates(year + 1);
  const allTerms = [...terms, ...termsNextYear];
  
  const time = date.getTime();
  
  for (const term of allTerms) {
    const termDate = new Date(term.date);
    if (termDate.getFullYear() === date.getFullYear() &&
        termDate.getMonth() === date.getMonth() &&
        termDate.getDate() === date.getDate()) {
      return term;
    }
  }
  
  return null;
}

export function getDaysUntilNextTerm(date: Date = new Date()): number {
  const nextTerm = getNextSolarTerm(date);
  const nextTermDate = new Date(nextTerm.date);
  const now = new Date(date);
  now.setHours(0, 0, 0, 0);
  nextTermDate.setHours(0, 0, 0, 0);
  const diffTime = nextTermDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getSeasonalTerms(season: 'spring' | 'summer' | 'autumn' | 'winter'): SolarTerm[] {
  const seasonRanges: Record<string, [number, number]> = {
    spring: [0, 5],
    summer: [6, 11],
    autumn: [12, 17],
    winter: [18, 23],
  };
  const [start, end] = seasonRanges[season];
  return SOLAR_TERMS_DATA.slice(start, end + 1);
}

export function getRitualTerms(): SolarTerm[] {
  return SOLAR_TERMS_DATA.filter(st => st.hasRitualCustom);
}

export function formatSolarTermDate(term: SolarTermWithDate): string {
  const date = new Date(term.date);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

export function isSolarTermToday(date: Date = new Date()): boolean {
  return getSolarTermByDate(date) !== null;
}
