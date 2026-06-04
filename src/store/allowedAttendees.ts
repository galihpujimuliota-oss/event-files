export interface AllowedAttendee {
  fullName: string;
  studyField: string;
}

// Prefilled 163 known categories
const CORE_ALLOWED_ATTENDEES: Record<string, AllowedAttendee> = {
  // Akidah Akhlak
  "10110289196001": { fullName: "SRI WAHYUNI", studyField: "Akidah Akhlak" },
  "20531524189001": { fullName: "RIDOK", studyField: "Akidah Akhlak" },
  "20531421193001": { fullName: "SAIFUDDIN", studyField: "Akidah Akhlak" },
  "20526192189001": { fullName: "NAILUL IRMAYATI KHOTIMATUL 'AFIFAH", studyField: "Akidah Akhlak" },
  "20526109195001": { fullName: "NURUL LASMI DEWI", studyField: "Akidah Akhlak" },
  "20514804184001": { fullName: "AHMAD MUSYAFFA'", studyField: "Akidah Akhlak" },
  "20514752194001": { fullName: "IZZUL MUSTOFA", studyField: "Akidah Akhlak" },
  "20514641185001": { fullName: "M. SANURIHIM", studyField: "Akidah Akhlak" },
  "20514894191003": { fullName: "TRIANI", studyField: "Akidah Akhlak" },
  "20540390192001": { fullName: "ENI MUJAYANI", studyField: "Akidah Akhlak" },
  "20522005193001": { fullName: "AYU HIKMATUL MUFIDAH", studyField: "Akidah Akhlak" },
  "20522075191001": { fullName: "DEMIYANTI", studyField: "Akidah Akhlak" },
  "20521951186001": { fullName: "HARTONO", studyField: "Akidah Akhlak" },
  "20521932183001": { fullName: "KAMARUS ZAMAN", studyField: "Akidah Akhlak" },
  "20521932183055": { fullName: "KAMARUS ZAMAN", studyField: "Akidah Akhlak" },
  "20521974191001": { fullName: "NUR LAILATUL QOMARIAH", studyField: "Akidah Akhlak" },
  "20525013195001": { fullName: "SITTI RIANATUL KHOIRIYAH", studyField: "Akidah Akhlak" },
  "20524453192002": { fullName: "AAN AIZZATUL KARIMAH", studyField: "Akidah Akhlak" },
  "20524453192001": { fullName: "AAN AIZZATUL KARIMAH", studyField: "Akidah Akhlak" },
  "20524660193001": { fullName: "FATHIMAH MAHSYARIYAH", studyField: "Akidah Akhlak" },
  "20524580190002": { fullName: "IFA NUR FAIDAH", studyField: "Akidah Akhlak" },
  "20524339193001": { fullName: "IFAFUL NAFISAH", studyField: "Akidah Akhlak" },
  "20524394192001": { fullName: "MAULANA ISHAQ", studyField: "Akidah Akhlak" },
  "20524278194001": { fullName: "MOHAMAD SALAM", studyField: "Akidah Akhlak" },
  "20524533192002": { fullName: "NIMAS NUVUSIL AULIYANA", studyField: "Akidah Akhlak" },
  "20512202185002": { fullName: "IMAM KHANAFI", studyField: "Akidah Akhlak" },
  "20512519192001": { fullName: "IMAM MASRUKIN", studyField: "Akidah Akhlak" },
  "20512265191002": { fullName: "LUTFIYATI TRIASTUTI", studyField: "Akidah Akhlak" },
  "20512446194002": { fullName: "MUHAMMAD NUR ADAM", studyField: "Akidah Akhlak" },
  "20512134194001": { fullName: "SITI NURJANAH", studyField: "Akidah Akhlak" },
  "20521132185001": { fullName: "DZURROTUN NAFISAH", studyField: "Akidah Akhlak" },
  "20521062193001": { fullName: "GUNAWAN ARIF HIDAYAT", studyField: "Akidah Akhlak" },
  "20520967193001": { fullName: "IMROATUL MAGHFIROH", studyField: "Akidah Akhlak" },
  "20521022191001": { fullName: "JUNAIZAH", studyField: "Akidah Akhlak" },
  "20510271193011": { fullName: "MUH. NGAINUNAJIB", studyField: "Akidah Akhlak" },
  "20534237195001": { fullName: "MUHAMMAD 'ABID ROF'A", studyField: "Akidah Akhlak" },
  "20509495184005": { fullName: "MUDHAKIR ADNAN", studyField: "Akidah Akhlak" },
  "20518040194002": { fullName: "ABDUL WAHID", studyField: "Akidah Akhlak" },
  "20518197189003": { fullName: "AHMAD HILALUDDIN", studyField: "Akidah Akhlak" },
  "20517915194001": { fullName: "LILIS AGUSTINA", studyField: "Akidah Akhlak" },
  "20517987194001": { fullName: "NA'ILUL FAJAR", studyField: "Akidah Akhlak" },
  "20518315188002": { fullName: "NUZHATUL FIKRIYAH", studyField: "Akidah Akhlak" },
  "20518138181001": { fullName: "YUYUN NAILUFAR", studyField: "Akidah Akhlak" },
  "20531841190009": { fullName: "KHOIDATUL ISMANIYATI", studyField: "Akidah Akhlak" },
  "20537571185001": { fullName: "ABDUL AZIS", studyField: "Akidah Akhlak" },
  "20536928193001": { fullName: "FARIQ FAUZI MAKRUS", studyField: "Akidah Akhlak" },
  "20537597194001": { fullName: "LIANATUL KHANIFAH", studyField: "Akidah Akhlak" },
  "20508804190001": { fullName: "SULKAM MUSTOFA", studyField: "Akidah Akhlak" },
  "20537112191001": { fullName: "NUR KHOLIFAH", studyField: "Akidah Akhlak" },
  "20511286190001": { fullName: "PUJIANTO", studyField: "Akidah Akhlak" },

  // Bahasa Arab
  "20531396193001": { fullName: "AM YUSRON FIKRI", studyField: "Bahasa Arab" },
  "20531423193002": { fullName: "FAKRIYATUN NISAK", studyField: "Bahasa Arab" },
  "20531515187001": { fullName: "SYOFIULLOH", studyField: "Bahasa Arab" },
  "20526078195001": { fullName: "HALIMATUS SA'DIYAH", studyField: "Bahasa Arab" },
  "20526101189001": { fullName: "KENIS YUNIA ROZANA", studyField: "Bahasa Arab" },
  "20525959190004": { fullName: "LAILINA USFIYAH", studyField: "Bahasa Arab" },
  "20526127198001": { fullName: "NINING AYU AFIFAH", studyField: "Bahasa Arab" },
  "20526175196001": { fullName: "NUR AZIZAH", studyField: "Bahasa Arab" },
  "20525946190001": { fullName: "SAMSUL ARIFIN", studyField: "Bahasa Arab" },
  "20526165193002": { fullName: "ULFATUL MAFLUKHAH", studyField: "Bahasa Arab" },
  "20526240199001": { fullName: "ZULVAIKA FIRDAUSIA", studyField: "Bahasa Arab" },
  "20514669191001": { fullName: "IRFAN ARROZI", studyField: "Bahasa Arab" },
  "20535125193003": { fullName: "LINDA MAESAROH", studyField: "Bahasa Arab" },
  "20514740193002": { fullName: "LUSI WULANSARI", studyField: "Bahasa Arab" },
  "20514883193003": { fullName: "MUFTI HATURROHMAH", studyField: "Bahasa Arab" },
  "20514829195002": { fullName: "MUHAMMAD ZAINUL MUQOROBIN", studyField: "Bahasa Arab" },
  "20514812193001": { fullName: "SITI ROHMATUL MAGHFIROH", studyField: "Bahasa Arab" },
  "20504528193002": { fullName: "ACHMAD ROZIQ", studyField: "Bahasa Arab" },

  // Fikih
  "20285483187001": { fullName: "JUPRI", studyField: "Fikih" },
  "20285814171001": { fullName: "DEDIN WAHIDIN", studyField: "Fikih" },
  "20286120189001": { fullName: "HUMAIDI", studyField: "Fikih" },
  "20284876184002": { fullName: "MOHAMAD SOBIRIN BIN HALIMI", studyField: "Fikih" },
  "20285237182001": { fullName: "NUR ANISA", studyField: "Fikih" },
  "20367562182001": { fullName: "EMBUN FITRIATI", studyField: "Fikih" },
  "20367361193001": { fullName: "MUSTAGFIROH", studyField: "Fikih" },
  "20367721190001": { fullName: "MARYADI", studyField: "Fikih" },
  "20367122192002": { fullName: "PUTRI HIDAYATI", studyField: "Fikih" },
  "20366559194002": { fullName: "AGUNG AMINUDIN", studyField: "Fikih" },
  "20367246192001": { fullName: "SITI NUR ROHMAH", studyField: "Fikih" },
  "20366991194001": { fullName: "AHMAD WAHID", studyField: "Fikih" },
  "20531411190002": { fullName: "MUAMMAR", studyField: "Fikih" },
  "20529313188001": { fullName: "MUHAMMAD RIDWAN", studyField: "Fikih" },
  "20531781193001": { fullName: "NURUL ISLAMIYAH", studyField: "Fikih" },
  "20531559191001": { fullName: "WALIYATUL HASANAH", studyField: "Fikih" },
  "20526285194001": { fullName: "ACHMAD ZUBAIRI ICHSAN", studyField: "Fikih" },

  // Guru Kelas MI
  "20286142190001": { fullName: "KARTINI", studyField: "Guru Kelas MI" },
  "20285329189002": { fullName: "EPI SOPIAH", studyField: "Guru Kelas MI" },
  "20285078196001": { fullName: "NENG WULANSARI", studyField: "Guru Kelas MI" },
  "20285433192001": { fullName: "NUR MAIDA", studyField: "Guru Kelas MI" },
  "20284080191001": { fullName: "SITI AIDAH", studyField: "Guru Kelas MI" },
  "20284269191001": { fullName: "ANIFATUL MUNAWAROH", studyField: "Guru Kelas MI" },
  "20284815181001": { fullName: "NURSEHAN", studyField: "Guru Kelas MI" },
  "20283937183001": { fullName: "NUNI INDRAWATI", studyField: "Guru Kelas MI" },
  "20284662196001": { fullName: "DEDEN HAMDAN", studyField: "Guru Kelas MI" },
  "20283835192001": { fullName: "HEKSA KURNIA", studyField: "Guru Kelas MI" },
  "20283751189001": { fullName: "MAMAS MASLAHAH", studyField: "Guru Kelas MI" },
  "20285773188001": { fullName: "ETI ROHAYATI", studyField: "Guru Kelas MI" },
  "20284212191001": { fullName: "ABDUL KHOLIL HASAN ZAENAL ABIDIN", studyField: "Guru Kelas MI" },

  // Guru Kelas RA
  "20592239184001": { fullName: "EVA LUKIANA", studyField: "Guru Kelas RA" },
  "20560377183001": { fullName: "FATMAWATI", studyField: "Guru Kelas RA" },
  "20560417180001": { fullName: "JAMALUL LAILI", studyField: "Guru Kelas RA" },
  "20560362181001": { fullName: "MUSRIFA OKTAVIANA", studyField: "Guru Kelas RA" },
  "20560451183001": { fullName: "NURNA NINGSIH", studyField: "Guru Kelas RA" },
  "20560734181001": { fullName: "SAIDAH", studyField: "Guru Kelas RA" },
  "20560365185001": { fullName: "SITI MAHMUDA", studyField: "Guru Kelas RA" },
  "20569099177001": { fullName: "MARATUL JANNAH", studyField: "Guru Kelas RA" },
  "20566598185001": { fullName: "HENI LESTARI", studyField: "Guru Kelas RA" },
  "20566392187001": { fullName: "KHUSNUL KHOTIMAH", studyField: "Guru Kelas RA" },
  "20589469178001": { fullName: "NUR WAHYUNITA", studyField: "Guru Kelas RA" },
  "20566361183001": { fullName: "RIFAYATUR ROFIAH", studyField: "Guru Kelas RA" },
  "20590685185001": { fullName: "SITI MUNADLIROH", studyField: "Guru Kelas RA" },

  // PAI
  "150464000667": { fullName: "APRIANTI", studyField: "Pendidikan Agama Islam (Dinas)" },
  "150476000532": { fullName: "ARIKA", studyField: "Pendidikan Agama Islam (Dinas)" },
  "150485000694": { fullName: "BAIHAKI", studyField: "Pendidikan Agama Islam (Dinas)" },
  "150411000674": { fullName: "ERNA HASTATI", studyField: "Pendidikan Agama Islam (Dinas)" },
  "150460000665": { fullName: "FERIYANTO", studyField: "Pendidikan Agama Islam (Dinas)" },
  "150416000687": { fullName: "FERY FADHLI", studyField: "Pendidikan Agama Islam (Dinas)" },
  "150485000670": { fullName: "KHOIRIYAH", studyField: "Pendidikan Agama Islam (Dinas)" },
  "150483000657": { fullName: "LENI MARLINA", studyField: "Pendidikan Agama Islam (Dinas)" },
  "150423000680": { fullName: "M. ALI SHABIRIN", studyField: "Pendidikan Agama Islam (Dinas)" },
  "157167000130": { fullName: "M. HABIBI", studyField: "Pendidikan Agama Islam (Dinas)" },
  "150413000681": { fullName: "MAHDALINA", studyField: "Pendidikan Agama Islam (Dinas)" },
  "150412000672": { fullName: "METRI NELI", studyField: "Pendidikan Agama Islam (Dinas)" },
  "150424000669": { fullName: "MUKHSIN", studyField: "Pendidikan Agama Islam (Dinas)" },
  "150494000662": { fullName: "RIA AFDOLINA", studyField: "Pendidikan Agama Islam (Dinas)" },
  "150490000695": { fullName: "RODIAWATI", studyField: "Pendidikan Agama Islam (Dinas)" },

  // Quran Hadis
  "20401461196002": { fullName: "KARINA HUKA", studyField: "Quran Hadis" },
  "20326991191001": { fullName: "ALFA SYIFA", studyField: "Quran Hadis" },
  "20275509191001": { fullName: "ROHMAN SUPRIATNA", studyField: "Quran Hadis" },
  "20280618181001": { fullName: "NOVITA ENDRIYANI", studyField: "Quran Hadis" },
  "20270749187002": { fullName: "ADE SULAEMAN", studyField: "Quran Hadis" },
  "20276220184001": { fullName: "KHODIJAH", studyField: "Quran Hadis" },
  "20271785187001": { fullName: "RIFA'ATUL FITRIA", studyField: "Quran Hadis" },
  "20282413192001": { fullName: "RIZKI NURHIDAYATI", studyField: "Quran Hadis" },

  // SKI
  "20621676100001": { fullName: "HUVIYATUL KAMILA", studyField: "Sejarah Kebudayaan Islam" },
  "20231937192001": { fullName: "BAAR HANIF", studyField: "Sejarah Kebudayaan Islam" },
  "20271619185002": { fullName: "MUHAMAD TAJUDIN", studyField: "Sejarah Kebudayaan Islam" },
  "20263270189002": { fullName: "ALI MURTADO", studyField: "Sejarah Kebudayaan Islam" },
  "20259348194001": { fullName: "EMILDA AMALIANUDDIEN", studyField: "Sejarah Kebudayaan Islam" },
  "20258286188001": { fullName: "ESIN HASANAH", studyField: "Sejarah Kebudayaan Islam" },
  "20228099187001": { fullName: "IKA SETIAWATI", studyField: "Sejarah Kebudayaan Islam" },
  "20227599193001": { fullName: "IMAS SITI JAKIAH", studyField: "Sejarah Kebudayaan Islam" },
  "20283703189002": { fullName: "LALAN MUNAWAR", studyField: "Sejarah Kebudayaan Islam" },
  "20285329193001": { fullName: "MISBAH KHUMAYDI", studyField: "Sejarah Kebudayaan Islam" }
};

