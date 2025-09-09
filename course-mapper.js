/* Course Mapping Planner (browser build) */
/* Uses React UMD globals; no imports/exports */
const { useEffect, useMemo, useState } = React;

// === UX Toggles =============================================================
// Keep the full catalog on the "Remaining" side even after you've taken courses.
const SHOW_FULL_CATALOG_EVERYWHERE = true;

// === Utility helpers ========================================================
const uc = (s) => s.trim().toUpperCase();
const isMeta = (k) => k.startsWith("_");
const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").replace(/\s*[\/,]\s*/g, " / ").trim();
const joinList = (arr) => (Array.isArray(arr) ? arr.join(", ") : String(arr || ""));
const sumLen = (obj) => Object.values(obj || {}).reduce((n, v) => n + (Array.isArray(v) ? v.length : 0), 0);

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
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }, [key, val]);
  return [val, setVal];
};

// === Embedded requirement presets (same as your JSONs) ======================
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

// === Core evaluator (consistent + sticky catalog) ===========================
function evaluateUserCourses(userCourses, requirementData) {
  const completed = {};
  const remaining = {};

  // ---------- 1A: all-categories-required ----------
  {
    const sec = requirementData?.["1A"] ?? {};
    const rule = sec?._requirement ?? {};
    if (rule.type === "all-categories-required") {
      const c = {};
      for (const [cat, list] of Object.entries(sec)) {
        if (isMeta(cat)) continue;
        const matched = [...new Set(userCourses.filter((x) => list.includes(x)))];
        if (matched.length) c[cat] = matched;
      }
      if (Object.keys(c).length) completed["1A"] = c;

      // always show full catalog on Remaining
      const rFull = {};
      for (const [cat, list] of Object.entries(sec)) if (!isMeta(cat)) rFull[cat] = list;
      remaining["1A"] = rFull;
    }
  }

  // ---------- 1B: multi-category-limit ----------
  {
    const sec = requirementData?.["1B"] ?? {};
    const rule = sec?._requirement ?? {};
    if (rule.type === "multi-category-limit") {
      const c = {};
      let total = 0;
      for (const cat of rule.valid_categories || []) {
        const list = sec?.[cat] || [];
        const matched = userCourses.filter((x) => list.includes(x));
        if (matched.length) {
          const limited = matched.slice(0, rule.max_per_category || matched.length);
          if (limited.length) c[cat] = limited;
          total += limited.length;
        }
      }
      if (Object.keys(c).length) completed["1B"] = c;

      const rFull = {};
      for (const cat of rule.valid_categories || []) rFull[cat] = sec?.[cat] || [];
      remaining["1B"] = rFull;
    }
  }

  // ---------- 2A: all-categories-required ----------
  {
    const sec = requirementData?.["2A"] ?? {};
    const rule = sec?._requirement ?? {};
    if (rule.type === "all-categories-required") {
      const c = {};
      for (const [cat, list] of Object.entries(sec)) {
        if (isMeta(cat)) continue;
        const matched = [...new Set(userCourses.filter((x) => list.includes(x)))];
        if (matched.length) c[cat] = matched;
      }
      if (Object.keys(c).length) completed["2A"] = c;

      const rFull = {};
      for (const [cat, list] of Object.entries(sec)) if (!isMeta(cat)) rFull[cat] = list;
      remaining["2A"] = rFull;
    }
  }

  // ---------- 2B: subgroup-selection (flattened + sticky) ----------
  {
    const sec = requirementData?.["2B"] ?? {};
    const rule = sec?._requirement ?? {};
    if (rule.type === "subgroup-selection") {
      const c = {};
      const r = {};

      const groupNames = Object.keys(sec).filter((g) => !isMeta(g));
      for (const groupName of groupNames) {
        const group = sec[groupName] || {};
        let credited = 0;

        // complete: count up to max_per_group, one per subject up to max_per_subject
        for (const [subject, list] of Object.entries(group)) {
          if (credited >= (rule.max_per_group || Infinity)) break;
          const matched = userCourses.filter((x) => list.includes(x));
          if (matched.length) {
            const limited = matched.slice(0, rule.max_per_subject || matched.length);
            const still = (rule.max_per_group || Infinity) - credited;
            const toCred = limited.slice(0, still);
            if (toCred.length) {
              c[`${groupName} — ${subject}`] = toCred;
              credited += toCred.length;
            }
          }
        }

        // remaining catalog: always list all subjects for the group
        for (const [subject, list] of Object.entries(group)) {
          r[`${groupName} — ${subject}`] = list.slice();
        }
      }
      if (Object.keys(c).length) completed["2B"] = c;
      remaining["2B"] = r;
    }
  }

  // ---------- 2C: elective-geoscience (no double count + sticky + ALWAYS show completed so far) ----------
  {
    const sec = requirementData?.["2C"] ?? {};
    const rule = sec?._requirement ?? {};
    if (rule.type === "elective-geoscience") {
      // Build set of courses already used in other sections
      const used = new Set();
      for (const key of ["1A", "1B", "2A", "2B"]) {
        const secComp = completed[key];
        if (!secComp) continue;
        for (const val of Object.values(secComp)) {
          if (Array.isArray(val)) val.forEach((x) => used.add(x));
        }
      }

      const c = {};
      const allValid = [];
      for (const [subject, list] of Object.entries(sec)) {
        if (isMeta(subject)) continue;
        const valid = [...new Set(list.filter((x) => userCourses.includes(x) && !used.has(x)))];
        if (valid.length) { c[subject] = valid; allValid.push(...valid); }
      }
      // KEY FIX: always show what you've earned so far, even if < min
      if (Object.keys(c).length) completed["2C"] = c;

      const rFull = {};
      for (const [subject, list] of Object.entries(sec)) if (!isMeta(subject)) rFull[subject] = list;
      remaining["2C"] = rFull;
    }
  }

  return { completed, remaining };
}

