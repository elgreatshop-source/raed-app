/**
 * Official Moroccan Territorial Divisions & Educational Directorates
 * التقسيم الإداري والترابي للمملكة المغربية وفق المرسوم رقم 2.15.40
 * والأكاديميات الجهوية للتربية والتكوين الـ 12 والمديريات الإقليمية التابعة لها
 */

export interface RegionDirectorateGroup {
  id: string;
  regionName: string;
  shortName: string;
  capital: string;
  directorates: string[];
}

export const MOROCCAN_REGIONS_WITH_DIRECTORATES: RegionDirectorateGroup[] = [
  {
    id: 'tanger-tetouan-alhoceima',
    regionName: 'جهة طنجة - تطوان - الحسيمة',
    shortName: 'طنجة - تطوان - الحسيمة',
    capital: 'طنجة',
    directorates: [
      'المديرية الإقليمية بطنجة - أصيلة',
      'المديرية الإقليمية بتطوان',
      'المديرية الإقليمية بالمضيق - الفنيدق',
      'المديرية الإقليمية بالعرائش',
      'المديرية الإقليمية بشفشاون',
      'المديرية الإقليمية بالحسيمة',
      'المديرية الإقليمية بوزان',
      'المديرية الإقليمية بالفحص - أنجرة',
    ],
  },
  {
    id: 'oriental',
    regionName: 'جهة الشرق',
    shortName: 'الشرق',
    capital: 'وجدة',
    directorates: [
      'المديرية الإقليمية بوجدة - أنكاد',
      'المديرية الإقليمية بالناظور',
      'المديرية الإقليمية بالدريوش',
      'المديرية الإقليمية ببركان',
      'المديرية الإقليمية بتاوريرت',
      'المديرية الإقليمية بجرسيف',
      'المديرية الإقليمية بجرادة',
      'المديرية الإقليمية بفكيك (بوعرفة)',
    ],
  },
  {
    id: 'fes-meknes',
    regionName: 'جهة فاس - مكناس',
    shortName: 'فاس - مكناس',
    capital: 'فاس',
    directorates: [
      'المديرية الإقليمية بفاس',
      'المديرية الإقليمية بمكناس',
      'المديرية الإقليمية بصفرو',
      'المديرية الإقليمية بإفران',
      'المديرية الإقليمية بالحاجب',
      'المديرية الإقليمية بتازة',
      'المديرية الإقليمية بتاونات',
      'المديرية الإقليمية ببولمان (ميسور)',
      'المديرية الإقليمية بمولاي يعقوب',
    ],
  },
  {
    id: 'rabat-sale-kenitra',
    regionName: 'جهة الرباط - سلا - القنيطرة',
    shortName: 'الرباط - سلا - القنيطرة',
    capital: 'الرباط',
    directorates: [
      'المديرية الإقليمية بالرباط',
      'المديرية الإقليمية بسلا',
      'المديرية الإقليمية بالصخيرات - تمارة',
      'المديرية الإقليمية بالقنيطرة',
      'المديرية الإقليمية بالخميسات',
      'المديرية الإقليمية بسيدي قاسم',
      'المديرية الإقليمية بسيدي سليمان',
    ],
  },
  {
    id: 'beni-mellal-khenifra',
    regionName: 'جهة بني ملال - خنيفرة',
    shortName: 'بني ملال - خنيفرة',
    capital: 'بني ملال',
    directorates: [
      'المديرية الإقليمية ببني ملال',
      'المديرية الإقليمية بأزيلال',
      'المديرية الإقليمية بالفقيه بن صالح',
      'المديرية الإقليمية بخنيفرة',
      'المديرية الإقليمية بخريبكة',
    ],
  },
  {
    id: 'casablanca-settat',
    regionName: 'جهة الدار البيضاء - سطات',
    shortName: 'الدار البيضاء - سطات',
    capital: 'الدار البيضاء',
    directorates: [
      'المديرية الإقليمية بالدار البيضاء أنفا',
      'المديرية الإقليمية بالفداء - مرس السلطان',
      'المديرية الإقليمية بعين السبع - الحي المحمدي',
      'المديرية الإقليمية بالحي الحسني',
      'المديرية الإقليمية بعين الشق',
      'المديرية الإقليمية بسيدي البرنوصي',
      'المديرية الإقليمية بابن مسيك',
      'المديرية الإقليمية بمولاي رشيد',
      'المديرية الإقليمية بالمحمدية',
      'المديرية الإقليمية بالنواصر',
      'المديرية الإقليمية بمديونة',
      'المديرية الإقليمية بسطات',
      'المديرية الإقليمية ببرشيد',
      'المديرية الإقليمية بالجديدة',
      'المديرية الإقليمية بسيدي بنور',
      'المديرية الإقليمية ببنسليمان',
    ],
  },
  {
    id: 'marrakech-safi',
    regionName: 'جهة مراكش - آسفي',
    shortName: 'مراكش - آسفي',
    capital: 'مراكش',
    directorates: [
      'المديرية الإقليمية بمراكش',
      'المديرية الإقليمية بآسفي',
      'المديرية الإقليمية بالصويرة',
      'المديرية الإقليمية باليوسفية',
      'المديرية الإقليمية بقلعة السراغنة',
      'المديرية الإقليمية بالحوز (تحناوت)',
      'المديرية الإقليمية بالرحامنة (ابن جرير)',
      'المديرية الإقليمية بشيشاوة',
    ],
  },
  {
    id: 'draa-tafilalet',
    regionName: 'جهة درعة - تافيلالت',
    shortName: 'درعة - تافيلالت',
    capital: 'الرشيدية',
    directorates: [
      'المديرية الإقليمية بالرشيدية',
      'المديرية الإقليمية بورزازات',
      'المديرية الإقليمية بميدلت',
      'المديرية الإقليمية بتنغير',
      'المديرية الإقليمية بزاكورة',
    ],
  },
  {
    id: 'souss-massa',
    regionName: 'جهة سوس - ماسة',
    shortName: 'سوس - ماسة',
    capital: 'أكادير',
    directorates: [
      'المديرية الإقليمية بأكادير إداوتنان',
      'المديرية الإقليمية بإنزكان - آيت ملول',
      'المديرية الإقليمية باشتوكة آيت باها',
      'المديرية الإقليمية بتارودانت',
      'المديرية الإقليمية بتيزنيت',
      'المديرية الإقليمية بطاطا',
    ],
  },
  {
    id: 'guelmim-oued-noun',
    regionName: 'جهة كلميم - واد نون',
    shortName: 'كلميم - واد نون',
    capital: 'كلميم',
    directorates: [
      'المديرية الإقليمية بكلميم',
      'المديرية الإقليمية بسيدي إفني',
      'المديرية الإقليمية بطانطان',
      'المديرية الإقليمية بآسا - الزاك',
    ],
  },
  {
    id: 'laayoune-sakia-el-hamra',
    regionName: 'جهة العيون - الساقية الحمراء',
    shortName: 'العيون - الساقية الحمراء',
    capital: 'العيون',
    directorates: [
      'المديرية الإقليمية بالعيون',
      'المديرية الإقليمية ببوجدور',
      'المديرية الإقليمية بطرفاية',
      'المديرية الإقليمية بالسمارة',
    ],
  },
  {
    id: 'dakhla-oued-ed-dahab',
    regionName: 'جهة الداخلة - وادي الذهب',
    shortName: 'الداخلة - وادي الذهب',
    capital: 'الداخلة',
    directorates: [
      'المديرية الإقليمية بوادي الذهب (الداخلة)',
      'المديرية الإقليمية بأوسرد',
    ],
  },
];

export const MOROCCAN_REGIONS_LIST = MOROCCAN_REGIONS_WITH_DIRECTORATES.map((r) => r.regionName);

/**
 * Get directorates for a specific region name
 */
export function getDirectoratesForRegion(regionName: string): string[] {
  const match = MOROCCAN_REGIONS_WITH_DIRECTORATES.find(
    (r) => r.regionName === regionName || r.shortName === regionName
  );
  if (match) {
    return match.directorates;
  }
  // Default to Marrakech - Safi directorates if not found
  return MOROCCAN_REGIONS_WITH_DIRECTORATES[6].directorates;
}

/**
 * Find which region a directorate belongs to
 */
export function findRegionByDirectorate(directorateName: string): string | null {
  for (const group of MOROCCAN_REGIONS_WITH_DIRECTORATES) {
    if (group.directorates.some((d) => d.includes(directorateName) || directorateName.includes(d))) {
      return group.regionName;
    }
  }
  return null;
}
