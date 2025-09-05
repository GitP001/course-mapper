/* Course Mapper App (browser build) */
/* No imports/exports; relies on React UMD globals loaded in index.html */
const { useEffect, useMemo, useState } = React;

// === Utility helpers ========================================================
const uc = (s) => s.trim().toUpperCase();
const isMeta = (k) => k.startsWith("_");
// normalize labels for robust matching
const norm = (s) => s.toLowerCase().replace(/\s+/g, ' ').replace(/\s*[\/,]\s*/g, ' / ').trim();

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

// === Embedded requirement presets (from your finalized JSONs) ===============
// You can still upload new JSON files to add more programs.
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

// === Core evaluator (ports your Python logic) ===============================
function evaluateUserCourses(userCourses, requirementData) {
  const completed = {};
  const remaining = {};

  // 1A: all-categories-required
  const req1a = requirementData?.["1A"] ?? {};
  const rule1a = req1a?.["_requirement"] ?? {};
  if (rule1a?.type === "all-categories-required") {
    const c = {}, r = {};
    Object.entries(req1a).forEach(([cat, list]) => {
      if (isMeta(cat)) return;
      const matched = [...new Set(userCourses.filter((x) => list.includes(x)))];
      if (matched.length) c[cat] = matched; else r[cat] = list;
    });
    if (Object.keys(c).length) completed["1A"] = c;
    if (Object.keys(r).length) remaining["1A"] = r;
  }

  // 1B: multi-category-limit
  const req1b = requirementData?.["1B"] ?? {};
  const rule1b = req1b?.["_requirement"] ?? {};
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
        r[cat] = list;
      }
    }
    if (total >= (rule1b.min_total_courses || 0)) {
      completed["1B"] = c;
    } else {
      remaining["1B"] = {
        needed_more_courses: (rule1b.min_total_courses || 0) - total,
        remaining_by_category: r,
      };
    }
  }

  // 2A: all-categories-required
  const req2a = requirementData?.["2A"] ?? {};
  const rule2a = req2a?.["_requirement"] ?? {};
  if (rule2a?.type === "all-categories-required") {
    const c = {}, r = {};
    Object.entries(req2a).forEach(([cat, list]) => {
      if (isMeta(cat)) return;
      const matched = [...new Set(userCourses.filter((x) => list.includes(x)))];
      if (matched.length) c[cat] = matched; else r[cat] = list;
    });
    completed["2A"] = c;
    if (Object.keys(r).length) remaining["2A"] = r;
  }

  // 2B: subgroup-selection
  const req2b = requirementData?.["2B"] ?? {};
  const rule2b = req2b?.["_requirement"] ?? {};
  if (rule2b?.type === "subgroup-selection") {
    const comp2b = {};
    the_rem2b = {};
    const groupNames = Object.keys(req2b).filter((g) => !isMeta(g));

    for (const groupName of groupNames) {
      const group = req2b[groupName] || {};
      const groupCompleted = [];
      const groupRemaining = {};
      let count = 0;
      for (const [subject, list] of Object.entries(group)) {
        if (count >= (rule2b.max_per_group || Infinity)) break;
        const matched = userCourses.filter((x) => list.includes(x));
        if (matched.length) {
          const limited = matched.slice(0, rule2b.max_per_subject || matched.length);
          for (const course of limited) {
            if (count < (rule2b.max_per_group || Infinity)) {
              groupCompleted.push({ [subject]: course });
              count += 1;
            }
          }
        } else {
          groupRemaining[subject] = list;
        }
      }
      if (count >= (rule2b.min_per_group || 0)) comp2b[groupName] = groupCompleted;
      if (count < (rule2b.min_per_group || 0)) {
        the_rem2b[groupName] = {
          needed_more_courses: (rule2b.min_per_group || 0) - count,
          remaining_subjects: groupRemaining,
        };
      }
    }
    completed["2B"] = comp2b;
    if (Object.keys(the_rem2b).length) remaining["2B"] = the_rem2b;
  }

  // 2C: elective-geoscience (avoid double counting)
  const req2c = requirementData?.["2C"] ?? {};
  const rule2c = req2c?.["_requirement"] ?? {};
  if (rule2c?.type === "elective-geoscience") {
    const used = new Set();
    for (const sec of Object.values(completed)) {
      if (!sec || typeof sec !== "object") continue;
      for (const catVal of Object.values(sec)) {
        if (typeof catVal === "string") used.add(catVal);
        else if (Array.isArray(catVal)) {
          for (const item of catVal) {
            if (typeof item === "string") used.add(item);
            else if (item && typeof item === "object") {
              for (const v of Object.values(item)) if (typeof v === "string") used.add(v);
            }
          }
        } else if (catVal && typeof catVal === "object") {
          for (const v of Object.values(catVal)) {
            if (typeof v === "string") used.add(v);
            else if (Array.isArray(v)) v.forEach((x) => typeof x === "string" && used.add(x));
          }
        }
      }
    }

    const c = {};
    const allValid = [];
    for (const [subject, list] of Object.entries(req2c)) {
      if (isMeta(subject)) continue;
      const valid = [...new Set(list.filter((x) => userCourses.includes(x) && !used.has(x)))];
      if (valid.length) { c[subject] = valid; allValid.push(...valid); }
    }
    if (allValid.length >= (rule2c.min_total_courses || 0)) {
      completed["2C"] = c;
    } else {
      remaining["2C"] = {
        completed_so_far: allValid.length,
        needed: (rule2c.min_total_courses || 0) - allValid.length,
        categories_matched: c,
      };
    }
  }

  return { completed, remaining };
}