// === Metrics (how many required / done / needed) ============================
function sectionMetrics(sectionKey, requirementData, completed) {
  const sec = requirementData?.[sectionKey] ?? {};
  const rule = sec?._requirement ?? {};
  let required = 0, done = 0, need = 0;

  const countCompleted = (map) => sumLen(map || {});

  if (sectionKey === "1A" || sectionKey === "2A") {
    required = Object.keys(sec).filter((k) => !isMeta(k)).length;
    done = Object.keys(completed?.[sectionKey] || {}).length;
    need = Math.max(required - done, 0);
  } else if (sectionKey === "1B") {
    required = rule.min_total_courses || 0;
    done = countCompleted(completed?.["1B"]);
    need = Math.max(required - done, 0);
  } else if (sectionKey === "2B") {
    const groups = Object.keys(sec).filter((k) => !isMeta(k));
    required = (rule.min_per_group || 0) * groups.length;

    // credit per group, capped by min_per_group to compute "done toward requirement"
    const perGroupDone = {};
    const comp = completed?.["2B"] || {};
    for (const [label, arr] of Object.entries(comp)) {
      const groupName = String(label).split(" — ")[0];
      perGroupDone[groupName] = (perGroupDone[groupName] || 0) + (arr?.length || 0);
    }
    done = groups.reduce((s, g) => s + Math.min(perGroupDone[g] || 0, rule.min_per_group || 0), 0);
    need = Math.max(required - done, 0);
  } else if (sectionKey === "2C") {
    required = rule.min_total_courses || 0;
    done = countCompleted(completed?.["2C"]);
    need = Math.max(required - done, 0);
  }
  return { required, done, need };
}

// === Small UI bits ==========================================================
const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-gray-100 text-gray-700 ml-2">
    {children}
  </span>
);

const Chip = ({ text, onRemove }) => (
  <span className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 text-sm shadow-sm mr-2 mb-2">
    <span className="font-medium tracking-wide">{text}</span>
    {onRemove && (
      <button onClick={onRemove} className="hover:opacity-70" aria-label={`Remove ${text}`}>
        &times;
      </button>
    )}
  </span>
);

