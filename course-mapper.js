/* Course Mapper App (browser build with JSX + React UMD) */
const { useEffect, useMemo, useState } = React;

// === Utilities ==============================================================
const uc = (s) => s.trim().toUpperCase();
const isMeta = (k) => k.startsWith("_");
const norm = (s) =>
  s.toLowerCase().replace(/\s+/g, " ").replace(/\s*[\/,]\s*/g, " / ").trim();

// Persist simple state in localStorage
const useLocal = (key, initial) => {
  const [val, setVal] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  }, [key, val]);
  return [val, setVal];
};

// === Built-in requirement presets (your 5 JSONs) ============================
const WATER_SCIENCE = {"1A":{"_requirement":{"type":"all-categories-required","description":"One course is required from each of the following subjects."},"Chemistry":["CHEM 120"],"Math":["MATH 127"],"Physics":["PHYS 111","PHYS 121"]},"1B":{"_requirement":{"type":"multi-category-limit","description":"Select at least 6 courses from the following 6 categories. No more than 2 courses per category.","min_total_courses":6,"max_per_category":2,"valid_categories":["Biology","Computer Programming","Chemistry","Mathematics","Physics","Statistics"]},"Biology":["BIOL 150","BIOL 165"],"Computer Programming":["CS 115","CS 116","CS 105","CS 106"],"Chemistry":["CHEM 123","CHEM 220","CHEM 264","CHEM 266"],"Mathematics":["MATH 106","MATH 114","MATH 128"],"Physics":["PHYS 112","PHYS 122"],"Statistics":["STAT 202"]},"2A":{"_requirement":{"type":"all-categories-required","description":"One course is required from each of the following 4 categories."},"Field Techniques":["EARTH 390"],"Mineralogy and Petrology":["EARTH 231"],"Sedimentation and Stratigraphy":["EARTH 235"],"Structural Geology":["EARTH 238"]},"2B":{"_requirement":{"type":"subgroup-selection","description":"Select at least 1 and at most 2 courses from each of the 3 subgroups. No more than one course per subject.","min_per_group":1,"max_per_group":2,"max_per_subject":1},"Group 1":{"Geochemistry":["EARTH 221"],"Geophysics":["EARTH 260"]},"Group 2":{"Hydrogeology / Hydrology":["EARTH 458","GEOG 407"],"Engineering Geology":[]},"Group 3":{"Geomorphology or Soil Science":["EARTH 342","GEOG 201"],"Glacial Geology":[],"Remote Sensing / GIS":[]}},"2C":{"_requirement":{"type":"elective-geoscience","description":"Select up to 9 courses relevant to geoscience (2nd year or higher, science credit, and not used to fulfill other categories).","min_total_courses":9,"notes":["Courses from 2A/2B may count here if not used in those requirements.","Advanced versions of 2A/2B topics may also apply.","One course cannot fulfill multiple requirements."]},"Field Techniques":["EARTH 223"],"Hydrology / Hydrogeology":["EARTH 355"],"Earth Systems":["EARTH 444"],"Geochemistry":["EARTH 421"],"Geomorphology / Surficial":["GEOG 453"],"Sedimentology":["EARTH 333"]}};