// Geoscience-only stream detection
function determineStream(completed) {
  const geology2b = new Set(["Igneous Petrology", "Metamorphic Petrology", "Sedimentary Petrology", "Sedimentology"].map(norm));
  const envgeo2b = new Set(["Hydrogeology / Hydrology", "Engineering Geology", "Soil Science"].map(norm));
  const envgeo2c = new Set(["Environmental Assessment"].map(norm));

  const geology = new Set();
  const env = new Set();

  const sec2b = completed?.["2B"] || {};
  for (const group of Object.values(sec2b)) {
    if (Array.isArray(group)) {
      for (const item of group) {
        if (!item || typeof item !== "object") continue;
        for (const cat of Object.keys(item)) {
          const n = norm(cat);
          if (geology2b.has(n)) geology.add(cat);
          if (envgeo2b.has(n)) env.add(cat);
        }
      }
    } else if (group && typeof group === "object") {
      for (const cat of Object.keys(group)) {
        const n = norm(cat);
        if (geology2b.has(n)) geology.add(cat);
        if (envgeo2b.has(n)) env.add(cat);
      }
    }
  }

  const sec2c = completed?.["2C"] || {};
  for (const [cat, list] of Object.entries(sec2c)) {
    if (envgeo2c.has(norm(cat)) && list && list.length) env.add(cat);
  }

  const streams = [];
  if (geology.size) streams.push("Geology");
  if (env.size) streams.push("Environmental Geoscience");
  return streams;
}

// Suggestions builder
function computeSuggestions(remaining) {
  const order = ["1A", "1B", "2A", "2B", "2C"];
  const picks = [];
  for (const sec of order) {
    const rem = remaining?.[sec];
    if (!rem) continue;
    if (sec === "1B" && rem.remaining_by_category) {
      const need = rem.needed_more_courses || 0;
      const pool = Object.entries(rem.remaining_by_category).flatMap(([cat, list]) => list.map((c) => ({ section: sec, category: cat, course: c })));
      picks.push({ section: sec, need, options: pool });
    } else if (sec === "2B" && typeof rem === "object") {
      for (const [group, data] of Object.entries(rem)) {
        const need = data.needed_more_courses || 0;
        const pool = Object.entries(data.remaining_subjects || {}).flatMap(([subj, list]) => list.map((c) => ({ section: sec, group, category: subj, course: c })));
        picks.push({ section: `${sec} - ${group}`, need, options: pool });
      }
    } else if (typeof rem === "object") {
      const pool = Object.entries(rem).flatMap(([cat, list]) => Array.isArray(list) ? list.map((c) => ({ section: sec, category: cat, course: c })) : []);
      if (pool.length) picks.push({ section: sec, need: pool.length, options: pool });
    }
  }
  return picks;
}

