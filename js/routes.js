/* BlueZone route map: old "#/..." routes -> real, indexable HTML pages.
   Used by the browser (pro.js: link fixing + old-link redirect) and by tools/prerender.js (build).
   To rename a page URL, change it here and run:  node tools/prerender.js  */
(function (g) {
  var R = {
    '': 'index.html',
    'home': 'index.html',
    'contact': 'contact.html',
    'blog': 'blog.html',

    /* countries */
    'uk': 'study-in-uk.html',
    'p/uk': 'study-in-uk.html',
    'p/australia': 'study-in-australia.html',
    'p/canada': 'study-in-canada.html',
    'p/usa': 'study-in-usa.html',
    'p/new-zealand': 'study-in-new-zealand.html',
    'p/ireland': 'study-in-ireland.html',
    'p/malaysia': 'study-in-malaysia.html',
    'p/china': 'study-in-china.html',
    'p/uae': 'study-in-dubai-uae.html',
    'p/italy': 'study-in-italy.html',
    'p/france': 'study-in-france.html',
    'p/south-korea': 'study-in-south-korea.html',
    'p/cyprus': 'study-in-cyprus.html',
    'p/lithuania': 'study-in-lithuania.html',

    /* study abroad steps */
    'p/steps': 'study-abroad-steps.html',
    'p/why-study-abroad': 'why-study-abroad.html',
    'p/where-what-study': 'where-and-what-to-study.html',
    'p/how-apply': 'how-to-apply-study-abroad.html',
    'p/documents': 'documents-and-attestation-pakistan.html',
    'p/after-offer': 'after-receiving-an-offer.html',
    'p/prepare-depart': 'prepare-to-depart.html',
    'p/arrive-thrive': 'arrive-and-thrive-abroad.html',

    /* destinations + courses */
    'p/destinations': 'study-destinations.html',
    'p/courses': 'find-a-course.html',
    'p/course-advice': 'course-advice.html',
    'p/scholarships': 'scholarships-for-pakistani-students.html',
    'p/universities': 'find-a-university.html',
    'p/rankings': 'university-rankings-guide.html',

    /* IELTS */
    'p/ielts': 'ielts-in-pakistan.html',
    'p/what-is-ielts': 'what-is-ielts.html',
    'p/ielts-prep': 'ielts-preparation-plan.html',
    'p/book-test': 'book-ielts-test-pakistan.html',
    'p/english-tests': 'ielts-vs-pte-vs-toefl.html',

    /* student essentials */
    'p/essentials': 'student-essentials.html',
    'p/education-loan': 'education-loan-for-study-abroad.html',
    'p/health-insurance': 'student-health-insurance-abroad.html',
    'p/money-transfer': 'money-transfer-for-students.html',
    'p/accommodation': 'student-accommodation-abroad.html',
    'p/banking': 'student-banking-abroad.html',
    'p/guardianship': 'guardianship-for-minor-students.html',
    'p/sim-card': 'sim-card-for-students-abroad.html',

    /* blog articles */
    'blog/ielts-fees-pakistan-2026': 'blog-ielts-fees-pakistan-2026.html',
    'blog/hec-online-attestation-2026': 'blog-hec-online-attestation-2026.html',
    'blog/chevening-2027-deadline': 'blog-chevening-2027-deadline.html',
    'blog/uk-graduate-route-2027': 'blog-uk-graduate-route-2027.html',
    'blog/new-toefl-scale-2026': 'blog-new-toefl-scale-2026.html',
    'blog/sop': 'blog-statement-of-purpose.html',
    'blog/ielts-pte': 'blog-ielts-or-pte.html',
    'blog/visa-mistakes': 'blog-student-visa-document-mistakes.html',
    'blog/scholarships': 'blog-find-scholarships-for-masters.html',
    'blog/first-month': 'blog-first-month-abroad-checklist.html'
  };

  /* "#/p/steps" -> "study-abroad-steps.html"; anything unknown -> null */
  function file(hash) {
    var k = String(hash || '').replace(/^#\/?/, '').replace(/\/+$/, '');
    return Object.prototype.hasOwnProperty.call(R, k) ? R[k] : null;
  }

  var api = { map: R, file: file };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else g.BZR = api;
})(typeof window !== 'undefined' ? window : this);