const HYDROGEOLOGY = {"1A":{"_requirement":{"type":"all-categories-required","description":"One course is required from each of the following subjects."},"Chemistry":["CHEM 120"],"Math":["MATH 127"],"Physics":["PHYS 111","PHYS 121"]},"1B":{"_requirement":{"type":"multi-category-limit","description":"Select at least 6 courses from the following 6 categories. No more than 2 courses per category.","min_total_courses":6,"max_per_category":2,"valid_categories":["Biology","Computer Programming","Chemistry","Mathematics","Physics","Statistics"]},"Biology":["BIOL 120","BIOL 150","BIOL 165","BIOL 240"],"Computer Programming":["CS 115","CS 116","CS 105","CS 106"],"Chemistry":["CHEM 123","CHEM 264","CHEM 266"],"Mathematics":["MATH 106","MATH 114","MATH 128"],"Physics":["PHYS 112","PHYS 122"],"Statistics":["STAT 202"]},"2A":{"_requirement":{"type":"all-categories-required","description":"One course is required from each of the following 4 categories."},"Field Techniques":["EARTH 390"],"Mineralogy and Petrology":["EARTH 231"],"Sedimentation and Stratigraphy":["EARTH 235"],"Structural Geology":["EARTH 238"]},"2B":{"_requirement":{"type":"subgroup-selection","description":"Select at least 1 and at most 2 courses from each of the 3 subgroups. No more than one course per subject.","min_per_group":1,"max_per_group":2,"max_per_subject":1},"Group 1":{"Geochemistry":["EARTH 221"],"Geophysics":["EARTH 260"]},"Group 2":{"Hydrogeology / Hydrology":["EARTH 458"],"Sedimentary Petrology":["EARTH 232"]},"Group 3":{"Geomorphology":["EARTH 342"]}},"2C":{"_requirement":{"type":"elective-geoscience","description":"Select up to 9 courses relevant to geoscience (2nd year or higher, science credit, and not used to fulfill other categories).","min_total_courses":9,"notes":["Courses from 2A/2B may count here if not used in those requirements.","Advanced versions of 2A/2B topics may also apply.","One course cannot fulfill multiple requirements."]},"Field Techniques":["EARTH 223"],"Communication":["EARTH 436A","EARTH 436B"],"Sedimentology":["EARTH 333"],"Hydrology / Hydrogeology":["EARTH 456","EARTH 459"],"Geochemistry":["EARTH 421"],"Geomorphology / Surficial":["EARTH 440"],"Geotechnical":["CIVE 353"]}};

const GEOSCIENCE = {"1A":{"_requirement":{"type":"all-categories-required","description":"One course is required from each of the following subjects."},"Chemistry":["CHEM 120"],"Math":["MATH 127"],"Physics":["PHYS 111","PHYS 121"]},"1B":{"_requirement":{"type":"multi-category-limit","description":"Select at least 6 courses from the following 6 categories. No more than 2 courses per category.","min_total_courses":6,"max_per_category":2,"valid_categories":["Biology","Computer Programming","Chemistry","Mathematics","Physics","Statistics"]},"Biology":["BIOL 150","BIOL 165"],"Computer Programming":["CS 115","CS 116","CS 105","CS 106"],"Chemistry":["CHEM 123","CHEM 264","CHEM 266"],"Mathematics":["MATH 106","MATH 114","MATH 128"],"Physics":["PHYS 112","PHYS 122"],"Statistics":["STAT 202"]},"2A":{"_requirement":{"type":"all-categories-required","description":"One course is required from each of the following 4 categories."},"Field Techniques":["EARTH 390"],"Mineralogy and Petrology":["EARTH 231"],"Sedimentation and Stratigraphy":["EARTH 235"],"Structural Geology":["EARTH 238"]},"2B":{"_requirement":{"type":"subgroup-selection","description":"Select at least 1 and at most 2 courses from each of the 3 subgroups. No more than one course per subject.","min_per_group":1,"max_per_group":2,"max_per_subject":1},"Group 1":{"Geochemistry":["EARTH 221"],"Geophysics":["EARTH 260","EARTH 460"]},"Group 2":{"Hydrogeology / Hydrology":["EARTH 458","GEOG 303","GEOG 407","EARTH 459","CIVE 382","CIVE 486"],"Engineering Geology":["EARTH 438"],"Igneous Petrology":["EARTH 331"],"Metamorphic Petrology":["EARTH 332"],"Sedimentary Petrology":["EARTH 232"]},"Group 3":{"Geomorphology":["EARTH 342","GEOG 201"],"Soil Science":[],"Glacial Geology":[],"Remote Sensing / GIS":[],"Sedimentology":["EARTH 333"]}},"2C":{"_requirement":{"type":"elective-geoscience","description":"Select up to 9 courses relevant to geoscience (2nd year or higher, science credit, and not used to fulfill other categories).","min_total_courses":9,"notes":["Courses from 2A/2B may count here if not used in those requirements.","Advanced versions of 2A/2B topics may also apply.","One course cannot fulfill multiple requirements."]},"Field Techniques":["EARTH 223"],"Communication":["EARTH 436A","EARTH 436B"],"Environmental Assessment":["ERS 215"],"Hydrology / Hydrogeology":["EARTH 355"],"Earth Systems":["EARTH 358","EARTH 444"],"Geochemistry":["EARTH 421"],"Geomorphology / Surficial":["GEOG 453","EARTH 440"],"Sedimentology":["EARTH 333"]}};