// === Self-tests =============================================================
function runSelfTests() {
  const results = [];
  // 1A Chemistry match
  {
    const courses = ["CHEM 120"]; const { completed } = evaluateUserCourses(courses, WATER_SCIENCE);
    const pass = !!(completed["1A"] && completed["1A"].Chemistry && completed["1A"].Chemistry.includes("CHEM 120"));
    results.push({ name: "1A Chemistry match", pass, details: completed["1A"] });
  }
  // 1B min total enforcement
  {
    const courses = ["CS 115", "CS 116", "MATH 106"]; const { remaining } = evaluateUserCourses(courses, WATER_SCIENCE);
    const need = remaining?.["1B"]?.needed_more_courses; const pass = need === 3; results.push({ name: "1B min total", pass, details: { need } });
  }
  // 2B subgroup selection (Geoscience) one per group
  {
    const courses = ["EARTH 221", "EARTH 331", "EARTH 342"]; const { completed, remaining } = evaluateUserCourses(courses, GEOSCIENCE);
    const g1 = completed?.["2B"]?.["Group 1"]; const g2 = completed?.["2B"]?.["Group 2"]; const g3 = completed?.["2B"]?.["Group 3"]; const pass = !!(g1 && g1.length && g2 && g2.length && g3 && g3.length) && !remaining?.["2B"]; results.push({ name: "2B subgroup coverage", pass, details: completed["2B"] });
  }
  // 2C no double-counting
  {
    const courses = ["EARTH 231", "EARTH 223"]; const { completed } = evaluateUserCourses(courses, GEOSCIENCE);
    const usedIn2A = !!completed?.["2A"]?.["Mineralogy and Petrology"]; const count2C = completed?.["2C"] ? Object.values(completed["2C"]).flat().length : 0; const pass = usedIn2A && count2C === 1; results.push({ name: "2C no double-counting", pass, details: { usedIn2A, count2C } });
  }
  // Stream detection: Geology via Sedimentology
  {
    const courses = ["EARTH 221", "EARTH 331", "EARTH 333"]; const { completed } = evaluateUserCourses(courses, GEOSCIENCE); const streams = determineStream(completed); const pass = streams.includes("Geology"); results.push({ name: "Stream detection: Geology", pass, details: { streams } });
  }
  return results;
}

// === UI ====================================================================
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

