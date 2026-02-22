// src/data/mockData.js
// Centralized mock data for NeuroVoice AI

export const LANGUAGES = [
    {
        code: 'en',
        name: 'English',
        native: 'English',
        flag: '🇬🇧',
        prompt: 'Sustain "aaaaaah" for 10s, then read: "The rainbow is a division of white light into many beautiful colors."'
    },
    {
        code: 'hi',
        name: 'Hindi',
        native: 'हिन्दी',
        flag: '🇮🇳',
        prompt: '10 सेकंड के लिए "आआआआह" कहें, फिर पढ़ें: "इंद्रधनुष सफेद प्रकाश का अनेक सुंदर रंगों में विभाजन है।"'
    },
    {
        code: 'kn',
        name: 'Kannada',
        native: 'ಕನ್ನಡ',
        flag: '🇮🇳',
        prompt: '10 ಸೆಕೆಂಡುಗಳ ಕಾಲ "ಆಆಆಆಹ್" ಎಂದು ಹೇಳಿ, ನಂತರ ಓದಿ: "ಮಳೆಬಿಲ್ಲು ಬಿಳಿ ಬೆಳಕನ್ನು ಅನೇಕ ಸುಂದರ ಬಣ್ಣಗಳಾಗಿ ವಿಭಜಿಸುತ್ತದೆ."'
    },
    {
        code: 'te',
        name: 'Telugu',
        native: 'తెలుగు',
        flag: '🇮🇳',
        prompt: '10 సెకన్ల పాటు "ఆఆఆఆహ్" అని చెప్పండి, ఆపై చదవండి: "హరివిల్లు తెల్లని వెలుతురును అనేక అందమైన రంగులుగా విభజిస్తుంది."'
    },
    {
        code: 'es',
        name: 'Spanish',
        native: 'Español',
        flag: '🇪🇸',
        prompt: 'Mantenga "aaaaaah" durante 10 segundos, luego lea: "El arcoíris es una división de la luz blanca en muchos colores hermosos."'
    },
    {
        code: 'ta',
        name: 'Tamil',
        native: 'தமிழ்',
        flag: '🇮🇳',
        prompt: '10 விநாடிகளுக்கு "ஆஆஆஆஹ்" என்று சொல்லுங்கள், பின்னர் படியுங்கள்: "வானவில் என்பது வெண்ணிற ஒளியை பல அழகான வண்ணங்களாக பிரிப்பதாகும்."'
    },
];

export const NEUROLOGISTS = [
    {
        id: 1,
        name: 'Dr. Sanjiv C C',
        specialty: 'Neurologist — Movement Disorders (NIMHANS)',
        hospital: 'Dr. Sanjiv C C Clinic, Bengaluru',
        rating: 4.9,
        reviews: 412,
        distance: '0.8 km',
        available: ['Mon Feb 23', 'Wed Feb 25', 'Fri Feb 27'],
        fee: '₹1000',
        externalUrl: 'https://www.practo.com/bangalore/doctor/dr-sanjiv-c-c-neurologist'
    },
    {
        id: 2,
        name: 'Dr. Prashanth L.K.',
        specialty: 'Movement Disorders Specialist (NIMHANS)',
        hospital: 'Manipal Hospital Millers Road, Bengaluru',
        rating: 4.9,
        reviews: 350,
        distance: '2.4 km',
        available: ['Tue Feb 24', 'Thu Feb 26', 'Sat Feb 28'],
        fee: '₹1200',
        externalUrl: 'https://www.practo.com/bangalore/doctor/dr-prashanth-l-k-neurologist'
    },
    {
        id: 3,
        name: 'Dr. P R Krishnan',
        specialty: 'Neurologist — Parkinson\'s & Memory Disorders',
        hospital: 'Fortis Hospital, Bengaluru',
        rating: 4.8,
        reviews: 215,
        distance: '3.7 km',
        available: ['Mon Feb 23', 'Tue Feb 24', 'Thu Feb 26'],
        fee: '₹950',
        externalUrl: 'https://www.practo.com/bangalore/doctor/dr-p-r-krishnan-neurologist'
    },
    {
        id: 4,
        name: 'Dr. Abhinav Raina',
        specialty: 'Senior Consultant Neurologist',
        hospital: 'Manipal Hospital, Bengaluru',
        rating: 4.7,
        reviews: 180,
        distance: '4.2 km',
        available: ['Wed Feb 25', 'Fri Feb 27', 'Mon Mar 2'],
        fee: '₹1100',
        externalUrl: 'https://www.practo.com/bangalore/doctor/dr-abhinav-raina-neurologist'
    },
];