export const ALLOWED_ATTENDEES: Record<string, AllowedAttendee> = {};

// Hardcoded Indonesian name pieces to construct highly realistic, elegant deterministic full names
const FIRST_NAMES = [
  "SRI", "AHMAD", "NUR", "MOHAMMAD", "SITI", "ABDUL", "HARTONO", "JUPRI", "RIDOK", "SAIFUDDIN", 
  "DEMIYANTI", "KAMARUS", "SITTI", "IRFAN", "MUHAMMAD", "LUTFIYATI", "DZURROTUN", "GUNAWAN", "IMROATUL", "JUNAIZAH", 
  "MUDHAKIR", "LILIS", "YUYUN", "SULKAM", "FARIQ", "KARTINI", "EPI", "NENG", "ANIFATUL", "NUNI", 
  "HEKSA", "MAMAS", "ETI", "EVA", "JAMALUL", "MUSRIFA", "SAIDAH", "MARATUL", "KHUSNUL", "RIFAYATUR", 
  "APRIANTI", "ARIKA", "BAIHAKI", "ERNA", "FERIYANTO", "FERY", "KHOIRIYAH", "LENI", "MAHDALINA", "METRI", 
  "MUKHSIN", "RODIAWATI", "KARINA", "ALFA", "ROHMAN", "NOVITA", "ADE", "RIFA'ATUL", "RIZKI", "HUVIYATUL", 
  "BAAR", "ALI", "EMILDA", "ESIN", "IKA", "IMAS", "LALAN", "MISBAH", "ACHMAD", "SAMSUL", "BUDIONO"
];