function ListBlock({ data }) {
  const has = data && Object.keys(data).length > 0;
  if (!has) return <div className="text-gray-400 text-sm">None</div>;
  return (
    <div className="space-y-2">
      {Object.entries(data).map(([cat, arr]) => (
        <div key={cat}>
          <div className="text-sm font-semibold">{cat}</div>
          <div className="mt-1">
            {(arr || []).map((v, i) => <Chip key={cat + i} text={String(v)} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionCard({ title, sectionKey, requirementData, completed = {}, remaining = {} }) {
  const metrics = useMemo(() => sectionMetrics(sectionKey, requirementData, { [sectionKey]: completed }), [sectionKey, requirementData, completed]);
  return (
    <div className="rounded-2xl shadow p-5 bg-white border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="text-xs text-slate-600">
          <Badge>Required: {metrics.required}</Badge>
          <Badge>Done: {metrics.done}</Badge>
          <Badge>Need: {metrics.need}</Badge>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-green-600 mb-2">Completed</h4>
          <ListBlock data={completed} />
        </div>
        <div>
          <h4 className="font-medium text-rose-600 mb-2">Remaining</h4>
          <ListBlock data={remaining} />
        </div>
      </div>
    </div>
  );
}

// === App ====================================================================
function CourseMapperApp() {
  const [program, setProgram] = useLocal("cm:program", "Water Science");
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
  }, [rawCourses, setCourses]);

  const { completed, remaining } = useMemo(() => {
    if (!reqData) return { completed: {}, remaining: {} };
    return evaluateUserCourses(courses, reqData);
  }, [courses, reqData]);

  const onUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      const guessed = file.name.replace(/\.[^.]+$/, "");
      setRequirementsMap({ ...requirementsMap, [guessed]: json });
      setProgram(guessed);
    } catch {
      alert("Invalid JSON file.");
    } finally { e.target.value = ""; }
  };

  const restoreDefaults = () => setRequirementsMap({ ...DEFAULT_REQS });

  const exportPlan = () => {
    const payload = { program, courses, completed, remaining, generatedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `course-plan-${program.replace(/\s+/g, "_").toLowerCase()}.json`;
    document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); a.remove();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Course Mapping Planner</h1>
            <p className="text-sm text-slate-600 mt-1">Paste your completed courses, pick a program, and get a clear checklist plus requirement counts.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-white shadow-sm cursor-pointer">
              <span className="text-sm font-medium">Upload requirements JSON</span>
              <input type="file" accept="application/json" onChange={onUpload} className="hidden" />
            </label>
            <button onClick={restoreDefaults} className="px-3 py-2 rounded-xl border bg-white shadow hover:opacity-90 text-sm">Restore defaults</button>
            <button onClick={exportPlan} className="px-3 py-2 rounded-xl bg-slate-900 text-white text-sm shadow hover:opacity-90">Export Plan</button>
          </div>
        </header>

        <section className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1 p-5 bg-white rounded-2xl shadow border border-gray-100">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Program</label>
            <select value={program} onChange={(e) => setProgram(e.target.value)} className="w-full rounded-xl border px-3 py-2 bg-white">
              {Object.keys(requirementsMap).map((name) => (<option key={name} value={name}>{name}</option>))}
            </select>
            <p className="text-[12px] text-slate-500 mt-2">Built-ins: Water Science, Geoscience, Geophysics, Geology, Hydrogeology. Upload a .json to add more.</p>
          </div>

          <div className="md:col-span-2 p-5 bg-white rounded-2xl shadow border border-gray-100">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Completed Courses (comma-separated)</label>
            <textarea value={rawCourses} onChange={(e) => setRawCourses(e.target.value)} rows={5} placeholder="e.g., CHEM 120, MATH 127, PHYS 111, CS 115, ..." className="w-full rounded-xl border px-3 py-2 bg-white" />
            <div className="mt-3">
              {courses.length ? (
                <div className="flex flex-wrap">
                  {courses.map((c) => (<Chip key={c} text={c} onRemove={() => setRawCourses(courses.filter((x) => x !== c).join(", "))} />))}
                </div>
              ) : (<span className="text-slate-400 text-sm">No courses parsed yet.</span>)}
            </div>
          </div>
        </section>

        {!reqData ? (
          <div className="p-5 rounded-2xl border bg-white shadow text-slate-600">No requirement JSON found for <b>{program}</b>. Upload one above.</div>
        ) : (
          <section className="grid lg:grid-cols-2 gap-6 mb-8">
            <SectionCard title="Section 1A" sectionKey="1A" requirementData={reqData} completed={completed["1A"]} remaining={remaining["1A"]} />
            <SectionCard title="Section 1B" sectionKey="1B" requirementData={reqData} completed={completed["1B"]} remaining={remaining["1B"]} />
            <SectionCard title="Section 2A" sectionKey="2A" requirementData={reqData} completed={completed["2A"]} remaining={remaining["2A"]} />
            <SectionCard title="Section 2B" sectionKey="2B" requirementData={reqData} completed={completed["2B"]} remaining={remaining["2B"]} />
            <SectionCard title="Section 2C" sectionKey="2C" requirementData={reqData} completed={completed["2C"]} remaining={remaining["2C"]} />
          </section>
        )}

        <footer className="text-center text-xs text-slate-500 mt-12">
          Sticky catalogs on the right; counts show required / done / needed. 2C credits show immediately and never hide from the catalog.
        </footer>
      </div>
    </div>
  );
}

// Mount app to #root
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(CourseMapperApp));