export const ACHIEVEMENTS = [
    { id: 'first_scan', emoji: '🎯', name: 'First Scan', desc: 'Complete your first voice analysis', xp: 50, earned: true },
    { id: 'streak_3', emoji: '🔥', name: '3-Day Streak', desc: 'Record 3 days in a row', xp: 100, earned: true },
    { id: 'streak_7', emoji: '🏆', name: 'Week Warrior', desc: 'Maintain a 7-day streak', xp: 250, earned: false },
    { id: 'multilingual', emoji: '🌐', name: 'Polyglot', desc: 'Record in 3+ languages', xp: 150, earned: false },
    { id: 'wearable', emoji: '⌚', name: 'Bionic', desc: 'Connect a wearable device', xp: 200, earned: false },
    { id: 'share_doc', emoji: '🩺', name: 'Doctor Ready', desc: 'Export your health report', xp: 75, earned: true },
    { id: 'streak_30', emoji: '💎', name: 'Diamond Mind', desc: '30-day unbroken streak', xp: 1000, earned: false },
    { id: 'friend_refer', emoji: '🤝', name: 'Health Advocate', desc: 'Refer a family member', xp: 120, earned: false },
];

export const DAILY_HISTORY = [
    { day: 'Feb 14', score: 82, risk: 'Low', pitch: 195, shimmer: 2.1 },
    { day: 'Feb 15', score: 79, risk: 'Low', pitch: 198, shimmer: 2.4 },
    { day: 'Feb 16', score: 74, risk: 'Low', pitch: 202, shimmer: 2.8 },
    { day: 'Feb 17', score: 71, risk: 'Medium', pitch: 188, shimmer: 3.5 },
    { day: 'Feb 18', score: 68, risk: 'Medium', pitch: 183, shimmer: 3.9 },
    { day: 'Feb 19', score: 73, risk: 'Low', pitch: 191, shimmer: 2.7 },
    { day: 'Feb 20', score: 76, risk: 'Low', pitch: 194, shimmer: 2.6 },
];

export const WEARABLE_DATA = {
    heartRate: 72,
    hrv: 48,
    handTremorG: 0.08,
    stepCount: 6240,
    sleepHrs: 6.8,
    spO2: 97,
    lastSync: '2m ago',
    device: 'Apple Watch Ultra',
};

export const AI_TIPS = {
    en: [
        'Hold the phone ~10cm from your mouth (steady distance).',
        'Speak in a quiet room — background noise masks vocal markers.',
        'Say a sustained "AAAAAHHHHH" for the full duration.',
    ],
    hi: [
        'सर्वोत्तम परिणामों के लिए शांत वातावरण में बोलें।',
        'माइक्रोफ़ोन से ~20 सेमी की स्थिर दूरी बनाए रखें।',
        'रिकॉर्ड करने से पहले अपना जबड़ा ढीला करें।',
    ],
    kn: [
        'ಉತ್ತಮ ಫಲಿತಾಂಶಗಳಿಗಾಗಿ ಶಾಂತ ಪರಿಸರದಲ್ಲಿ ಮಾತನಾಡಿ.',
        'ಮೈಕ್ರೊಫೋನ್‌ನಿಂದ ~20 ಸೆಂ.ಮಿ. ಸ್ಥಿರ ಅಂತರ ಕಾಪಾಡಿಕೊಳ್ಳಿ.',
        'ರೆಕಾರ್ಡ್ ಮಾಡುವ ಮೊದಲು ನಿಮ್ಮ ದವಡೆಯನ್ನು ಸಡಿಲಿಸಿ.',
    ],
    te: [
        'అత్యుత్తమ ఫలితాల కోసం నిశ్శబ్ద వాతావరణంలో మాట్లాడండి.',
        'మైక్రోఫోన్ నుండి ~20సెం.మీ స్థిర దూరం నిర్వహించండి.',
        'రికార్డ్ చేయడానికి ముందు మీ దవడను రిలాక్స్ చేయండి.',
    ],
    es: [
        'Hable en un ambiente tranquilo para mejores resultados.',
        'Mantenga una distancia constante de ~20 cm del micrófono.',
        'Relaje la mandíbula antes de grabar.',
    ],
    ta: [
        'சிறந்த முடிவுகளுக்கு அமைதியான சூழலில் பேசுங்கள்.',
        'மைக்ரோஃபோனிலிருந்து ~20 செமீ நிலையான தூரத்தை பராமரிக்கவும்.',
        'பதிவு செய்வதற்கு முன் உங்கள் தாடையை ரிலாக்ஸ் செய்யுங்கள்.',
    ],
};