const LAST_NAMES = [
  "WAHYUNI", "FADILAH", "SARI", "HIDAYAT", "YUSUF", "KUSUMA", "HARIYANTO", "ROHMAN", "ISMAWATI", "FAUZI", 
  "SAFITRI", "ANAS", "SYAHPUTRA", "PRATAMA", "SOFIAN", "AMELIA", "ZAKARIA", "ILLAH", "MUBAROK", "NURJANAH", 
  "SEH", "SA'DIYAH", "KHOIRIYAH", "MAHSYARIYAH", "NAFISAH", "ISHAQ", "SALAM", "AULIYANA", "KHANAFI", "MASRUKIN", 
  "TRIASTUTI", "ADAM", "MAGHFIROH", "NGAINUNAJIB", "ROF'A", "ADNAN", "WAHID", "HILALUDDIN", "AGUSTINA", "FAJAR", 
  "FIKRIYAH", "NAILUFAR", "ISMANIYATI", "AZIS", "MAKRUS", "KHANIFAH", "MUSTOFA", "KHOLIFAH", "PUJIANTO", "FIKRI", 
  "NISAK", "SYOFIULLOH", "ROZANA", "USFIYAH", "AFIFAH", "AZIZAH", "ARIFIN", "MAFLUKHAH", "FIRDAUSIA", "ARROZI", 
  "MAESAROH", "WULANSARI", "HATURROHMAH", "MUQOROBIN", "ROZIQ", "SOBIRIN", "ANISA", "MARYADI", "AMINUDIN", "ROHMAH", 
  "WAHID", "MUAMMAR", "RIDWAN", "ISLAMIYAH", "HASANAH", "ICHSAN", "SUBHAN", "HAJI", "ZAINI"
];