const GEOPHYSICS = {"1A":{"_requirement":{"type":"all-categories-required","description":"One course is required from each of the following subjects."},"Chemistry":["CHEM 120"],"Math":["MATH 127"],"Physics":["PHYS 111","PHYS 121"]},"1B":{"_requirement":{"type":"multi-category-limit","description":"Select at least 6 courses from the following 6 categories. No more than 2 courses per category.","min_total_courses":6,"max_per_category":2,"valid_categories":["Biology","Computer Programming","Chemistry","Mathematics","Physics","Statistics"]},"Biology":["BIOL 120","BIOL 150","BIOL 165","BIOL 240"],"Computer Programming":["CS 115","CS 116","CS 105","CS 106"],"Chemistry":["CHEM 123","CHEM 264","CHEM 266"],"Mathematics":["MATH 106","MATH 114","MATH 128"],"Physics":["PHYS 122"],"Statistics":["STAT 202"]},"2A":{"_requirement":{"type":"all-categories-required","description":"One course is required from each of the following 4 categories."},"Field Techniques":["EARTH 390"],"Mineralogy and Petrology":["EARTH 231"],"Sedimentation and Stratigraphy":["EARTH 235"],"Structural Geology":["EARTH 238"]},"2B":{"_requirement":{"type":"subgroup-selection","description":"Select at least 1 and at most 2 courses from each of the 3 subgroups. No more than one course per subject.","min_per_group":1,"max_per_group":2,"max_per_subject":1},"Group 1":{"Geochemistry":["EARTH 221"],"Geophysics":["EARTH 260"]},"Group 2":{"Hydrogeology / Hydrology":["EARTH 458"],"Sedimentary Petrology":["EARTH 232"]},"Group 3":{"Sedimentology":["EARTH 333"]}},"2C":{"_requirement":{"type":"elective-geoscience","description":"Select up to 9 courses relevant to geoscience (2nd year or higher, science credit, and not used to fulfill other categories).","min_total_courses":9,"notes":["Courses from 2A/2B may count here if not used in those requirements.","Advanced versions of 2A/2B topics may also apply.","One course cannot fulfill multiple requirements."]},"Field Techniques":["EARTH 223"],"Communication":["EARTH 436A","EARTH 436B"],"Quantitative Analysis":["EARTH 460"],"Geophysics":["EARTH 461"],"Hydrology / Hydrogeology":["EARTH 355"],"Earth Systems":["EARTH 358","EARTH 444"],"Geochemistry":["EARTH 421"],"Geomorphology / Surficial":["GEOG 453","EARTH 440"],"Resource Geology":["EARTH 471"],"Sedimentology":["EARTH 333"]}};