const SectionCard = ({ title, completed = {}, remaining = {} }) => {
  const hasCompleted = completed && Object.keys(completed).length > 0;
  const hasRemaining = remaining && Object.keys(remaining).length > 0;
  return (
    <div className="rounded-2xl shadow p-5 bg-white border border-gray-100">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-green-600 mb-2">Completed</h4>
          {hasCompleted ? (
            <div className="space-y-2">
              {Object.entries(completed).map(([cat, val]) => (
                <div key={cat}>
                  <div className="text-sm font-semibold">{cat}</div>
                  <div className="mt-1">
                    {Array.isArray(val)
                      ? val.map((v, i) => <Chip key={cat + i} text={String(v)} />)
                      : typeof val === "object"
                      ? Object.entries(val).map(([k, v]) => <Chip key={cat + k} text={`${k}: ${v}`} />)
                      : <Chip text={String(val)} />}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-sm">None</div>
          )}
        </div>
        <div>
          <h4 className="font-medium text-rose-600 mb-2">Remaining</h4>
          {hasRemaining ? (
            <div className="space-y-2">
              {Object.entries(remaining).map(([cat, val]) => (
                <div key={cat}>
                  <div className="text-sm font-semibold">{cat}</div>
                  <div className="mt-1">
                    {Array.isArray(val)
                      ? val.map((v, i) => <Chip key={cat + i} text={String(v)} />)
                      : typeof val === "object"
                      ? Object.entries(val).map(([k, v]) => (
                          <div key={cat + k} className="mb-1">
                            <span className="text-xs uppercase tracking-wide text-gray-500 mr-2">{k}</span>
                            {Array.isArray(v)
                              ? v.map((x, j) => <Chip key={cat + k + j} text={String(x)} />)
                              : typeof v === "object"
                              ? Object.entries(v).map(([kk, vv]) => (
                                  <Chip key={cat + k + kk} text={`${kk}: ${String(vv)}`} />
                                ))
                              : <Chip text={String(v)} />}
                          </div>
                        ))
                      : <Chip text={String(val)} />}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-sm">None</div>
          )}
        </div>
      </div>
    </div>
  );
};

function CourseMapperApp() {
  const [program, setProgram] = useLocal("cm:program", "Water Science");
  const [rawCourses, setRawCourses] = useLocal(
    "cm:courses",
    "CHEM 120, MATH 127, PHYS 111, CS 115, MATH 114, PHYS 112, STAT 202, EARTH 231, EARTH 235, EARTH 238, EARTH 221, EARTH 260, EARTH 342"
  );
  const [courses, setCourses] = useLocal("cm:courses:parsed", []);
  const [requirementsMap, setRequirementsMap] = useLocal("cm:reqs:v3", DEFAULT_REQS);

  // one-time migrate old key and ensure built-ins exist
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

  const streams = useMemo(() => (program.toLowerCase() === "geoscience" ? determineStream(completed) : []), [completed, program]);
  const suggestions = useMemo(() => computeSuggestions(remaining), [remaining]);

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
    const payload = { program, courses, completed, remaining, streams, generatedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `course-plan-${program.replace(/\s+/g, "_").toLowerCase()}.json`;
    document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); a.remove();
  };

  const [tests, setTests] = useState([]);
  const handleRunTests = () => setTests(runSelfTests());

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Course Mapping Planner</h1>
            <p className="text-sm text-slate-600 mt-1">Paste your completed courses, pick a program, and get a clear checklist plus next-course suggestions.</p>
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
              {Object.keys(requirementsMap).map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <p className="text-[12px] text-slate-500 mt-2">Built-ins: Water Science, Geoscience, Geophysics, Geology, Hydrogeology. Upload a .json to add more.</p>
          </div>

          <div className="md:col-span-2 p-5 bg-white rounded-2xl shadow border border-gray-100">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Completed Courses (comma-separated)</label>
            <textarea value={rawCourses} onChange={(e) => setRawCourses(e.target.value)} rows={5} placeholder="e.g., CHEM 120, MATH 127, PHYS 111, CS 115, ..." className="w-full rounded-xl border px-3 py-2 bg-white" />
            <div className="mt-3">
              {courses.length ? (
                <div className="flex flex-wrap">
                  {courses.map((c) => (
                    <Chip key={c} text={c} onRemove={() => setRawCourses(courses.filter((x) => x !== c).join(", "))} />
                  ))}
                </div>
              ) : (
                <span className="text-slate-400 text-sm">No courses parsed yet.</span>
              )}
            </div>
          </div>
        </section>

        {!reqData ? (
          <div className="p-5 rounded-2xl border bg-white shadow text-slate-600">No requirement JSON found for <b>{program}</b>. Upload one above.</div>
        ) : (
          <>
            <section className="grid lg:grid-cols-2 gap-6 mb-8">
              <SectionCard title="Section 1A" completed={completed["1A"]} remaining={remaining["1A"]} />
              <SectionCard title="Section 1B" completed={completed["1B"]} remaining={remaining["1B"]} />
              <SectionCard title="Section 2A" completed={completed["2A"]} remaining={remaining["2A"]} />
              <SectionCard title="Section 2B" completed={completed["2B"]} remaining={remaining["2B"]} />
              <SectionCard title="Section 2C" completed={completed["2C"]} remaining={remaining["2C"]} />
            </section>

            {program.toLowerCase() === "geoscience" && (
              <section className="mb-8 p-5 bg-white rounded-2xl shadow border border-gray-100">
                <h3 className="text-lg font-semibold mb-2">Detected PGO Stream(s)</h3>
                {streams.length ? (
                  <div className="flex flex-wrap">
                    {streams.map((s) => (<Chip key={s} text={s} />))}
                  </div>
                ) : (
                  <div className="text-slate-500 text-sm">Could not determine stream. More relevant 2B/2C courses may be needed.</div>
                )}
              </section>
            )}

            <section className="mb-8 p-5 bg-white rounded-2xl shadow border border-gray-100">
              <h3 className="text-lg font-semibold mb-2">Suggested Next Picks</h3>
              {suggestions.length ? (
                <div className="space-y-4">
                  {suggestions.map((s, i) => (
                    <div key={i} className="rounded-xl border p-3">
                      <div className="text-sm font-semibold mb-1 flex items-center justify-between">
                        <span>{s.section}</span>
                        {typeof s.need === "number" && <span className="text-xs text-slate-500">Need ~ {s.need}</span>}
                      </div>
                      <div className="flex flex-wrap">
                        {s.options.slice(0, 24).map((o, j) => (
                          <Chip key={j} text={o.course + (o.category ? ` (${o.category})` : "")} />
                        ))}
                        {s.options.length > 24 && (
                          <span className="text-xs text-slate-500 ml-1">+{s.options.length - 24} more...</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 text-sm">No suggestions &mdash; all sections satisfied or missing requirement metadata.</div>
              )}
            </section>

            <section className="mb-8 p-5 bg-white rounded-2xl shadow border border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Self-tests</h3>
                <button onClick={handleRunTests} className="px-3 py-1.5 rounded-lg border shadow-sm">Run Tests</button>
              </div>
              {tests.length > 0 && (
                <ul className="mt-3 space-y-2 text-sm">
                  {tests.map((t, i) => (
                    <li key={i} className={`p-2 rounded border ${t.pass ? 'border-green-300 bg-green-50' : 'border-rose-300 bg-rose-50'}`}>
                      <div className="font-medium">{t.name} {t.pass ? 'PASS' : 'FAIL'}</div>
                      <pre className="whitespace-pre-wrap text-xs text-slate-600">{JSON.stringify(t.details, null, 2)}</pre>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        <footer className="text-center text-xs text-slate-500 mt-12">
          Frontend mirrors your Python rules, avoids double-counting, and includes stream detection for Geoscience only.
        </footer>
      </div>
    </div>
  );
}

// Mount app to #root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(CourseMapperApp));