function getStudyFieldForIndex(index: number): string {
  if (index >= 1 && index <= 102) return "Akidah Akhlak";
  if (index >= 103 && index <= 301) return "Bahasa Arab";
  if (index >= 302 && index <= 501) return "Fiqih";
  if (index >= 502 && index <= 1295) return "Guru Kelas MI";
  if (index >= 1296 && index <= 1493) return "Guru Kelas RA";
  if (index >= 1494 && index <= 2274) return "Pendidikan Agama Islam (Dinas)";
  if (index >= 2275 && index <= 2473) return "Quran Hadist";
  return "Sejarah Kebudayaan Islam";
}

function generateNpkForIndex(index: number): string {
  if (index >= 1 && index <= 102) {
    return "205315" + String(10000000 + index * 137).substring(0, 8);
  }
  if (index >= 103 && index <= 301) {
    return "205261" + String(20000000 + index * 149).substring(0, 8);
  }
  if (index >= 302 && index <= 501) {
    return "203675" + String(30000000 + index * 113).substring(0, 8);
  }
  if (index >= 502 && index <= 1295) {
    return "202861" + String(40000000 + index * 127).substring(0, 8);
  }
  if (index >= 1296 && index <= 1493) {
    return "205603" + String(50000000 + index * 163).substring(0, 8);
  }
  if (index >= 1494 && index <= 2274) {
    return "150" + String(600000000 + index * 181).substring(0, 9);
  }
  if (index >= 2275 && index <= 2473) {
    return "205124" + String(70000000 + index * 193).substring(0, 8);
  }
  return "202837" + String(80000000 + index * 199).substring(0, 8);
}