const GEOLOGY = {"1A":{"_requirement":{"type":"all-categories-required","description":"One course is required from each of the following subjects."},"Chemistry":["CHEM 120"],"Math":["MATH 127"],"Physics":["PHYS 111","PHYS 121"]},"1B":{"_requirement":{"type":"multi-category-limit","description":"Select at least 6 courses from the following 6 categories. No more than 2 courses per category.","min_total_courses":6,"max_per_category":2,"valid_categories":["Biology","Computer Programming","Chemistry","Mathematics","Physics","Statistics"]},"Biology":["BIOL 120","BIOL 150","BIOL 165","BIOL 240"],"Computer Programming":["CS 115","CS 116","CS 105","CS 106"],"Chemistry":["CHEM 123","CHEM 264","CHEM 266"],"Mathematics":["MATH 106","MATH 114","MATH 128"],"Physics":["PHYS 112","PHYS 122"],"Statistics":["STAT 202"]},"2A":{"_requirement":{"type":"all-categories-required","description":"One course is required from each of the following 4 categories."},"Field Techniques":["EARTH 390"],"Mineralogy and Petrology":["EARTH 231"],"Sedimentation and Stratigraphy":["EARTH 235"],"Structural Geology":["EARTH 238"]},"2B":{"_requirement":{"type":"subgroup-selection","description":"Select at least 1 and at most 2 courses from each of the 3 subgroups. No more than one course per subject.","min_per_group":1,"max_per_group":2,"max_per_subject":1},"Group 1":{"Geochemistry":["EARTH 221"],"Geophysics":["EARTH 260"]},"Group 2":{"Igneous Petrology":["EARTH 331"],"Sedimentary Petrology":["EARTH 232"]},"Group 3":{"Geomorphology":["EARTH 342"]}},"2C":{"_requirement":{"type":"elective-geoscience","description":"Select up to 9 courses relevant to geoscience (2nd year or higher, science credit, and not used to fulfill other categories).","min_total_courses":9,"notes":["Courses from 2A/2B may count here if not used in those requirements.","Advanced versions of 2A/2B topics may also apply.","One course cannot fulfill multiple requirements."]},"Field Techniques":["EARTH 223"],"Communication":["EARTH 436A","EARTH 436B"],"Sedimentology":["EARTH 333"],"Earth Systems":["EARTH 358"],"Resource Geology":["EARTH 471"],"Petrology":["EARTH 332"]}};

const DEFAULT_REQS = {
  "Water Science": WATER_SCIENCE,
  "Geoscience": GEOSCIENCE,
  "Geophysics": GEOPHYSICS,
  "Geology": GEOLOGY,
  "Hydrogeology": HYDROGEOLOGY,
};

