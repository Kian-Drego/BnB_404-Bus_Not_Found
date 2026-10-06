/** Module C (ATS resume builder) strings. */
export const resumeDict = {
  en: {
    /* Page header & actions */
    'resume.title': 'ATS Resume Builder',
    'resume.subtitle':
      'Build a parser-safe, single-column resume. Live ATS checks and role keywords update as you type — then export a clean PDF any tracking system can read.',
    'resume.loadSample': 'Load sample',
    'resume.reset': 'Reset',
    'resume.resetConfirm': 'Clear the entire resume? This cannot be undone.',
    'resume.exportPdf': 'Export PDF',

    /* Form section headings */
    'resume.section.contact': 'Contact & Target Role',
    'resume.section.summary': 'Professional Summary',
    'resume.section.education': 'Education',
    'resume.section.experience': 'Experience',
    'resume.section.projects': 'Projects',
    'resume.section.skills': 'Skills',

    /* Field labels & hints */
    'resume.field.fullName': 'Full name',
    'resume.field.email': 'Email',
    'resume.field.phone': 'Phone',
    'resume.field.location': 'Location',
    'resume.field.links': 'Links',
    'resume.field.targetRole': 'Target role',
    'resume.field.targetRoleHint': 'Used for keyword recommendations',
    'resume.field.selectRole': 'Select a role…',
    'resume.field.school': 'School',
    'resume.field.degree': 'Degree',
    'resume.field.fieldOfStudy': 'Field of study',
    'resume.field.startYear': 'Start year',
    'resume.field.endYear': 'End year',
    'resume.field.gpa': 'GPA',
    'resume.field.company': 'Company',
    'resume.field.role': 'Role',
    'resume.field.startDate': 'Start date',
    'resume.field.endDate': 'End date',
    'resume.field.achievements': 'Achievements',
    'resume.field.achievementsHint':
      "One achievement per line. Start with an action verb, quantify impact (e.g. 'Reduced load time by 35%').",
    'resume.field.projectName': 'Project name',
    'resume.field.techStack': 'Tech stack',
    'resume.field.description': 'Description',
    'resume.field.skillsHint': 'Comma-separated — e.g. JavaScript, React, SQL. Aim for at least 5.',

    /* Instructional placeholders */
    'resume.ph.location': 'City, Country',
    'resume.ph.endYear': '2027 (expected)',

    /* Summary card */
    'resume.summaryCount': '{n} / 500',
    'resume.summaryTip': 'Add your degree, years of experience and 2–3 keywords (40+ characters).',

    /* Entry add/remove buttons */
    'resume.addEducation': 'Add education',
    'resume.addExperience': 'Add experience',
    'resume.addProject': 'Add project',
    'resume.removeEducation': 'Remove education entry',
    'resume.removeExperience': 'Remove experience entry',
    'resume.removeProject': 'Remove project entry',

    /* Empty-section hints */
    'resume.empty.education': 'No education added yet — parsers expect at least one entry.',
    'resume.empty.experience': 'Internships, part-time jobs and research assistantships all count.',
    'resume.empty.projects': 'Coursework and personal projects show applied skills.',

    /* Skill suggestions */
    'resume.suggestedFor': 'Suggested for {role}',
    'resume.addSkill': 'Add "{k}" to skills',

    /* ATS panel */
    'resume.ats.title': 'ATS compatibility',
    'resume.ats.safeLayout': 'ATS-safe layout',
    'resume.ats.checksPassed': '{passed} of {total} checks passed',
    'resume.ats.keywordsFor': 'Keywords for {role}',
    'resume.ats.density': 'Keyword density',
    'resume.ats.found': 'Found',
    'resume.ats.missing': 'Missing',

    /* Paper preview */
    'resume.preview.empty': 'Start filling the form — your ATS-safe preview appears here.',

    /* ATS checks (labels + hints, consumed by runAtsChecks) */
    'resume.check.contact.label': 'Contact details',
    'resume.check.contact.hint': 'Add your full name, a valid email and a phone number.',
    'resume.check.summary.label': 'Professional summary',
    'resume.check.summary.hint':
      'Write {min}–{max} characters covering your degree, experience and goals.',
    'resume.check.education.label': 'Education entry',
    'resume.check.education.hint': 'Add at least one education entry with school and degree filled in.',
    'resume.check.actionVerbs.label': 'Action verbs',
    'resume.check.actionVerbs.hint':
      'Start at least {pct}% of bullets with a verb like "developed", "led" or "optimised".',
    'resume.check.quantified.label': 'Quantified impact',
    'resume.check.quantified.hint':
      'Add a number or percentage to a bullet, e.g. "Reduced load time by 35%".',
    'resume.check.skills.label': 'Skills list',
    'resume.check.skills.hint': 'List at least {n} comma-separated skills relevant to your target role.',
    'resume.check.pronouns.label': 'No first-person pronouns',
    'resume.check.pronouns.hint':
      'Remove "I", "me", "my", "we" and "our" — write in implied first person.',
    'resume.check.length.label': 'Resume length',
    'resume.check.length.hintShort':
      'Too thin — aim for {min}–{max} words so parsers have content to index.',
    'resume.check.length.hintLong': 'Too long — trim to under {max} words (about one page).',
  },
  hi: {
    /* Page header & actions */
    'resume.title': 'ATS रिज़्यूमे बिल्डर',
    'resume.subtitle':
      'पार्सर-सुरक्षित, एक-कॉलम रिज़्यूमे बनाएँ। लाइव ATS जाँचें और पद-कीवर्ड आपके टाइप करते ही अपडेट होते हैं — फिर एक साफ़ PDF एक्सपोर्ट करें जिसे कोई भी ट्रैकिंग सिस्टम पढ़ सके।',
    'resume.loadSample': 'नमूना भरें',
    'resume.reset': 'रीसेट',
    'resume.resetConfirm': 'पूरा रिज़्यूमे साफ़ करें? इसे पूर्ववत नहीं किया जा सकता।',
    'resume.exportPdf': 'PDF एक्सपोर्ट करें',

    /* Form section headings */
    'resume.section.contact': 'संपर्क और लक्षित पद',
    'resume.section.summary': 'पेशेवर सारांश',
    'resume.section.education': 'शिक्षा',
    'resume.section.experience': 'अनुभव',
    'resume.section.projects': 'परियोजनाएँ',
    'resume.section.skills': 'कौशल',

    /* Field labels & hints */
    'resume.field.fullName': 'पूरा नाम',
    'resume.field.email': 'ईमेल',
    'resume.field.phone': 'फ़ोन',
    'resume.field.location': 'स्थान',
    'resume.field.links': 'लिंक',
    'resume.field.targetRole': 'लक्षित पद',
    'resume.field.targetRoleHint': 'कीवर्ड सुझावों के लिए उपयोग किया जाता है',
    'resume.field.selectRole': 'पद चुनें…',
    'resume.field.school': 'संस्थान',
    'resume.field.degree': 'डिग्री',
    'resume.field.fieldOfStudy': 'अध्ययन क्षेत्र',
    'resume.field.startYear': 'आरंभ वर्ष',
    'resume.field.endYear': 'समापन वर्ष',
    'resume.field.gpa': 'GPA',
    'resume.field.company': 'कंपनी',
    'resume.field.role': 'पद',
    'resume.field.startDate': 'आरंभ तिथि',
    'resume.field.endDate': 'समापन तिथि',
    'resume.field.achievements': 'उपलब्धियाँ',
    'resume.field.achievementsHint':
      "प्रति पंक्ति एक उपलब्धि। ऐक्शन वर्ब से शुरू करें और प्रभाव संख्याओं में बताएँ (जैसे 'Reduced load time by 35%')।",
    'resume.field.projectName': 'परियोजना का नाम',
    'resume.field.techStack': 'टेक स्टैक',
    'resume.field.description': 'विवरण',
    'resume.field.skillsHint': 'कॉमा से अलग करें — जैसे JavaScript, React, SQL। कम से कम 5 रखने का लक्ष्य रखें।',

    /* Instructional placeholders */
    'resume.ph.location': 'शहर, देश',
    'resume.ph.endYear': '2027 (अपेक्षित)',

    /* Summary card */
    'resume.summaryCount': '{n} / 500',
    'resume.summaryTip': 'अपनी डिग्री, अनुभव के वर्ष और 2–3 कीवर्ड जोड़ें (40+ अक्षर)।',

    /* Entry add/remove buttons */
    'resume.addEducation': 'शिक्षा जोड़ें',
    'resume.addExperience': 'अनुभव जोड़ें',
    'resume.addProject': 'परियोजना जोड़ें',
    'resume.removeEducation': 'शिक्षा प्रविष्टि हटाएँ',
    'resume.removeExperience': 'अनुभव प्रविष्टि हटाएँ',
    'resume.removeProject': 'परियोजना प्रविष्टि हटाएँ',

    /* Empty-section hints */
    'resume.empty.education': 'अभी कोई शिक्षा प्रविष्टि नहीं — पार्सर को कम से कम एक प्रविष्टि चाहिए।',
    'resume.empty.experience': 'इंटर्नशिप, पार्ट-टाइम नौकरियाँ और रिसर्च असिस्टेंटशिप — सभी गिनती में आते हैं।',
    'resume.empty.projects': 'कोर्सवर्क और व्यक्तिगत परियोजनाएँ व्यावहारिक कौशल दिखाती हैं।',

    /* Skill suggestions */
    'resume.suggestedFor': '{role} के लिए सुझाव',
    'resume.addSkill': '"{k}" को कौशल में जोड़ें',

    /* ATS panel */
    'resume.ats.title': 'ATS अनुकूलता',
    'resume.ats.safeLayout': 'ATS-सुरक्षित लेआउट',
    'resume.ats.checksPassed': '{total} में से {passed} जाँचें पास',
    'resume.ats.keywordsFor': '{role} के लिए कीवर्ड',
    'resume.ats.density': 'कीवर्ड घनत्व',
    'resume.ats.found': 'मिले',
    'resume.ats.missing': 'नहीं मिले',

    /* Paper preview */
    'resume.preview.empty': 'फ़ॉर्म भरना शुरू करें — आपका ATS-सुरक्षित पूर्वावलोकन यहाँ दिखेगा।',

    /* ATS checks (labels + hints, consumed by runAtsChecks) */
    'resume.check.contact.label': 'संपर्क विवरण',
    'resume.check.contact.hint': 'अपना पूरा नाम, एक मान्य ईमेल और फ़ोन नंबर जोड़ें।',
    'resume.check.summary.label': 'पेशेवर सारांश',
    'resume.check.summary.hint': 'अपनी डिग्री, अनुभव और लक्ष्य बताते हुए {min}–{max} अक्षर लिखें।',
    'resume.check.education.label': 'शिक्षा प्रविष्टि',
    'resume.check.education.hint': 'कम से कम एक शिक्षा प्रविष्टि जोड़ें, जिसमें संस्थान और डिग्री भरी हों।',
    'resume.check.actionVerbs.label': 'ऐक्शन वर्ब',
    'resume.check.actionVerbs.hint':
      'कम से कम {pct}% बुलेट "developed", "led" या "optimised" जैसे शब्द से शुरू करें।',
    'resume.check.quantified.label': 'संख्यात्मक प्रभाव',
    'resume.check.quantified.hint': 'किसी बुलेट में संख्या या प्रतिशत जोड़ें, जैसे "Reduced load time by 35%"।',
    'resume.check.skills.label': 'कौशल सूची',
    'resume.check.skills.hint': 'लक्षित पद से जुड़े कम से कम {n} कौशल कॉमा से अलग करके लिखें।',
    'resume.check.pronouns.label': 'प्रथम-पुरुष सर्वनाम नहीं',
    'resume.check.pronouns.hint': '"I", "me", "my", "we" और "our" हटाएँ — निहित प्रथम पुरुष में लिखें।',
    'resume.check.length.label': 'रिज़्यूमे की लंबाई',
    'resume.check.length.hintShort':
      'बहुत छोटा — {min}–{max} शब्द रखें ताकि पार्सर के पास इंडेक्स करने हेतु पर्याप्त सामग्री हो।',
    'resume.check.length.hintLong': 'बहुत लंबा — {max} शब्दों से कम करें (लगभग एक पृष्ठ)।',
  },
}
