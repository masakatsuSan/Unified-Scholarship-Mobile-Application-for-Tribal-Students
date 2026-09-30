import { NotificationEventType, NotificationRecord, SupportedLanguage } from '../types/index.ts';

export interface NotificationTemplateDefinition {
  title: Record<string, string>;
  inAppBody: Record<string, string>;
  smsText: Record<string, string>;
  smsDltHeader: string;
  smsDltTemplateId: string;
  whatsAppText: Record<string, string>;
  whatsAppTemplateId: string;
  whatsAppButtons: string[];
}

export const NOTIFICATION_TEMPLATES: Record<NotificationEventType, NotificationTemplateDefinition> = {
  DBT_DISBURSED: {
    smsDltHeader: 'AX-MOTAGOI',
    smsDltTemplateId: '1407168923412098471',
    whatsAppTemplateId: 'mota_dbt_disbursement_v2',
    whatsAppButtons: ['View Passbook & UTR', 'Report Issue'],
    title: {
      en: 'DBT Scholarship Credit Confirmed',
      hi: 'डीबीटी छात्रवृत्ति राशि खाते में जमा',
      or: 'ଡିବିଟି ଛାତ୍ରବୃତ୍ତି ରାଶି ଜମା ହୋଇଛି',
      bn: 'ডিবিটি স্কলারশিপ ক্রেডিট সম্পন্ন হয়েছে',
      mr: 'डीबीटी शिष्यवृत्ती रक्कम खात्यात जमा',
      sat: 'DBT ᱥᱠᱚᱞᱟᱨᱥᱤᱯ ᱴᱟᱠᱟ ᱵᱮᱸᱠ ᱨᱮ ᱵᱚᱞᱚᱭᱮᱱᱟ',
      gon: 'DBT छात्रवृत्ति रुपीया बैंक ते जमा जाथा',
    },
    inAppBody: {
      en: 'Direct Benefit Transfer of ₹{amount} has been successfully credited to your Aadhaar-seeded {bankName} account (UTR: {utrNumber}).',
      hi: 'प्रत्यक्ष लाभ अंतरण (DBT) के तहत ₹{amount} की राशि आपके आधार-सीडेड {bankName} खाते में सफलतापूर्वक जमा हो गई है (UTR: {utrNumber})।',
      or: 'ପ୍ରତ୍ୟକ୍ଷ ଲାଭ ହସ୍ତାନ୍ତର (DBT) ଅଧୀନରେ ₹{amount} ଆପଣଙ୍କ ଆଧାର ସିଡେଡ୍ {bankName} ଆକାଉଣ୍ଟରେ ସଫଳତାର ସହ ଜମା ହୋଇଛି (UTR: {utrNumber})।',
      bn: 'সরাসরি সুবিধা হস্তান্তর (DBT) এর মাধ্যমে ₹{amount} আপনার আধার-সংযুক্ত {bankName} অ্যাকাউন্টে জমা হয়েছে (UTR: {utrNumber})।',
      mr: 'थेट लाभ हस्तांतरण (DBT) अंतर्गत ₹{amount} ची रक्कम आपल्या आधार-संलग्न {bankName} खात्यात यशस्वीरित्या जमा झाली आहे (UTR: {utrNumber}).',
      sat: 'DBT ᱞᱮᱠᱟᱛᱮ ₹{amount} ᱴᱟᱠᱟ ᱟᱢᱟᱜ ᱟᱫᱷᱟᱨ-ᱡᱚᱲᱟᱣ {bankName} ᱠᱷᱟᱛᱟ ᱨᱮ ᱡᱚᱢᱟ ᱮᱱᱟ (UTR: {utrNumber})।',
      gon: 'DBT नाल ₹{amount} नीवा आधार-लिंक {bankName} खाता ते जमा जाथा (UTR: {utrNumber})।',
    },
    smsText: {
      en: 'MoTA GOI: Dear {studentName}, ₹{amount} for {schemeName} credited to your Aadhaar-linked {bankName} a/c on {date}. UTR: {utrNumber}. - MoTA Tribal Affairs',
      hi: 'MoTA GOI: प्रिय {studentName}, {schemeName} हेतु ₹{amount} आपके आधार-लिंक {bankName} खाते में जमा किए गए हैं। UTR: {utrNumber}. - जनजातीय कार्य मंत्रालय',
      or: 'MoTA GOI: ପ୍ରିୟ {studentName}, {schemeName} ପାଇଁ ₹{amount} ଆପଣଙ୍କ {bankName} ଆକାଉଣ୍ଟରେ ଜମା ହୋଇଛି। UTR: {utrNumber}. - ମୋଟା ଜନଜାତି ବ୍ୟାପାର ମନ୍ତ୍ରଣାଳୟ',
      bn: 'MoTA GOI: প্রিয় {studentName}, {schemeName} বাবদ ₹{amount} আপনার {bankName} অ্যাকাউন্টে জমা হয়েছে। UTR: {utrNumber}. - উপজাতি বিষয়ক মন্ত্রক',
      mr: 'MoTA GOI: प्रिय {studentName}, {schemeName} साठी ₹{amount} आपल्या {bankName} खात्यात जमा झाले आहेत. UTR: {utrNumber}. - आदिवासी कार्य मंत्रालय',
      sat: 'MoTA GOI: ᱫᱩᱞᱟᱹᱲ {studentName}, {schemeName} ᱞᱟᱹᱜᱤᱫ ₹{amount} ᱟᱢᱟᱜ {bankName} ᱠᱷᱟᱛᱟ ᱨᱮ ᱡᱚᱢᱟ ᱮᱱᱟ। UTR: {utrNumber}।',
      gon: 'MoTA GOI: जोहार {studentName}, {schemeName} बार ₹{amount} नीवा {bankName} खाता ते जमा जाथा। UTR: {utrNumber}।',
    },
    whatsAppText: {
      en: '🏛️ *Government of India | Ministry of Tribal Affairs*\n\nDear *{studentName}*,\n\nWe are pleased to inform you that scholarship installment of *₹{amount}* has been successfully credited via PFMS / Aadhaar Payment Bridge.\n\n• *Scheme:* {schemeName}\n• *Bank:* {bankName}\n• *UTR / Reference:* `{utrNumber}`\n• *Aadhaar Seeding Status:* Active ✅\n\nYou may view your digital payment receipt inside ST Scholarship Saathi app.',
      hi: '🏛️ *भारत सरकार | जनजातीय कार्य मंत्रालय*\n\nप्रिय *{studentName}*,\n\nहर्ष के साथ सूचित किया जाता है कि छात्रवृत्ति की किस्त *₹{amount}* PFMS / आधार पेमेंट ब्रिज द्वारा आपके खाते में अंतरित कर दी गई है।\n\n• *योजना:* {schemeName}\n• *बैंक:* {bankName}\n• *UTR / संदर्भ संख्या:* `{utrNumber}`\n• *आधार सीडिंग स्थिति:* सक्रिय ✅\n\nआप ST Scholarship Saathi ऐप में डिजिटल भुगतान रसीद देख सकते हैं।',
      or: '🏛️ *ଭାରତ ସରକାର | ଜନଜାତି ବ୍ୟାପାର ମନ୍ତ୍ରଣାଳୟ*\n\nପ୍ରିୟ *{studentName}*,\n\nଆପଣଙ୍କ ଛାତ୍ରବୃତ୍ତି କିସ୍ତି *₹{amount}* PFMS ମାଧ୍ୟମରେ ଆପଣଙ୍କ ବ୍ୟାଙ୍କ ଖାତାରେ ସଫଳତାର ସହ ଜମା ହୋଇଛି।\n\n• *ଯୋଜନା:* {schemeName}\n• *ବ୍ୟାଙ୍କ:* {bankName}\n• *UTR:* `{utrNumber}`\n• *ସ୍ଥିତି:* ସକ୍ରିୟ ✅',
      bn: '🏛️ *ভারত সরকার | উপজাতি বিষয়ক মন্ত্রক*\n\nপ্রিয় *{studentName}*,\n\nআপনার স্কলারশিপের কিস্তি *₹{amount}* PFMS-এর মাধ্যমে আপনার অ্যাকাউন্টে সফলভাবে জমা হয়েছে।\n\n• *প্রকল্প:* {schemeName}\n• *ব্যাংক:* {bankName}\n• *UTR:* `{utrNumber}`',
      mr: '🏛️ *भारत सरकार | आदिवासी कार्य मंत्रालय*\n\nप्रिय *{studentName}*,\n\nआपल्या शिष्यवृत्तीचा हप्ता *₹{amount}* PFMS द्वारे खात्यात जमा झाला आहे.\n\n• *योजना:* {schemeName}\n• *बँक:* {bankName}\n• *UTR:* `{utrNumber}`',
      sat: '🏛️ *ᱥᱤᱧᱚᱛ ᱥᱚᱨᱠᱟᱨ | ᱟᱹᱫᱤᱵᱟᱹᱥᱤ ᱠᱟᱹᱢᱤᱦᱚᱨᱟ ᱢᱚᱱᱛᱨᱟᱲᱚᱭ*\n\nᱫᱩᱞᱟᱹᱲ *{studentName}*,\n\nᱟᱢᱟᱜ ᱥᱠᱚᱞᱟᱨᱥᱤᱯ ᱴᱟᱠᱟ *₹{amount}* ᱵᱮᱸᱠ ᱨᱮ ᱵᱚᱞᱚᱭᱮᱱᱟ।\n• *ᱡᱚᱡᱚᱱᱟ:* {schemeName}\n• *UTR:* `{utrNumber}`',
      gon: '🏛️ *भारत सरकार | जनजातीय कार्य मंत्रालय*\n\nजोहार *{studentName}*,\n\nनीवा छात्रवृत्ति रुपीया *₹{amount}* बैंक ते जमा जाथा।\n• *योजना:* {schemeName}\n• *UTR:* `{utrNumber}`',
    },
  },

  DWO_CORRECTION_REQUESTED: {
    smsDltHeader: 'JM-NSPST',
    smsDltTemplateId: '1407168923412098472',
    whatsAppTemplateId: 'mota_dwo_correction_notice',
    whatsAppButtons: ['Upload Document', 'Contact Helpdesk'],
    title: {
      en: 'Action Required: DWO Correction Request',
      hi: 'कार्रवाई आवश्यक: जिला कल्याण अधिकारी (DWO) सुधार सूचना',
      or: 'କାର୍ଯ୍ୟାନୁଷ୍ଠାନ ଆବଶ୍ୟକ: DWO ସଂଶୋଧନ ସୂଚନା',
      bn: 'জরুরী: DWO সংশোধন নোটিশ',
      mr: 'तातडीची कारवाई: DWO दुरुस्ती सूचना',
      sat: 'ᱞᱟᱹᱠᱛᱤᱭᱟᱱ ᱠᱟᱹᱢᱤ: DWO ᱥᱩᱫᱷᱨᱟᱹᱣ ᱱᱚᱴᱤᱥ',
      gon: 'ज़रूरी काम: DWO सुधार नोटिस',
    },
    inAppBody: {
      en: 'District Welfare Officer has requested a clarification on your application {applicationNumber}. Please resolve the pending deficiency before {deadline} to avoid processing delays.',
      hi: 'जिला कल्याण अधिकारी ने आपके आवेदन {applicationNumber} पर स्पष्टीकरण मांगा है। प्रक्रिया में देरी से बचने के लिए कृपया {deadline} से पहले आवश्यक दस्तावेज अपलोड करें।',
      or: 'ଜିଲ୍ଲା କଲ୍ୟାଣ ଅଧିକାରୀ (DWO) ଆପଣଙ୍କ ଆବେଦନ {applicationNumber} ଉପରେ ସଂଶୋଧନ ମାଗିଛନ୍ତି। ଦୟାକରି {deadline} ପୂର୍ବରୁ ସମାଧାନ କରନ୍ତୁ।',
      bn: 'জেলা কল্যাণ আধিকারিক আপনার আবেদন {applicationNumber}-এ নথিপত্র সংশোধনের নির্দেশ দিয়েছেন। বিলম্ব এড়াতে {deadline}-এর মধ্যে আপলোড করুন।',
      mr: 'जिल्हा कल्याण अधिकाऱ्यांनी आपल्या {applicationNumber} अर्जावर दुरुस्ती मागितली आहे. कृपया {deadline} पूर्वी त्रुटी दूर करा.',
      sat: 'DWO ᱟᱢᱟᱜ ᱫᱚᱨᱠᱷᱟᱥᱛ {applicationNumber} ᱨᱮ ᱠᱟᱜᱚᱡᱽ ᱥᱩᱫᱷᱨᱟᱹᱣ ᱮ ᱠᱷᱚᱡᱽ ᱟᱠᱟᱫᱟ। {deadline} ᱞᱟᱦᱟ ᱨᱮ ᱵᱷᱮᱡᱟᱭ ᱢᱮ।',
      gon: 'DWO नीवा आवेदन {applicationNumber} ते कागज सुधारना केंजे मातुर। {deadline} मुने जमा कीम।',
    },
    smsText: {
      en: 'MoTA GOI: Attention {studentName}! DWO raised a non-blocking deficiency on ST App #{applicationNumber}. Action required before {deadline}. Visit Saathi app. - MoTA',
      hi: 'MoTA GOI: ध्यान दें {studentName}! DWO ने छात्रवृत्ति आवेदन #{applicationNumber} पर सुधार मांगा है। अंतिम तिथि {deadline}। Saathi ऐप पर जाएं। - जनजातीय मंत्रालय',
      or: 'MoTA GOI: ଧ୍ୟାନ ଦିଅନ୍ତୁ {studentName}! DWO ଆବେଦନ #{applicationNumber} ପାଇଁ ସଂଶୋଧନ ଚାହିଁଛନ୍ତି। ଶେଷ ତାରିଖ {deadline}। - MoTA',
      bn: 'MoTA GOI: দৃষ্টি আকর্ষণ {studentName}! DWO আবেদন #{applicationNumber}-এ সংশোধন চেয়েছেন। শেষ তারিখ {deadline}। - MoTA',
      mr: 'MoTA GOI: लक्ष द्या {studentName}! DWO ने अर्ज #{applicationNumber} साठी दुरुस्ती मागितली आहे. मुदत {deadline} पर्यंत. - MoTA',
      sat: 'MoTA GOI: ᱫᱷᱮᱭᱟᱱ ᱢᱮ {studentName}! DWO ᱟᱢᱟᱜ ᱟᱨᱫᱟᱥ #{applicationNumber} ᱨᱮ ᱥᱩᱫᱷᱨᱟᱹᱣ ᱮ ᱠᱷᱚᱡᱽ ᱟᱠᱟᱫᱟ। ᱢᱩᱪᱟᱹᱫ ᱢᱟᱦᱟᱸ {deadline}। - MoTA',
      gon: 'MoTA GOI: ध्यान दीम {studentName}! DWO आवेदन #{applicationNumber} ते सुधार केंजे मातुर। आखरी तारीख {deadline}। - MoTA',
    },
    whatsAppText: {
      en: '⚠️ *Non-Blocking Deficiency Notice | MoTA ST Saathi*\n\nDear *{studentName}*,\n\nThe District Welfare Officer (DWO) has reviewed your application *{applicationNumber}* for *{schemeName}*.\n\n• *Remarks:* {dwoRemarks}\n• *Statutory Deadline:* {deadline}\n• *Policy Notice:* Under MoTA non-blocking guidelines, your application is NOT rejected. You have an active window to resubmit valid proofs.\n\nPlease upload the requested certificate directly via ST Saathi DigiLocker sync.',
      hi: '⚠️ *गैर-अवरोधक सुधार सूचना | जनजातीय कार्य मंत्रालय*\n\nप्रिय *{studentName}*,\n\nजिला कल्याण अधिकारी (DWO) ने *{schemeName}* हेतु आपके आवेदन *{applicationNumber}* की समीक्षा की है।\n\n• *अधिकारी टिप्पणी:* {dwoRemarks}\n• *सुधार की अंतिम तिथि:* {deadline}\n• *मंत्रालय नियम:* MoTA नीति के अनुसार आवेदन रद्द नहीं हुआ है। आप समय-सीमा के भीतर संशोधन कर सकते हैं।\n\nकृपया ST Saathi ऐप में डिजीलॉकर द्वारा तुरंत प्रमाण पत्र संलग्न करें।',
      or: '⚠️ *ସଂଶୋଧନ ସୂଚନା | MoTA ST Saathi*\n\nପ୍ରିୟ *{studentName}*,\n\nDWO ଆପଣଙ୍କ ଆବେଦନ *{applicationNumber}* ଯାଞ୍ଚ କରିଛନ୍ତି।\n• *ଟିପ୍ପଣୀ:* {dwoRemarks}\n• *ଶେଷ ତାରିଖ:* {deadline}',
      bn: '⚠️ *সংশোধন বিজ্ঞপ্তি | MoTA ST Saathi*\n\nপ্রিয় *{studentName}*,\n\nDWO আপনার আবেদন *{applicationNumber}* যাচাই করেছেন।\n• *মন্তব্য:* {dwoRemarks}\n• *শেষ তারিখ:* {deadline}',
      mr: '⚠️ *दुरुस्ती सूचना | MoTA ST Saathi*\n\nप्रिय *{studentName}*,\n\nDWO ने आपल्या *{applicationNumber}* अर्जाची तपासणी केली आहे.\n• *शेरा:* {dwoRemarks}\n• *शेवटची तारीख:* {deadline}',
      sat: '⚠️ *ᱥᱩᱫᱷᱨᱟᱹᱣ ᱱᱚᱴᱤᱥ | MoTA ST Saathi*\n\nᱫᱩᱞᱟᱹᱲ *{studentName}*,\n\nDWO ᱟᱢᱟᱜ ᱟᱨᱫᱟᱥ *{applicationNumber}* ᱮ ᱧᱮᱞ ᱠᱮᱫᱟ।\n• *ᱚᱞ:* {dwoRemarks}\n• *ᱢᱩᱪᱟᱹᱫ ᱢᱟᱦᱟᱸ:* {deadline}',
      gon: '⚠️ *सुधार नोटिस | MoTA ST Saathi*\n\nजोहार *{studentName}*,\n\nDWO नीवा आवेदन *{applicationNumber}* ता जांच कीतुर।\n• *टिप्पणी:* {dwoRemarks}\n• *तारीख:* {deadline}',
    },
  },

  APPLICATION_SUBMITTED: {
    smsDltHeader: 'AX-MOTAGOI',
    smsDltTemplateId: '1407168923412098473',
    whatsAppTemplateId: 'mota_app_submission_ack',
    whatsAppButtons: ['Track Live Timeline', 'Download Receipt'],
    title: {
      en: 'Application Submitted Successfully',
      hi: 'छात्रवृत्ति आवेदन सफलतापूर्वक जमा हुआ',
      or: 'ଆବେଦନ ସଫଳତାର ସହ ଦାଖଲ ହେଲା',
      bn: 'আবেদন সফলভাবে জমা হয়েছে',
      mr: 'शिष्यवृत्ती अर्ज यशस्वीरित्या सादर झाला',
      sat: 'ᱟᱨᱫᱟᱥ ᱥᱟᱹᱛ ᱮᱱᱟ',
      gon: 'आवेदन जमा जाथा',
    },
    inAppBody: {
      en: 'Your scholarship application {applicationNumber} for {schemeName} has been submitted and forwarded to your Institution Nodal Officer for verification.',
      hi: 'आपका छात्रवृत्ति आवेदन {applicationNumber} ({schemeName}) सफलतापूर्वक जमा हो चुका है और सत्यापन हेतु आपके संस्थान के नोडल अधिकारी को प्रेषित किया गया है।',
      or: 'ଆପଣଙ୍କ ଆବେଦନ {applicationNumber} ସଫଳତାର ସହ ଦାଖଲ ହୋଇଛି ଏବଂ ଶିକ୍ଷାନୁଷ୍ଠାନ ନୋଡାଲ ଅଧିକାରୀଙ୍କ ନିକଟକୁ ପଠାଯାଇଛି।',
      bn: 'আপনার আবেদন {applicationNumber} সফলভাবে জমা হয়েছে এবং শিক্ষা প্রতিষ্ঠান নোডাল অফিসারের কাছে পাঠানো হয়েছে।',
      mr: 'आपला अर्ज {applicationNumber} सादर झाला असून पडताळणीसाठी संस्था नोडल अधिकाऱ्यांकडे पाठवला आहे.',
      sat: 'ᱟᱢᱟᱜ ᱟᱨᱫᱟᱥ {applicationNumber} ᱡᱚᱢᱟ ᱮᱱᱟ ᱟᱨ ᱤᱱᱥᱴᱤᱴᱤᱭᱩᱴ ᱴᱷᱮᱱ ᱵᱷᱮᱡᱟ ᱮᱱᱟ।',
      gon: 'नीवा आवेदन {applicationNumber} जमा जाथा अउर कॉलेज नोडल अफसर लगे रोहतुर।',
    },
    smsText: {
      en: 'MoTA GOI: Dear {studentName}, your ST scholarship application #{applicationNumber} for {schemeName} is submitted. Track on Saathi portal. - MoTA',
      hi: 'MoTA GOI: प्रिय {studentName}, {schemeName} के लिए आपका आवेदन #{applicationNumber} जमा हो गया है। Saathi पोर्टल पर स्थिति देखें। - जनजातीय मंत्रालय',
      or: 'MoTA GOI: ପ୍ରିୟ {studentName}, ଆପଣଙ୍କ ଆବେଦନ #{applicationNumber} ଦାଖଲ ହୋଇଛି। - MoTA',
      bn: 'MoTA GOI: প্রিয় {studentName}, আপনার আবেদন #{applicationNumber} জমা হয়েছে। - MoTA',
      mr: 'MoTA GOI: प्रिय {studentName}, आपला अर्ज #{applicationNumber} सादर झाला आहे. - MoTA',
      sat: 'MoTA GOI: ᱫᱩᱞᱟᱹᱲ {studentName}, ᱟᱢᱟᱜ ᱟᱨᱫᱟᱥ #{applicationNumber} ᱡᱚᱢᱟ ᱮᱱᱟ। - MoTA',
      gon: 'MoTA GOI: जोहार {studentName}, नीवा आवेदन #{applicationNumber} जमा जाथा। - MoTA',
    },
    whatsAppText: {
      en: '✅ *Application Acknowledgement | Ministry of Tribal Affairs*\n\nHello *{studentName}*,\n\nYour scholarship application has been registered on the MoTA Unified Integration Hub.\n\n• *Application No:* `{applicationNumber}`\n• *Scheme:* {schemeName}\n• *Next Step:* Institute Verification within 7 working days\n\nKeep your Aadhaar-linked mobile active for SMS & WhatsApp updates.',
      hi: '✅ *आवेदन पावती | जनजातीय कार्य मंत्रालय*\n\nनमस्ते *{studentName}*,\n\nआपका छात्रवृत्ति आवेदन MoTA यूनिफाइड पोर्टल पर पंजीकृत हो गया है।\n\n• *आवेदन संख्या:* `{applicationNumber}`\n• *योजना:* {schemeName}\n• *अगला चरण:* संस्थान सत्यापन (७ कार्य दिवस)\n\nअपडेट प्राप्त करने हेतु अपना आधार-लिंक्ड मोबाइल चालू रखें।',
      or: '✅ *ଆବେଦନ ପାଉତି | MoTA*\n\nପ୍ରିୟ *{studentName}*,\n\nଆପଣଙ୍କ ଆବେଦନ ପଞ୍ଜୀକୃତ ହୋଇଛି।\n• *ଆବେଦନ ନମ୍ବର:* `{applicationNumber}`\n• *ଯୋଜନା:* {schemeName}',
      bn: '✅ *আবেদন স্বীকৃতি | MoTA*\n\nপ্রিয় *{studentName}*,\n\nআপনার আবেদন নথিভুক্ত হয়েছে।\n• *আবেদন নং:* `{applicationNumber}`\n• *প্রকল্প:* {schemeName}',
      mr: '✅ *अर्ज पोचपावती | MoTA*\n\nप्रिय *{studentName}*,\n\nआपला अर्ज नोंदणीकृत झाला आहे.\n• *अर्ज क्रमांक:* `{applicationNumber}`\n• *योजना:* {schemeName}',
      sat: '✅ *ᱟᱨᱫᱟᱥ ᱥᱟᱹᱵᱩᱛ | MoTA*\n\nᱫᱩᱞᱟᱹᱲ *{studentName}*,\n\nᱟᱢᱟᱜ ᱟᱨᱫᱟᱥ ᱨᱮᱡᱤᱥᱴᱟᱨ ᱮᱱᱟ।\n• *ᱱᱚᱢᱵᱚᱨ:* `{applicationNumber}`',
      gon: '✅ *आवेदन पावती | MoTA*\n\nजोहार *{studentName}*,\n\nनीवा आवेदन दर्ज जाथा।\n• *नंबर:* `{applicationNumber}`',
    },
  },

  DEFICIENCY_RESOLVED: {
    smsDltHeader: 'JM-NSPST',
    smsDltTemplateId: '1407168923412098474',
    whatsAppTemplateId: 'mota_deficiency_cleared',
    whatsAppButtons: ['View Timeline', 'Sanction Letter'],
    title: {
      en: 'Exception Cleared by Welfare Officer',
      hi: 'कल्याण अधिकारी द्वारा सुधार स्वीकार किया गया',
      or: 'କଲ୍ୟାଣ ଅଧିକାରୀଙ୍କ ଦ୍ୱାରା ତ୍ରୁଟି ଦୂର ହେଲା',
      bn: 'কল্যাণ আধিকারিক দ্বারা সংশোধন গৃহীত',
      mr: 'कल्याण अधिकाऱ्यांकडून त्रुटी निवारण पूर्ण',
      sat: 'ᱠᱟᱜᱚᱡᱽ ᱥᱩᱫᱷᱨᱟᱹᱣ ᱥᱟᱹᱛ ᱮᱱᱟ',
      gon: 'सुधार पास जाथा',
    },
    inAppBody: {
      en: 'Great news! Your uploaded document clarification for application {applicationNumber} has been verified and approved by the District Welfare Officer.',
      hi: 'शुभ समाचार! आपके आवेदन {applicationNumber} हेतु प्रस्तुत संशोधन को जिला कल्याण अधिकारी द्वारा सत्यापित एवं स्वीकृत कर लिया गया है।',
      or: 'ଖୁସି ଖବର! ଆପଣଙ୍କ ଆବେଦନ {applicationNumber} ପାଇଁ ଦିଆଯାଇଥିବା ଦସ୍ତାବିଜ DWO ଦ୍ୱାରା ଅନୁମୋଦିତ ହୋଇଛି।',
      bn: 'সুসংবাদ! আপনার আবেদন {applicationNumber}-এর সংশোধিত নথি DWO দ্বারা অনুমোদিত হয়েছে।',
      mr: 'आनंदाची बातमी! आपल्या {applicationNumber} अर्जाचे कागदपत्र DWO कडून मंजूर करण्यात आले आहे.',
      sat: 'ᱨᱟᱹᱥᱠᱟᱹ ᱠᱷᱚᱵᱚᱨ! ᱟᱢᱟᱜ ᱠᱟᱜᱚᱡᱽ DWO ᱦᱚᱛᱮᱛᱮ ᱯᱟᱥ ᱮᱱᱟ।',
      gon: 'बेसम खबर! नीवा दस्तावेज DWO साहब मंजूर कीतुर।',
    },
    smsText: {
      en: 'MoTA GOI: Dear {studentName}, your exception on ST App #{applicationNumber} has been successfully cleared by DWO. Forwarded for sanction. - MoTA',
      hi: 'MoTA GOI: प्रिय {studentName}, आवेदन #{applicationNumber} पर आपका सुधार DWO द्वारा स्वीकृत कर लिया गया है। अब स्वीकृति हेतु अग्रसारित। - जनजातीय मंत्रालय',
      or: 'MoTA GOI: ପ୍ରିୟ {studentName}, ଆପଣଙ୍କ ସଂଶୋଧନ DWO ଦ୍ୱାରା ଗ୍ରହଣ କରାଯାଇଛି। - MoTA',
      bn: 'MoTA GOI: প্রিয় {studentName}, আপনার সংশোধন DWO দ্বারা গৃহীত হয়েছে। - MoTA',
      mr: 'MoTA GOI: प्रिय {studentName}, आपली दुरुस्ती DWO कडून मंजूर करण्यात आली आहे. - MoTA',
      sat: 'MoTA GOI: ᱫᱩᱞᱟᱹᱲ {studentName}, ᱟᱢᱟᱜ ᱠᱟᱜᱚᱡᱽ DWO ᱦᱚᱛᱮᱛᱮ ᱴᱷᱤᱠ ᱮᱱᱟ। - MoTA',
      gon: 'MoTA GOI: जोहार {studentName}, नीवा सुधार मंजूर जाथा। - MoTA',
    },
    whatsAppText: {
      en: '🎉 *Verification Complete | MoTA ST Saathi*\n\nDear *{studentName}*,\n\nThe District Welfare Officer has reviewed and cleared the flagged discrepancy on application *{applicationNumber}*.\n\n• *Status:* Approved & Cleared ✅\n• *Next Stage:* Sanction Order & PFMS DBT Generation\n\nThank you for prompt submission of your verified credentials.',
      hi: '🎉 *सत्यापन सफल | जनजातीय कार्य मंत्रालय*\n\nप्रिय *{studentName}*,\n\nजिला कल्याण अधिकारी ने आपके आवेदन *{applicationNumber}* पर दर्ज आपत्ति का निस्तारण कर इसे स्वीकृत कर दिया है।\n\n• *स्थिति:* स्वीकृत एवं संस्तुत ✅\n• *आगामी चरण:* स्वीकृति आदेश एवं PFMS DBT निर्माण\n\nसटीक दस्तावेज शीघ्र उपलब्ध कराने हेतु धन्यवाद।',
      or: '🎉 *ଯାଞ୍ଚ ସମ୍ପୂର୍ଣ୍ଣ | MoTA*\n\nପ୍ରିୟ *{studentName}*,\n\nDWO ଆପଣଙ୍କ ଆବେଦନ *{applicationNumber}* ଅନୁମୋଦନ କରିଛନ୍ତି।',
      bn: '🎉 *যাচাইকরণ সম্পূর্ণ | MoTA*\n\nপ্রিয় *{studentName}*,\n\nDWO আপনার আবেদন *{applicationNumber}* অনুমোদন করেছেন।',
      mr: '🎉 *पडताळणी पूर्ण | MoTA*\n\nप्रिय *{studentName}*,\n\nDWO ने आपला अर्ज *{applicationNumber}* मंजूर केला आहे.',
      sat: '🎉 *ᱡᱟᱸᱪ ᱯᱩᱨᱟᱹᱣ ᱮᱱᱟ | MoTA*\n\nᱫᱩᱞᱟᱹᱲ *{studentName}*,\n\nDWO ᱟᱢᱟᱜ ᱟᱨᱫᱟᱥ *{applicationNumber}* ᱮ ᱯᱟᱥ ᱠᱮᱫᱟ।',
      gon: '🎉 *सत्यापन पूरा जाथा | MoTA*\n\nजोहार *{studentName}*,\n\nDWO नीवा आवेदन *{applicationNumber}* पास कीतुर।',
    },
  },

  SCHOLARSHIP_SANCTIONED: {
    smsDltHeader: 'AX-MOTAGOI',
    smsDltTemplateId: '1407168923412098475',
    whatsAppTemplateId: 'mota_sanction_order_ready',
    whatsAppButtons: ['Download Sanction PDF', 'View Installments'],
    title: {
      en: 'Scholarship Sanctioned by Ministry',
      hi: 'मंत्रालय द्वारा छात्रवृत्ति स्वीकृत',
      or: 'ମନ୍ତ୍ରଣାଳୟ ଦ୍ୱାରା ଛାତ୍ରବୃତ୍ତି ମଞ୍ଜୁର',
      bn: 'মন্ত্রক কর্তৃক স্কলারশিপ অনুমোদিত',
      mr: 'मंत्रालयाकडून शिष्यवृत्ती मंजूर',
      sat: 'ᱢᱚᱱᱛᱨᱟᱲᱚᱭ ᱦᱚᱛᱮᱛᱮ ᱥᱠᱚᱞᱟᱨᱥᱤᱯ ᱢᱚᱱᱡᱩᱨ ᱮᱱᱟ',
      gon: 'मंत्रालय नाल छात्रवृत्ति मंजूर जाथा',
    },
    inAppBody: {
      en: 'Congratulations! Your scholarship application {applicationNumber} for {schemeName} has been officially sanctioned. DBT payment processing is underway.',
      hi: 'बधाई हो! {schemeName} हेतु आपका छात्रवृत्ति आवेदन {applicationNumber} मंत्रालय द्वारा स्वीकृत हो गया है। DBT भुगतान प्रक्रिया जारी है।',
      or: 'ଅଭିନନ୍ଦନ! ଆପଣଙ୍କ ଛାତ୍ରବୃତ୍ତି ଆବେଦନ {applicationNumber} ମଞ୍ଜୁର ହୋଇଛି। DBT ପ୍ରକ୍ରିୟା ଚାଲିଛି।',
      bn: 'অভিনন্দন! আপনার স্কলারশিপ আবেদন {applicationNumber} অনুমোদিত হয়েছে। DBT প্রক্রিয়া চলছে।',
      mr: 'अभिनंदन! आपला अर्ज {applicationNumber} मंजूर झाला असून DBT प्रक्रिया सुरू आहे.',
      sat: 'ᱥᱟᱨᱦᱟᱣ! ᱟᱢᱟᱜ ᱥᱠᱚᱞᱟᱨᱥᱤᱯ ᱟᱨᱫᱟᱥ {applicationNumber} ᱢᱚᱱᱡᱩᱨ ᱮᱱᱟ।',
      gon: 'बधाई! नीवा छात्रवृत्ति आवेदन {applicationNumber} मंजूर जाथा।',
    },
    smsText: {
      en: 'MoTA GOI: Congratulations {studentName}! ST scholarship #{applicationNumber} sanctioned for {schemeName}. DBT payment will be credited soon. - MoTA',
      hi: 'MoTA GOI: बधाई {studentName}! {schemeName} हेतु छात्रवृत्ति #{applicationNumber} स्वीकृत हो गई है। शीघ्र DBT भुगतान होगा। - जनजातीय मंत्रालय',
      or: 'MoTA GOI: ଅଭିନନ୍ଦନ {studentName}! ଛାତ୍ରବୃତ୍ତି #{applicationNumber} ମଞ୍ଜୁର ହୋଇଛି। - MoTA',
      bn: 'MoTA GOI: অভিনন্দন {studentName}! স্কলারশিপ #{applicationNumber} অনুমোদিত হয়েছে। - MoTA',
      mr: 'MoTA GOI: अभिनंदन {studentName}! शिष्यवृत्ती #{applicationNumber} मंजूर झाली आहे. - MoTA',
      sat: 'MoTA GOI: ᱥᱟᱨᱦᱟᱣ {studentName}! ᱥᱠᱚᱞᱟᱨᱥᱤᱯ #{applicationNumber} ᱢᱚᱱᱡᱩᱨ ᱮᱱᱟ। - MoTA',
      gon: 'MoTA GOI: बधाई {studentName}! छात्रवृत्ति #{applicationNumber} मंजूर जाथा। - MoTA',
    },
    whatsAppText: {
      en: '📜 *Official Sanction Notice | Ministry of Tribal Affairs*\n\nCongratulations *{studentName}*!\n\nYour scholarship under *{schemeName}* has received formal administrative sanction.\n\n• *Sanction Ref:* `{applicationNumber}`\n• *Total Sanctioned Amount:* ₹{amount}\n• *Mode:* 100% Direct Benefit Transfer (DBT) to Aadhaar Bank Account\n\nYou can download the digitally signed Sanction Order anytime from the app.',
      hi: '📜 *स्वीकृति आदेश | जनजातीय कार्य मंत्रालय*\n\nहार्दिक बधाई *{studentName}*!\n\n*{schemeName}* के अंतर्गत आपकी छात्रवृत्ति को विधिवत प्रशासनिक स्वीकृति प्रदान की गई है।\n\n• *स्वीकृति संदर्भ:* `{applicationNumber}`\n• *कुल स्वीकृत राशि:* ₹{amount}\n• *माध्यम:* १००% प्रत्यक्ष लाभ अंतरण (DBT)\n\nआप ऐप से डिजिटल रूप से हस्ताक्षरित स्वीकृति पत्र डाउनलोड कर सकते हैं।',
      or: '📜 *ମଞ୍ଜୁର ଆଦେଶ | MoTA*\n\nଅଭିନନ୍ଦନ *{studentName}*!\n\n*{schemeName}* ଅଧୀନରେ ଆପଣଙ୍କ ଛାତ୍ରବୃତ୍ତି ମଞ୍ଜୁର ହୋଇଛି।\n• *ରାଶି:* ₹{amount}',
      bn: '📜 *অনুমোদন আদেশ | MoTA*\n\nঅভিনন্দন *{studentName}*!\n\n*{schemeName}*-এর অধীনে আপনার স্কলারশিপ অনুমোদিত হয়েছে।\n• *পরিমাণ:* ₹{amount}',
      mr: '📜 *मंजुरी आदेश | MoTA*\n\nअभिनंदन *{studentName}*!\n\n*{schemeName}* अंतर्गत आपली शिष्यवृत्ती मंजूर झाली आहे.\n• *रक्कम:* ₹{amount}',
      sat: '📜 *ᱢᱚᱱᱡᱩᱨ ᱚᱰᱟᱨ | MoTA*\n\nᱥᱟᱨᱦᱟᱣ *{studentName}*!\n\n*{schemeName}* ᱨᱮ ᱟᱢᱟᱜ ᱥᱠᱚᱞᱟᱨᱥᱤᱯ ᱢᱚᱱᱡᱩᱨ ᱮᱱᱟ।\n• *ᱴᱟᱠᱟ:* ₹{amount}',
      gon: '📜 *मंजूरी आदेश | MoTA*\n\nबधाई *{studentName}*!\n\n*{schemeName}* ते नीवा छात्रवृत्ति मंजूर जाथा।\n• *रक्कम:* ₹{amount}',
    },
  },

  RENEWAL_ALERT: {
    smsDltHeader: 'AX-MOTAGOI',
    smsDltTemplateId: '1407168923412098476',
    whatsAppTemplateId: 'mota_renewal_window_open',
    whatsAppButtons: ['One-Click Renew', 'Update Details'],
    title: {
      en: 'Annual Renewal Window Open',
      hi: 'वार्षिक नवीनीकरण विंडो खुली है',
      or: 'ବାର୍ଷିକ ନବୀକରଣ ଖୋଲା ଅଛି',
      bn: 'বার্ষিক পুনর্নবীকরণ উইন্ডো উন্মুক্ত',
      mr: 'वार्षिक नूतनीकरण सुरू झाले आहे',
      sat: 'ᱥᱮᱨᱢᱟᱠᱤᱭᱟᱹ ᱱᱟᱣᱟᱛᱮ ᱮᱛᱚᱦᱚᱵ',
      gon: 'नवीनीकरण विंडो उघड़ी आंद',
    },
    inAppBody: {
      en: 'The renewal portal for {schemeName} is active. Complete your 1-click renewal with APAAR academic sync before {deadline}.',
      hi: '{schemeName} के लिए नवीनीकरण पोर्टल सक्रिय है। छात्रवृत्ति निरंतरता बनाए रखने के लिए {deadline} से पूर्व 1-क्लिक नवीनीकरण पूरा करें।',
      or: '{schemeName} ପାଇଁ ନବୀକରଣ ପୋର୍ଟାଲ ଖୋଲା ଅଛି। {deadline} ପୂର୍ବରୁ ଆବେଦନ କରନ୍ତୁ।',
      bn: '{schemeName}-এর জন্য পুনর্নবীকরণ পোর্টাল সক্রিয় হয়েছে। {deadline}-এর মধ্যে সম্পন্ন করুন।',
      mr: '{schemeName} साठी नूतनीकरण सुरू झाले आहे. {deadline} पूर्वी नूतनीकरण करा.',
      sat: '{schemeName} ᱞᱟᱹᱜᱤᱫ ᱱᱟᱣᱟᱛᱮ ᱮᱛᱚᱦᱚᱵ ᱠᱷᱩᱞᱟᱹ ᱟᱠᱟᱱᱟ। {deadline} ᱞᱟᱦᱟ ᱨᱮ ᱠᱟᱹᱢᱤ ᱢᱮ।',
      gon: '{schemeName} बार नवीनीकरण चालू आंद। {deadline} मुने कीम।',
    },
    smsText: {
      en: 'MoTA GOI: Dear {studentName}, renew your ST scholarship {schemeName} for current AY before {deadline} on ST Saathi app. - MoTA',
      hi: 'MoTA GOI: प्रिय {studentName}, चालू शैक्षणिक वर्ष हेतु {schemeName} का नवीनीकरण {deadline} से पूर्व Saathi ऐप पर करें। - जनजातीय मंत्रालय',
      or: 'MoTA GOI: ପ୍ରିୟ {studentName}, ଆପଣଙ୍କ ଛାତ୍ରବୃତ୍ତି ନବୀକରଣ {deadline} ପୂର୍ବରୁ କରନ୍ତୁ। - MoTA',
      bn: 'MoTA GOI: প্রিয় {studentName}, আপনার স্কলারশিপ পুনর্নবীকরণ {deadline}-এর মধ্যে করুন। - MoTA',
      mr: 'MoTA GOI: प्रिय {studentName}, शिष्यवृत्तीचे नूतनीकरण {deadline} पूर्वी करा. - MoTA',
      sat: 'MoTA GOI: ᱫᱩᱞᱟᱹᱲ {studentName}, ᱟᱢᱟᱜ ᱥᱠᱚᱞᱟᱨᱥᱤᱯ {deadline} ᱞᱟᱦᱟ ᱨᱮ ᱱᱟᱣᱟᱛᱮ ᱮᱛᱚᱦᱚᱵ ᱢᱮ। - MoTA',
      gon: 'MoTA GOI: जोहार {studentName}, नीवा छात्रवृत्ति {deadline} मुने नवीनीकरण कीम। - MoTA',
    },
    whatsAppText: {
      en: '📅 *Scholarship Renewal Alert | MoTA*\n\nDear *{studentName}*,\n\nAnnual renewal for *{schemeName}* is now open.\n\n• *Deadline:* {deadline}\n• *Benefit:* Seamless continuation of tuition fees & monthly maintenance allowances\n\nThanks to APAAR integration, marks and promotion status are fetched automatically.',
      hi: '📅 *छात्रवृत्ति नवीनीकरण सूचना | जनजातीय मंत्रालय*\n\nप्रिय *{studentName}*,\n\n*{schemeName}* हेतु वार्षिक नवीनीकरण प्रक्रिया प्रारंभ हो गई है।\n\n• *अंतिम तिथि:* {deadline}\n• *लाभ:* ट्यूशन शुल्क एवं मासिक भत्तों का निर्बाध भुगतान\n\nAPAAR एकीकरण के कारण अंक एवं पदोन्नति स्वतः सत्यापित हो जाएंगे।',
      or: '📅 *ନବୀକରଣ ସୂଚନା | MoTA*\n\nପ୍ରିୟ *{studentName}*,\n\n*{schemeName}* ପାଇଁ ନବୀକରଣ ଖୋଲିଛି। ଶେଷ ତାରିଖ: {deadline}',
      bn: '📅 *পুনর্নবীকরণ সতর্কতা | MoTA*\n\nপ্রিয় *{studentName}*,\n\n*{schemeName}*-এর জন্য পুনর্নবীকরণ শুরু হয়েছে। শেষ তারিখ: {deadline}',
      mr: '📅 *नूतनीकरण सूचना | MoTA*\n\nप्रिय *{studentName}*,\n\n*{schemeName}* साठी नूतनीकरण सुरू झाले आहे. मुदत: {deadline}',
      sat: '📅 *ᱱᱟᱣᱟᱛᱮ ᱮᱛᱚᱦᱚᱵ ᱱᱚᱴᱤᱥ | MoTA*\n\nᱫᱩᱞᱟᱹᱲ *{studentName}*,\n\n*{schemeName}* ᱱᱟᱣᱟᱛᱮ ᱮᱛᱚᱦᱚᱵ ᱠᱷᱩᱞᱟᱹ ᱮᱱᱟ। ᱢᱩᱪᱟᱹᱫ ᱢᱟᱦᱟᱸ: {deadline}',
      gon: '📅 *नवीनीकरण सूचना | MoTA*\n\nजोहार *{studentName}*,\n\n*{schemeName}* नवीनीकरण चालू आंद। तारीख: {deadline}',
    },
  },

  OUTREACH_NUDGE: {
    smsDltHeader: 'AX-MOTAGOI',
    smsDltTemplateId: '1407168923412098477',
    whatsAppTemplateId: 'mota_tribal_outreach_nudge',
    whatsAppButtons: ['Check Eligibility', 'Claim Scholarship'],
    title: {
      en: 'Coverage Notice: ST Scholarship Available',
      hi: 'सुविधा सूचना: अनुसूचित जनजाति छात्रवृत्ति उपलब्ध',
      or: 'ସୁବିଧା ସୂଚନା: ଅନୁସୂଚିତ ଜନଜାତି ଛାତ୍ରବୃତ୍ତି ଉପଲବ୍ଧ',
      bn: 'বিজ্ঞপ্তি: তপশিলি উপজাতি স্কলারশিপ উপলব্ধ',
      mr: 'सूचना: अनुसूचित जमाती शिष्यवृत्ती उपलब्ध',
      sat: 'ᱵᱟᱰᱟᱭ ᱡᱚᱝ: ST ᱥᱠᱚᱞᱟᱨᱥᱤᱯ ᱧᱟᱢᱚᱜ ᱠᱟᱱᱟ',
      gon: 'सूचना: ST छात्रवृत्ति मिलन लगीं',
    },
    inAppBody: {
      en: 'According to enrolled student records (APAAR #{maskedApaar}), you are eligible for 100% tribal education financial aid under {schemeName}. Apply today before {deadline}.',
      hi: 'नामांकित छात्र रिकॉर्ड (APAAR #{maskedApaar}) के अनुसार आप {schemeName} के तहत शत-प्रतिशत जनजातीय शिक्षा सहायता के पात्र हैं। {deadline} से पूर्व आवेदन करें।',
      or: 'ଛାତ୍ର ରେକର୍ଡ (APAAR #{maskedApaar}) ଅନୁସାରେ ଆପଣ {schemeName} ପାଇଁ ଯୋଗ୍ୟ। {deadline} ପୂର୍ବରୁ ଆବେଦନ କରନ୍ତୁ।',
      bn: 'নথিভুক্ত রেকর্ড (APAAR #{maskedApaar}) অনুযায়ী আপনি {schemeName}-এর যোগ্য। {deadline}-এর পূর্বে আবেদন করুন।',
      mr: 'विद्यार्थी नोंदींनुसार (APAAR #{maskedApaar}) आपण {schemeName} साठी पात्र आहात. {deadline} पूर्वी अर्ज करा.',
      sat: 'ᱚᱞ-ᱵᱤᱞ ᱞᱮᱠᱟᱛᱮ (APAAR #{maskedApaar}) ᱟᱢ {schemeName} ᱧᱟᱢ ᱞᱟᱹᱜᱤᱫ ᱡᱚᱜᱽ ᱠᱟᱱᱟᱢ। {deadline} ᱞᱟᱦᱟ ᱨᱮ ᱟᱨᱫᱟᱥ ᱢᱮ।',
      gon: 'छात्र रिकॉर्ड नाल (APAAR #{maskedApaar}) नीमा {schemeName} बार पात्र आंदित। {deadline} मुने आवेदन कीम।',
    },
    smsText: {
      en: 'MoTA GOI: Enrolled ST student APAAR #{maskedApaar}, you are eligible for 100% tribal aid {schemeName}. Apply on ST Saathi app before {deadline}. - MoTA',
      hi: 'MoTA GOI: नामांकित ST छात्र APAAR #{maskedApaar}, आप {schemeName} छात्रवृत्ति हेतु पात्र हैं। अंतिम तिथि {deadline} से पहले Saathi ऐप पर आवेदन करें। - MoTA',
      or: 'MoTA GOI: ST ଛାତ୍ର APAAR #{maskedApaar}, ଆପଣ {schemeName} ପାଇଁ ଯୋଗ୍ୟ। {deadline} ପୂର୍ବରୁ ଆବେଦନ କରନ୍ତୁ। - MoTA',
      bn: 'MoTA GOI: ST ছাত্র APAAR #{maskedApaar}, আপনি {schemeName}-এর যোগ্য। {deadline}-এর আগে আবেদন করুন। - MoTA',
      mr: 'MoTA GOI: ST विद्यार्थी APAAR #{maskedApaar}, आपण {schemeName} साठी पात्र आहात. मुदत {deadline} पर्यंत. - MoTA',
      sat: 'MoTA GOI: ST ᱯᱟᱹᱴᱷᱩᱣᱟᱹ APAAR #{maskedApaar}, ᱟᱢ {schemeName} ᱧᱟᱢ ᱞᱟᱹᱜᱤᱫ ᱴᱷᱤᱠ ᱜᱮᱭᱟᱢ। {deadline} ᱞᱟᱦᱟ ᱨᱮ ᱟᱨᱫᱟᱥ ᱢᱮ। - MoTA',
      gon: 'MoTA GOI: ST छात्र APAAR #{maskedApaar}, नीमा {schemeName} छात्रवृत्ति बार पात्र आंदित। {deadline} मुने आवेदन कीम। - MoTA',
    },
    whatsAppText: {
      en: '📢 *Tribal Student Outreach Initiative | MoTA GOI*\n\nDear Student (APAAR Ref: *{maskedApaar}*),\n\nOur education coverage registry indicates you are enrolled at *{institutionName}* but have not yet claimed your Government of India ST Scholarship.\n\n• *Scheme Match:* {schemeName}\n• *Benefits:* Full Tuition Waiver + Books + Living Allowance\n• *Closing Date:* {deadline}\n\nDon\'t let financial constraints stop your dreams. Apply in under 5 minutes with zero paperwork.',
      hi: '📢 *जनजातीय छात्र आउटरीच अभियान | भारत सरकार*\n\nप्रिय छात्र (APAAR संदर्भ: *{maskedApaar}*),\n\nशैक्षणिक रिकॉर्ड के अनुसार आप *{institutionName}* में नामांकित हैं किंतु अभी तक छात्रवृत्ति का लाभ नहीं लिया है।\n\n• *उपयुक्त योजना:* {schemeName}\n• *सुविधाएं:* पूर्ण शिक्षण शुल्क छूट + पुस्तकें + रखरखाव भत्ता\n• *अंतिम तिथि:* {deadline}\n\nआर्थिक तंगी को अपनी शिक्षा में बाधा न बनने दें। Saathi ऐप पर शून्य कागजी कार्रवाई के साथ ५ मिनट में आवेदन करें।',
      or: '📢 *ଜନଜାତି ଛାତ୍ର ଅଭିଯାନ | MoTA*\n\nପ୍ରିୟ ଛାତ୍ର (APAAR: *{maskedApaar}*),\n\nଆପଣ *{schemeName}* ପାଇଁ ଯୋଗ୍ୟ। ଶେଷ ତାରିଖ: {deadline}। ଆଜି ହିଁ ଆବେଦନ କରନ୍ତୁ।',
      bn: '📢 *উপজাতি ছাত্র অভিযান | MoTA*\n\nপ্রিয় ছাত্র (APAAR: *{maskedApaar}*),\n\nআপনি *{schemeName}*-এর জন্য যোগ্য। শেষ তারিখ: {deadline}। অবিলম্বে আবেদন করুন।',
      mr: '📢 *आदिवासी विद्यार्थी मोहीम | MoTA*\n\nप्रिय विद्यार्थी (APAAR: *{maskedApaar}*),\n\nआपण *{schemeName}* साठी पात्र आहात. शेवटची तारीख: {deadline}. त्वरित अर्ज करा.',
      sat: '📢 *ᱟᱹᱫᱤᱵᱟᱹᱥᱤ ᱯᱟᱹᱴᱷᱩᱣᱟᱹ ᱚᱵᱷᱤᱡᱟᱱ | MoTA*\n\nᱫᱩᱞᱟᱹᱲ ᱯᱟᱹᱴᱷᱩᱣᱟᱹ (APAAR: *{maskedApaar}*),\n\nᱟᱢ *{schemeName}* ᱧᱟᱢ ᱫᱟᱲᱮᱭᱟᱜ-ᱟᱢ। ᱢᱩᱪᱟᱹᱫ ᱢᱟᱦᱟᱸ: {deadline}।',
      gon: '📢 *जनजातीय छात्र अभियान | MoTA*\n\nजोहार छात्र (APAAR: *{maskedApaar}*),\n\nनीमा *{schemeName}* बार पात्र आंदित। तारीख: {deadline}।',
    },
  },
};