// === Core evaluator (consistent shapes for all sections) ====================
function evaluateUserCourses(userCourses, requirementData) {
  const completed = {};
  const remaining = {};

  // 1A (all categories required)
  const req1a = requirementData?.["1A"] ?? {};
  const rule1a = req1a?._requirement ?? {};
  if (rule1a?.type === "all-categories-required") {
    const c = {}, r = {};
    Object.entries(req1a).forEach(([cat, list]) => {
      if (isMeta(cat)) return;
      const matched = [...new Set(userCourses.filter((x) => list.includes(x)))];
      if (matched.length) c[cat] = matched;
      else r[cat] = list;
    });
    if (Object.keys(c).length) completed["1A"] = c;
    if (Object.keys(r).length) remaining["1A"] = r;
  }

  // 1B (multi-category with min total)
  const req1b = requirementData?.["1B"] ?? {};
  const rule1b = req1b?._requirement ?? {};
  if (rule1b?.type === "multi-category-limit") {
    const c = {}, r = {};
    let total = 0;
    for (const cat of rule1b.valid_categories || []) {
      const list = req1b?.[cat] || [];
      const matched = userCourses.filter((x) => list.includes(x));
      if (matched.length) {
        const limited = matched.slice(0, rule1b.max_per_category || matched.length);
        c[cat] = limited;
        total += limited.length;
      } else {
        r[cat] = list;                 // show full catalog for categories not yet satisfied
      }
    }
    if (total >= (rule1b.min_total_courses || 0)) completed["1B"] = c;
    else remaining["1B"] = { needed_more_courses: (rule1b.min_total_courses || 0) - total, remaining_by_category: r };
  }

  // 2A (all categories required)
  const req2a = requirementData?.["2A"] ?? {};
  const rule2a = req2a?._requirement ?? {};
  if (rule2a?.type === "all-categories-required") {
    const c = {}, r = {};
    Object.entries(req2a).forEach(([cat, list]) => {
      if (isMeta(cat)) return;
      const matched = [...new Set(userCourses.filter((x) => list.includes(x)))];
      if (matched.length) c[cat] = matched;
      else r[cat] = list;
    });
    completed["2A"] = c;
    if (Object.keys(r).length) remaining["2A"] = r;
  }

  // 2B (subgroup-selection) — make shape consistent:
  // Completed: flat keys "Group N — Subject": [matched]
  // Remaining: flat keys "Group N — Subject": [FULL subject list], only for subjects not yet satisfied
  const req2b = requirementData?.["2B"] ?? {};
  const rule2b = req2b?._requirement ?? {};
  if (rule2b?.type === "subgroup-selection") {
    const c = {};
    const r = {};
    const groupNames = Object.keys(req2b).filter((g) => !isMeta(g));

    for (const groupName of groupNames) {
      const group = req2b[groupName] || {};
      // count how many we credited in this group (respect max_per_subject & max_per_group)
      let count = 0;
      const creditedSubjects = new Set();

      // First pass: credit subjects if user has any of the courses (limit per group/subject)
      for (const [subject, list] of Object.entries(group)) {
        if (count >= (rule2b.max_per_group || Infinity)) break;
        const matched = userCourses.filter((x) => list.includes(x));
        if (matched.length) {
          const limited = matched.slice(0, rule2b.max_per_subject || matched.length);
          if (limited.length && count < (rule2b.max_per_group || Infinity)) {
            const key = `${groupName} — ${subject}`;
            c[key] = limited;
            creditedSubjects.add(subject);
            count += limited.length; // (in your data this is effectively +1)
          }
        }
      }

      // If group not yet at minimum, expose the remaining subjects with their FULL catalogs
      if (count < (rule2b.min_per_group || 0)) {
        for (const [subject, list] of Object.entries(group)) {
          if (creditedSubjects.has(subject)) continue; // already satisfied this subject
          const key = `${groupName} — ${subject}`;
          r[key] = list; // show all possible courses; do NOT hide taken ones
        }
      }
    }

    if (Object.keys(c).length) completed["2B"] = c;
    if (Object.keys(r).length) remaining["2B"] = r;
  }

  // 2C (electives) — consistent shape:
  // Completed: { Category: [user courses that count, excluding double-counted] }
  // Remaining: { Category: [FULL elective list from JSON], shown regardless of what was taken elsewhere }
  const req2c = requirementData?.["2C"] ?? {};
  const rule2c = req2c?._requirement ?? {};
  if (rule2c?.type === "elective-geoscience") {
    // collect all courses already used by 1A/1B/2A/2B so we don't double-count in COMPLETED
    const used = new Set();
    for (const sec of Object.values(completed)) {
      if (!sec || typeof sec !== "object") continue;
      for (const val of Object.values(sec)) {
        if (typeof val === "string") used.add(val);
        else if (Array.isArray(val)) {
          for (const item of val) {
            if (typeof item === "string") used.add(item);
          }
        } else if (val && typeof val === "object") {
          for (const v of Object.values(val)) {
            if (typeof v === "string") used.add(v);
            else if (Array.isArray(v)) v.forEach((x) => typeof x === "string" && used.add(x));
          }
        }
      }
    }

    const c = {};
    const r = {};
    let creditedCount = 0;

    for (const [cat, list] of Object.entries(req2c)) {
      if (isMeta(cat)) continue;

      // Completed: only user courses that are NOT already used elsewhere
      const creditable = list.filter((x) => userCourses.includes(x) && !used.has(x));
      if (creditable.length) {
        c[cat] = [...new Set(creditable)];
        creditedCount += c[cat].length;
      }

      // Remaining: FULL catalog from the JSON (do NOT remove taken ones)
      r[cat] = list.slice();
    }

    if (creditedCount >= (rule2c.min_total_courses || 0) && creditedCount > 0) {
      completed["2C"] = c;
    } else {
      remaining["2C"] = r;
      if (creditedCount > 0) completed["2C"] = c; // show any that counted so far
    }
  }

  return { completed, remaining };
}

// Suggestions — works with the unified "Remaining" shapes
function computeSuggestions(remaining) {
  const picks = [];
  for (const [sec, rem] of Object.entries(remaining || {})) {
    if (!rem || typeof rem !== "object") continue;
    if (sec === "1B" && rem.remaining_by_category) {
      const need = rem.needed_more_courses || 0;
      const pool = Object.entries(rem.remaining_by_category).flatMap(([cat, list]) =>
        (list || []).map((c) => ({ section: sec, category: cat, course: c })),
      );
      if (pool.length) picks.push({ section: sec, need, options: pool });
      continue;
    }
    // Generic (1A, 2A, 2B, 2C now all map label -> [courses])
    const pool = Object.entries(rem).flatMap(([label, list]) =>
      Array.isArray(list) ? list.map((c) => ({ section: sec, category: label, course: c })) : [],
    );
    if (pool.length) picks.push({ section: sec, options: pool });
  }
  return picks;
}