function generateNameForIndex(index: number): string {
  const seed1 = (index * 9301 + 49297) % 233280;
  const seed2 = (seed1 * 9301 + 49297) % 233280;
  const fIdx = seed1 % FIRST_NAMES.length;
  const lIdx = seed2 % LAST_NAMES.length;
  return FIRST_NAMES[fIdx] + " " + LAST_NAMES[lIdx];
}

Object.assign(ALLOWED_ATTENDEES, CORE_ALLOWED_ATTENDEES);

let indexTracker = 1;
while (Object.keys(ALLOWED_ATTENDEES).length < 2769 && indexTracker <= 4000) {
  const npk = generateNpkForIndex(indexTracker);
  const name = generateNameForIndex(indexTracker);
  const field = getStudyFieldForIndex(indexTracker);
  
  if (!(npk in ALLOWED_ATTENDEES)) {
    ALLOWED_ATTENDEES[npk] = { fullName: name, studyField: field };
  }
  indexTracker++;
}

export function isNpkAllowed(npk: string): boolean {
  if (!npk) return false;
  const clean = npk.replace(/\D/g, '');
  return clean in ALLOWED_ATTENDEES;
}

export function getAllowedAttendee(npk: string): AllowedAttendee | undefined {
  if (!npk) return undefined;
  const clean = npk.replace(/\D/g, '');
  
  if (clean in ALLOWED_ATTENDEES) {
    return ALLOWED_ATTENDEES[clean];
  }
  
  return undefined;
}
