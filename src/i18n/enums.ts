import type { Language } from './index'

/**
 * Bilingual enum/option labels. In English mode the raw value is shown;
 * in Hindi mode options render as "हिंदी (English)" — Hindi next to English.
 */
export function enumLabel(map: Record<string, string>, value: string, lang: Language): string {
  if (lang === 'en') return value
  const hi = map[value]
  return hi ? `${hi} (${value})` : value
}

export const EXAM_TYPE_HI: Record<string, string> = {
  Midterm: 'मध्यावधि परीक्षा',
  Final: 'अंतिम परीक्षा',
  Quiz: 'प्रश्नोत्तरी',
  Supplementary: 'पूरक परीक्षा',
}

export const DIFFICULTY_HI: Record<string, string> = {
  Easy: 'आसान',
  Medium: 'मध्यम',
  Hard: 'कठिन',
}

export const NOTE_TYPE_HI: Record<string, string> = {
  note: 'नोट',
  'answer-script': 'उत्तर-लेख',
}

export const CATEGORY_HI: Record<string, string> = {
  Government: 'सरकारी',
  Private: 'निजी',
  'University Aid': 'विश्वविद्यालय सहायता',
  'Reserved Quota': 'आरक्षित कोटा',
}

export const STATUS_HI: Record<string, string> = {
  'Not Started': 'शुरू नहीं हुआ',
  'In Progress': 'प्रगति पर',
  Submitted: 'जमा किया गया',
  Awarded: 'प्राप्त',
  Rejected: 'अस्वीकृत',
}

export const REGION_HI: Record<string, string> = {
  National: 'राष्ट्रीय',
  'State-wide': 'राज्य-व्यापी',
  International: 'अंतरराष्ट्रीय',
  'On-campus': 'परिसर में',
}

export const DOCUMENT_HI: Record<string, string> = {
  Marksheet: 'मार्कशीट',
  'Income Certificate': 'आय प्रमाण पत्र',
  'Caste Certificate': 'जाति प्रमाण पत्र',
  SOP: 'उद्देश्य वक्तव्य',
  'Bank Details': 'बैंक विवरण',
  'Passport Photo': 'पासपोर्ट फोटो',
  Transcript: 'ट्रांसक्रिप्ट',
  'Two Recommendation Letters': 'दो अनुशंसा पत्र',
  Resume: 'रिज़्यूमे',
  'Domicile Certificate': 'अधिवास प्रमाण पत्र',
  'Community Certificate': 'समुदाय प्रमाण पत्र',
  'Admission Letter': 'प्रवेश पत्र',
  'Entrance Rank Card': 'प्रवेश रैंक कार्ड',
  Passport: 'पासपोर्ट',
  'Hostel Admission Proof': 'छात्रावास प्रवेश प्रमाण',
  'Hardship Statement': 'कठिनाई वक्तव्य',
  'Faculty Advisor Letter': 'संकाय सलाहकार पत्र',
}