// === UI =====================================================================
const Chip = ({ text, onRemove }) => (
  <span className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 text-sm shadow-sm mr-2 mb-2">
    <span className="font-medium tracking-wide">{text}</span>
    {onRemove && (
      <button onClick={onRemove} className="hover:opacity-70" aria-label={`Remove ${text}`}>×</button>
    )}
  </span>
);

function GenericList({ data }) {
  const has = data && Object.keys(data).length > 0;
  if (!has) return <div className="text-gray-400 text-sm">None</div>;
  return (
    <div className="space-y-2">
      {Object.entries(data).map(([cat, val]) => (
        <div key={cat}>
          <div className="text-sm font-semibold">{cat}</div>
          <div className="mt-1">
            {Array.isArray(val)
              ? val.map((v, i) => <Chip key={cat + i} text={String(v)} />)
              : typeof val === "object"
              ? Object.entries(val).map(([k, v]) =>
                  Array.isArray(v) ? (
                    <Chip key={cat + k} text={`${k}: ${v.join(", ")}`} />
                  ) : (
                    <Chip key={cat + k} text={`${k}: ${String(v)}`} />
                  ),
                )
              : <Chip text={String(val)} />}
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionCard({ title, completed = {}, remaining = {} }) {
  return (
    <div className="rounded-2xl shadow p-5 bg-white border border-gray-100">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-green-600 mb-2">Completed</h4>
          <GenericList data={completed} />
        </div>
        <div>
          <h4 className="font-medium text-rose-600 mb-2">Remaining</h4>
          <GenericList data={remaining} />
        </div>
      </div>
    </div>
  );
}

// === App ====================================================================
function CourseMapperApp() {
  const [program, setProgram] = useLocal("cm:program", "Geoscience");
  const [rawCourses, setRawCourses] = useLocal(
    "cm:courses",
    "CHEM 120, MATH 127, PHYS 111, CS 115, MATH 114, PHYS 112, STAT 202, EARTH 231, EARTH 235, EARTH 238, EARTH 221, EARTH 260, EARTH 342"
  );
  const [courses, setCourses] = useLocal("cm:courses:parsed", []);
  const [requirementsMap, setRequirementsMap] = useLocal("cm:reqs:v3", DEFAULT_REQS);

  // migrate + ensure built-ins
  useEffect(() => {
    try {
      const oldRaw = localStorage.getItem("cm:reqs:v2") || localStorage.getItem("cm:reqs");
      if (oldRaw) {
        const old = JSON.parse(oldRaw);
        setRequirementsMap((prev) => ({ ...DEFAULT_REQS, ...old, ...prev }));
        localStorage.removeItem("cm:reqs:v2");
        localStorage.removeItem("cm:reqs");
      } else {
        setRequirementsMap((prev) => ({ ...DEFAULT_REQS, ...prev }));
      }
    } catch {}
  }, []);

  const reqData = requirementsMap[program];

  // Parse user courses
  useEffect(() => {
    const list = rawCourses.split(",").map(uc).filter(Boolean);
    const seen = new Set();
    const uniq = list.filter((x) => (seen.has(x) ? false : (seen.add(x), true)));
    setCourses(uniq);
  }, [rawCourses]);

  const { completed, remaining } = useMemo(() => {
    if (!reqData) return { completed: {}, remaining: {} };
    return evaluateUserCourses(courses, reqData);
  }, [courses, reqData]);

  const suggestions = useMemo(() => computeSuggestions(remaining), [remaining]);

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      const guessed = file.name.replace(/\.[^.]+$/, "");
      setRequirementsMap({ ...requirementsMap, [guessed]: json });
      setProgram(guessed);
    } catch {
      alert("Invalid JSON file.");
    } finally {
      e.target.value = "";
    }
  };

  const restoreDefaults = () => setRequirementsMap({ ...DEFAULT_REQS });

  const exportPlan = () => {
    const payload = { program, courses, completed, remaining, generatedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `course-plan-${program.replace(/\s+/g, "_").toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Course Mapping Planner</h1>
            <p className="text-sm text-slate-600 mt-1">
              Paste your completed courses, pick a program, and get a clear checklist plus next-course suggestions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-white shadow-sm cursor-pointer">
              <span className="text-sm font-medium">Upload requirements JSON</span>
              <input type="file" accept="application/json" onChange={onUpload} className="hidden" />
            </label>
            <button onClick={restoreDefaults} className="px-3 py-2 rounded-xl border bg-white shadow hover:opacity-90 text-sm">
              Restore defaults
            </button>
            <button onClick={exportPlan} className="px-3 py-2 rounded-2xl bg-slate-900 text-white text-sm shadow hover:opacity-90">
              Export Plan
            </button>
          </div>
        </header>

        <section className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1 p-5 bg-white rounded-2xl shadow border border-gray-100">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Program</label>
            <select value={program} onChange={(e) => setProgram(e.target.value)} className="w-full rounded-xl border px-3 py-2 bg-white">
              {Object.keys(requirementsMap).map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <p className="text-[12px] text-slate-500 mt-2">
              Built-ins: Water Science, Geoscience, Geophysics, Geology, Hydrogeology. Upload a .json to add more.
            </p>
          </div>

          <div className="md:col-span-2 p-5 bg-white rounded-2xl shadow border border-gray-100">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Completed Courses (comma-separated)
            </label>
            <textarea
              value={rawCourses}
              onChange={(e) => setRawCourses(e.target.value)}
              rows={5}
              placeholder="e.g., CHEM 120, MATH 127, PHYS 111, CS 115, ..."
              className="w-full rounded-xl border px-3 py-2 bg-white"
            />
            <div className="mt-3">
              {courses.length ? (
                <div className="flex flex-wrap">
                  {courses.map((c) => (
                    <Chip
                      key={c}
                      text={c}
                      onRemove={() => setRawCourses(courses.filter((x) => x !== c).join(", "))}
                    />
                  ))}
                </div>
              ) : (
                <span className="text-slate-400 text-sm">No courses parsed yet.</span>
              )}
            </div>
          </div>
        </section>

        {!reqData ? (
          <div className="p-5 rounded-2xl border bg-white shadow text-slate-600">
            No requirement JSON found for <b>{program}</b>. Upload one above.
          </div>
        ) : (
          <>
            <section className="grid lg:grid-cols-2 gap-6 mb-8">
              <SectionCard title="Section 1A" completed={completed["1A"]} remaining={remaining["1A"]} />
              <SectionCard title="Section 1B" completed={completed["1B"]} remaining={remaining["1B"]?.remaining_by_category || {}} />
              <SectionCard title="Section 2A" completed={completed["2A"]} remaining={remaining["2A"]} />
              <SectionCard title="Section 2B" completed={completed["2B"]} remaining={remaining["2B"]} />
              <SectionCard title="Section 2C" completed={completed["2C"]} remaining={remaining["2C"]} />
            </section>

            <section className="mb-8 p-5 bg-white rounded-2xl shadow border border-gray-100">
              <h3 className="text-lg font-semibold mb-2">Suggested Next Picks</h3>
              {(() => {
                const items = computeSuggestions(remaining);
                return items.length ? (
                  <div className="space-y-4">
                    {items.map((s, i) => (
                      <div key={i} className="rounded-xl border p-3">
                        <div className="text-sm font-semibold mb-1">{s.section}</div>
                        <div className="flex flex-wrap">
                          {s.options.slice(0, 24).map((o, j) => (
                            <Chip key={j} text={o.course + (o.category ? ` (${o.category})` : "")} />
                          ))}
                          {s.options.length > 24 && (
                            <span className="text-xs text-slate-500 ml-1">+{s.options.length - 24} more…</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-500 text-sm">No suggestions — all sections satisfied or missing requirement metadata.</div>
                );
              })()}
            </section>
          </>
        )}

        <footer className="text-center text-xs text-slate-500 mt-12">
          All sections use the same layout; 2B &amp; 2C show the full catalogs even if you’ve taken a course.
        </footer>
      </div>
    </div>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<CourseMapperApp />);