/**
 * Format template with provided variables in designated language
 */
export function renderNotificationTemplate(
  eventType: NotificationEventType,
  lang: string,
  variables: Record<string, string | number | undefined>
): {
  title: string;
  inAppBody: string;
  smsText: string;
  smsDltHeader: string;
  smsDltTemplateId: string;
  whatsAppText: string;
  whatsAppTemplateId: string;
  whatsAppButtons: string[];
} {
  const def = NOTIFICATION_TEMPLATES[eventType] || NOTIFICATION_TEMPLATES.DBT_DISBURSED;
  const langKey = def.title[lang] ? lang : 'en';

  const replaceVars = (text: string) => {
    let res = text;
    Object.entries(variables).forEach(([k, v]) => {
      const valStr = v !== undefined && v !== null ? String(v) : '';
      res = res.replaceAll(`{${k}}`, valStr);
    });
    return res;
  };

  return {
    title: replaceVars(def.title[langKey] || def.title.en),
    inAppBody: replaceVars(def.inAppBody[langKey] || def.inAppBody.en),
    smsText: replaceVars(def.smsText[langKey] || def.smsText.en),
    smsDltHeader: def.smsDltHeader,
    smsDltTemplateId: def.smsDltTemplateId,
    whatsAppText: replaceVars(def.whatsAppText[langKey] || def.whatsAppText.en),
    whatsAppTemplateId: def.whatsAppTemplateId,
    whatsAppButtons: def.whatsAppButtons,
  };
}
