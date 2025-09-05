/* Course Mapper App (browser build, React UMD) */
(function () {
  // --- Minimal error overlay so blank pages show the error text ---
  function showError(e) {
    try {
      const overlay = document.getElementById("error-overlay");
      const pre = overlay.querySelector("pre");
      pre.textContent =
        (e && (e.message || e.reason || e.toString())) || "Unknown error";
      overlay.style.display = "block";
      console.error(e);
    } catch {}
  }
  window.addEventListener("error", (ev) => showError(ev.error || ev.message));
  window.addEventListener("unhandledrejection", (ev) => showError(ev.reason));

  const { useEffect, useMemo, useState } = React;

  // === Utility helpers ======================================================
  function uc(s) {
    return String(s || "").trim().toUpperCase();
  }
  function isMeta(k) {
    return String(k || "").startsWith("_");
  }
  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/\s*[\/,]\s*/g, " / ")
      .trim();
  }
  function joinList(arr) {
    return Array.isArray(arr) ? arr.join(", ") : String(arr || "");
  }

  // Persist simple state in localStorage
  function useLocal(key, initial) {
    const [val, setVal] = useState(function () {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : initial;
      } catch {
        return initial;
      }
    });
    useEffect(
      function () {
        try {
          localStorage.setItem(key, JSON.stringify(val));
        } catch {}
      },
      [key, val]
    );
    return [val, setVal];
  }

  // === Embedded requirement presets ========================================
  const WATER_SCIENCE = {"1A":{"_requirement":{"type":"all-categories-required","description":"One course is required from each of the following subjects."},"Chemistry":["CHEM 120"],"Math":["MATH 127"],"Physics":["PHYS 111","PHYS 121"]},"1B":{"_requirement":{"type":"multi-category-limit","description":"Select at least 6 courses from the following 6 categories. No more than 2 courses per category.","min_total_courses":6,"max_per_category":2,"valid_categories":["Biology","Computer Programming","Chemistry","Mathematics","Physics","Statistics"]},"Biology":["BIOL 150","BIOL 165"],"Computer Programming":["CS 115","CS 116","CS 105","CS 106"],"Chemistry":["CHEM 123","CHEM 220","CHEM 264","CHEM 266"],"Mathematics":["MATH 106","MATH 114","MATH 128"],"Physics":["PHYS 112","PHYS 122"],"Statistics":["STAT 202"]},"2A":{"_requirement":{"type":"all-categories-required","description":"One course is required from each of the following 4 categories."},"Field Techniques":["EARTH 390"],"Mineralogy and Petrology":["EARTH 231"],"Sedimentation and Stratigraphy":["EARTH 235"],"Structural Geology":["EARTH 238"]},"2B":{"_requirement":{"type":"subgroup-selection","description":"Select at least 1 and at most 2 courses from each of the 3 subgroups. No more than one course per subject.","min_per_group":1,"max_per_group":2,"max_per_subject":1},"Group 1":{"Geochemistry":["EARTH 221"],"Geophysics":["EARTH 260"]},"Group 2":{"Hydrogeology / Hydrology":["EARTH 458","GEOG 407"],"Engineering Geology":[]},"Group 3":{"Geomorphology or Soil Science":["EARTH 342","GEOG 201"],"Glacial Geology":[],"Remote Sensing / GIS":[]}},"2C":{"_requirement":{"type":"elective-geoscience","description":"Select up to 9 courses relevant to geoscience (2nd year or higher, science credit, and not used to fulfill other categories).","min_total_courses":9,"notes":["Courses from 2A/2B may count here if not used in those requirements.","Advanced versions of 2A/2B topics may also apply.","One course cannot fulfill multiple requirements."]},"Field Techniques":["EARTH 223"],"Hydrology / Hydrogeology":["EARTH 355"],"Earth Systems":["EARTH 444"],"Geochemistry":["EARTH 421"],"Geomorphology / Surficial":["GEOG 453"],"Sedimentology":["EARTH 333"]}};

  const HYDROGEOLOGY = {"1A":{"_requirement":{"type":"all-categories-required","description":"One course is required from each of the following subjects."},"Chemistry":["CHEM 120"],"Math":["MATH 127"],"Physics":["PHYS 111","PHYS 121"]},"1B":{"_requirement":{"type":"multi-category-limit","description":"Select at least 6 courses from the following 6 categories. No more than 2 courses per category.","min_total_courses":6,"max_per_category":2,"valid_categories":["Biology","Computer Programming","Chemistry","Mathematics","Physics","Statistics"]},"Biology":["BIOL 120","BIOL 150","BIOL 165","BIOL 240"],"Computer Programming":["CS 115","CS 116","CS 105","CS 106"],"Chemistry":["CHEM 123","CHEM 264","CHEM 266"],"Mathematics":["MATH 106","MATH 114","MATH 128"],"Physics":["PHYS 112","PHYS 122"],"Statistics":["STAT 202"]},"2A":{"_requirement":{"type":"all-categories-required","description":"One course is required from each of the following 4 categories."},"Field Techniques":["EARTH 390"],"Mineralogy and Petrology":["EARTH 231"],"Sedimentation and Stratigraphy":["EARTH 235"],"Structural Geology":["EARTH 238"]},"2B":{"_requirement":{"type":"subgroup-selection","description":"Select at least 1 and at most 2 courses from each of the 3 subgroups. No more than one course per subject.","min_per_group":1,"max_per_group":2,"max_per_subject":1},"Group 1":{"Geochemistry":["EARTH 221"],"Geophysics":["EARTH 260"]},"Group 2":{"Hydrogeology / Hydrology":["EARTH 458"],"Sedimentary Petrology":["EARTH 232"]},"Group 3":{"Geomorphology":["EARTH 342"]}},"2C":{"_requirement":{"type":"elective-geoscience","description":"Select up to 9 courses relevant to geoscience (2nd year or higher, science credit, and not used to fulfill other categories).","min_total_courses":9,"notes":["Courses from 2A/2B may count here if not used in those requirements.","Advanced versions of 2A/2B topics may also apply.","One course cannot fulfill multiple requirements."]},"Field Techniques":["EARTH 223"],"Communication":["EARTH 436A","EARTH 436B"],"Sedimentology":["EARTH 333"],"Hydrology / Hydrogeology":["EARTH 456","EARTH 459"],"Geochemistry":["EARTH 421"],"Geomorphology / Surficial":["EARTH 440"],"Geotechnical":["CIVE 353"]}};

  const GEOSCIENCE = {"1A":{"_requirement":{"type":"all-categories-required","description":"One course is required from each of the following subjects."},"Chemistry":["CHEM 120"],"Math":["MATH 127"],"Physics":["PHYS 111","PHYS 121"]},"1B":{"_requirement":{"type":"multi-category-limit","description":"Select at least 6 courses from the following 6 categories. No more than 2 courses per category.","min_total_courses":6,"max_per_category":2,"valid_categories":["Biology","Computer Programming","Chemistry","Mathematics","Physics","Statistics"]},"Biology":["BIOL 150","BIOL 165"],"Computer Programming":["CS 115","CS 116","CS 105","CS 106"],"Chemistry":["CHEM 123","CHEM 264","CHEM 266"],"Mathematics":["MATH 106","MATH 114","MATH 128"],"Physics":["PHYS 112","PHYS 122"],"Statistics":["STAT 202"]},"2A":{"_requirement":{"type":"all-categories-required","description":"One course is required from each of the following 4 categories."},"Field Techniques":["EARTH 390"],"Mineralogy and Petrology":["EARTH 231"],"Sedimentation and Stratigraphy":["EARTH 235"],"Structural Geology":["EARTH 238"]},"2B":{"_requirement":{"type":"subgroup-selection","description":"Select at least 1 and at most 2 courses from each of the 3 subgroups. No more than one course per subject.","min_per_group":1,"max_per_group":2,"max_per_subject":1},"Group 1":{"Geochemistry":["EARTH 221"],"Geophysics":["EARTH 260","EARTH 460"]},"Group 2":{"Hydrogeology / Hydrology":["EARTH 458","GEOG 303","GEOG 407","EARTH 459","CIVE 382","CIVE 486"],"Engineering Geology":["EARTH 438"],"Igneous Petrology":["EARTH 331"],"Metamorphic Petrology":["EARTH 332"],"Sedimentary Petrology":["EARTH 232"]},"Group 3":{"Geomorphology":["EARTH 342","GEOG 201"],"Soil Science":[],"Glacial Geology":[],"Remote Sensing / GIS":[],"Sedimentology":["EARTH 333"]}},"2C":{"_requirement":{"type":"elective-geoscience","description":"Select up to 9 courses relevant to geoscience (2nd year or higher, science credit, and not used to fulfill other categories).","min_total_courses":9,"notes":["Courses from 2A/2B may count here if not used in those requirements.","Advanced versions of 2A/2B topics may also apply.","One course cannot fulfill multiple requirements."]},"Field Techniques":["EARTH 223"],"Communication":["EARTH 436A","EARTH 436B"],"Environmental Assessment":["ERS 215"],"Hydrology / Hydrogeology":["EARTH 355"],"Earth Systems":["EARTH 358","EARTH 444"],"Geochemistry":["EARTH 421"],"Geomorphology / Surficial":["GEOG 453","EARTH 440"],"Sedimentology":["EARTH 333"]}};

  const GEOPHYSICS = {"1A":{"_requirement":{"type":"all-categories-required","description":"One course is required from each of the following subjects."},"Chemistry":["CHEM 120"],"Math":["MATH 127"],"Physics":["PHYS 111","PHYS 121"]},"1B":{"_requirement":{"type":"multi-category-limit","description":"Select at least 6 courses from the following 6 categories. No more than 2 courses per category.","min_total_courses":6,"max_per_category":2,"valid_categories":["Biology","Computer Programming","Chemistry","Mathematics","Physics","Statistics"]},"Biology":["BIOL 120","BIOL 150","BIOL 165","BIOL 240"],"Computer Programming":["CS 115","CS 116","CS 105","CS 106"],"Chemistry":["CHEM 123","CHEM 264","CHEM 266"],"Mathematics":["MATH 106","MATH 114","MATH 128"],"Physics":["PHYS 122"],"Statistics":["STAT 202"]},"2A":{"_requirement":{"type":"all-categories-required","description":"One course is required from each of the following 4 categories."},"Field Techniques":["EARTH 390"],"Mineralogy and Petrology":["EARTH 231"],"Sedimentation and Stratigraphy":["EARTH 235"],"Structural Geology":["EARTH 238"]},"2B":{"_requirement":{"type":"subgroup-selection","description":"Select at least 1 and at most 2 courses from each of the 3 subgroups. No more than one course per subject.","min_per_group":1,"max_per_group":2,"max_per_subject":1},"Group 1":{"Geochemistry":["EARTH 221"],"Geophysics":["EARTH 260"]},"Group 2":{"Hydrogeology / Hydrology":["EARTH 458"],"Sedimentary Petrology":["EARTH 232"]},"Group 3":{"Sedimentology":["EARTH 333"]}},"2C":{"_requirement":{"type":"elective-geoscience","description":"Select up to 9 courses relevant to geoscience (2nd year or higher, science credit, and not used to fulfill other categories).","min_total_courses":9,"notes":["Courses from 2A/2B may count here if not used in those requirements.","Advanced versions of 2A/2B topics may also apply.","One course cannot fulfill multiple requirements."]},"Field Techniques":["EARTH 223"],"Communication":["EARTH 436A","EARTH 436B"],"Quantitative Analysis":["EARTH 460"],"Geophysics":["EARTH 461"],"Hydrology / Hydrogeology":["EARTH 355"],"Earth Systems":["EARTH 358","EARTH 444"],"Geochemistry":["EARTH 421"],"Geomorphology / Surficial":["GEOG 453","EARTH 440"],"Resource Geology":["EARTH 471"],"Sedimentology":["EARTH 333"]}};

  const GEOLOGY = {"1A":{"_requirement":{"type":"all-categories-required","description":"One course is required from each of the following subjects."},"Chemistry":["CHEM 120"],"Math":["MATH 127"],"Physics":["PHYS 111","PHYS 121"]},"1B":{"_requirement":{"type":"multi-category-limit","description":"Select at least 6 courses from the following 6 categories. No more than 2 courses per category.","min_total_courses":6,"max_per_category":2,"valid_categories":["Biology","Computer Programming","Chemistry","Mathematics","Physics","Statistics"]},"Biology":["BIOL 120","BIOL 150","BIOL 165","BIOL 240"],"Computer Programming":["CS 115","CS 116","CS 105","CS 106"],"Chemistry":["CHEM 123","CHEM 264","CHEM 266"],"Mathematics":["MATH 106","MATH 114","MATH 128"],"Physics":["PHYS 112","PHYS 122"],"Statistics":["STAT 202"]},"2A":{"_requirement":{"type":"all-categories-required","description":"One course is required from each of the following 4 categories."},"Field Techniques":["EARTH 390"],"Mineralogy and Petrology":["EARTH 231"],"Sedimentation and Stratigraphy":["EARTH 235"],"Structural Geology":["EARTH 238"]},"2B":{"_requirement":{"type":"subgroup-selection","description":"Select at least 1 and at most 2 courses from each of the 3 subgroups. No more than one course per subject.","min_per_group":1,"max_per_group":2,"max_per_subject":1},"Group 1":{"Geochemistry":["EARTH 221"],"Geophysics":["EARTH 260"]},"Group 2":{"Igneous Petrology":["EARTH 331"],"Sedimentary Petrology":["EARTH 232"]},"Group 3":{"Geomorphology":["EARTH 342"]}},"2C":{"_requirement":{"type":"elective-geoscience","description":"Select up to 9 courses relevant to geoscience (2nd year or higher, science credit, and not used to fulfill other categories).","min_total_courses":9,"notes":["Courses from 2A/2B may count here if not used in those requirements.","Advanced versions of 2A/2B topics may also apply.","One course cannot fulfill multiple requirements."]},"Field Techniques":["EARTH 223"],"Communication":["EARTH 436A","EARTH 436B"],"Sedimentology":["EARTH 333"],"Earth Systems":["EARTH 358"],"Resource Geology":["EARTH 471"],"Petrology":["EARTH 332"]}};

  const DEFAULT_REQS = {
    "Water Science": WATER_SCIENCE,
    Geoscience: GEOSCIENCE,
    Geophysics: GEOPHYSICS,
    Geology: GEOLOGY,
    Hydrogeology: HYDROGEOLOGY,
  };

  // === Core evaluator =======================================================
  function evaluateUserCourses(userCourses, requirementData) {
    const completed = {};
    const remaining = {};

    // 1A
    var req1a = (requirementData && requirementData["1A"]) || {};
    var rule1a = (req1a && req1a["_requirement"]) || {};
    if (rule1a && rule1a.type === "all-categories-required") {
      const c = {};
      const r = {};
      Object.keys(req1a).forEach(function (cat) {
        if (isMeta(cat)) return;
        const list = req1a[cat] || [];
        const matched = userCourses.filter((x) => list.indexOf(x) >= 0);
        if (matched.length) c[cat] = Array.from(new Set(matched));
        else r[cat] = list;
      });
      if (Object.keys(c).length) completed["1A"] = c;
      if (Object.keys(r).length) remaining["1A"] = r;
    }

    // 1B
    var req1b = (requirementData && requirementData["1B"]) || {};
    var rule1b = (req1b && req1b["_requirement"]) || {};
    if (rule1b && rule1b.type === "multi-category-limit") {
      const c = {};
      const r = {};
      let total = 0;
      (rule1b.valid_categories || []).forEach(function (cat) {
        const list = req1b[cat] || [];
        const matched = userCourses.filter((x) => list.indexOf(x) >= 0);
        if (matched.length) {
          const limited = matched.slice(
            0,
            rule1b.max_per_category || matched.length
          );
          c[cat] = limited;
          total += limited.length;
        } else {
          r[cat] = list;
        }
      });
      if (total >= (rule1b.min_total_courses || 0)) {
        completed["1B"] = c;
      } else {
        remaining["1B"] = {
          needed_more_courses: (rule1b.min_total_courses || 0) - total,
          remaining_by_category: r,
        };
      }
    }

    // 2A
    var req2a = (requirementData && requirementData["2A"]) || {};
    var rule2a = (req2a && req2a["_requirement"]) || {};
    if (rule2a && rule2a.type === "all-categories-required") {
      const c = {};
      const r = {};
      Object.keys(req2a).forEach(function (cat) {
        if (isMeta(cat)) return;
        const list = req2a[cat] || [];
        const matched = userCourses.filter((x) => list.indexOf(x) >= 0);
        if (matched.length) c[cat] = Array.from(new Set(matched));
        else r[cat] = list;
      });
      completed["2A"] = c;
      if (Object.keys(r).length) remaining["2A"] = r;
    }

    // 2B
    var req2b = (requirementData && requirementData["2B"]) || {};
    var rule2b = (req2b && req2b["_requirement"]) || {};
    if (rule2b && rule2b.type === "subgroup-selection") {
      const comp2b = {};
      const rem2b = {};
      const groupNames = Object.keys(req2b).filter((g) => !isMeta(g));

      groupNames.forEach(function (groupName) {
        const group = req2b[groupName] || {};
        const groupCompleted = [];
        const groupRemaining = {};
        let count = 0;

        Object.keys(group).forEach(function (subject) {
          if (count >= (rule2b.max_per_group || Infinity)) return;
          const list = group[subject] || [];
          const matched = userCourses.filter((x) => list.indexOf(x) >= 0);
          if (matched.length) {
            const limited = matched.slice(
              0,
              rule2b.max_per_subject || matched.length
            );
            limited.forEach(function (course) {
              if (count < (rule2b.max_per_group || Infinity)) {
                const obj = {};
                obj[subject] = course;
                groupCompleted.push(obj);
                count += 1;
              }
            });
          } else {
            groupRemaining[subject] = list;
          }
        });

        if (count >= (rule2b.min_per_group || 0))
          comp2b[groupName] = groupCompleted;
        if (count < (rule2b.min_per_group || 0)) {
          rem2b[groupName] = {
            needed_more_courses: (rule2b.min_per_group || 0) - count,
            remaining_subjects: groupRemaining,
          };
        }
      });

      completed["2B"] = comp2b;
      if (Object.keys(rem2b).length) remaining["2B"] = rem2b;
    }

    // 2C (avoid double counting)
    var req2c = (requirementData && requirementData["2C"]) || {};
    var rule2c = (req2c && req2c["_requirement"]) || {};
    if (rule2c && rule2c.type === "elective-geoscience") {
      const used = new Set();
      Object.keys(completed).forEach(function (secKey) {
        const sec = completed[secKey];
        if (!sec || typeof sec !== "object") return;
        Object.values(sec).forEach(function (catVal) {
          if (typeof catVal === "string") used.add(catVal);
          else if (Array.isArray(catVal)) {
            catVal.forEach(function (item) {
              if (typeof item === "string") used.add(item);
              else if (item && typeof item === "object") {
                Object.values(item).forEach(function (v) {
                  if (typeof v === "string") used.add(v);
                });
              }
            });
          } else if (catVal && typeof catVal === "object") {
            Object.values(catVal).forEach(function (v) {
              if (typeof v === "string") used.add(v);
              else if (Array.isArray(v)) {
                v.forEach(function (x) {
                  if (typeof x === "string") used.add(x);
                });
              }
            });
          }
        });
      });

      const c = {};
      const allValid = [];
      Object.keys(req2c).forEach(function (subject) {
        if (isMeta(subject)) return;
        const list = req2c[subject] || [];
        const valid = Array.from(
          new Set(
            list.filter(function (x) {
              return userCourses.indexOf(x) >= 0 && !used.has(x);
            })
          )
        );
        if (valid.length) {
          c[subject] = valid;
          Array.prototype.push.apply(allValid, valid);
        }
      });

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

    return { completed: completed, remaining: remaining };
  }

  // Geoscience-only stream detection
  function determineStream(completed) {
    const geology2b = new Set(
      ["Igneous Petrology", "Metamorphic Petrology", "Sedimentary Petrology", "Sedimentology"].map(norm)
    );
    const envgeo2b = new Set(
      ["Hydrogeology / Hydrology", "Engineering Geology", "Soil Science"].map(norm)
    );
    const envgeo2c = new Set(["Environmental Assessment"].map(norm));

    const geology = new Set();
    const env = new Set();

    const sec2b = (completed && completed["2B"]) || {};
    Object.values(sec2b || {}).forEach(function (group) {
      if (Array.isArray(group)) {
        group.forEach(function (item) {
          if (!item || typeof item !== "object") return;
          Object.keys(item).forEach(function (cat) {
            const n = norm(cat);
            if (geology2b.has(n)) geology.add(cat);
            if (envgeo2b.has(n)) env.add(cat);
          });
        });
      } else if (group && typeof group === "object") {
        Object.keys(group).forEach(function (cat) {
          const n = norm(cat);
          if (geology2b.has(n)) geology.add(cat);
          if (envgeo2b.has(n)) env.add(cat);
        });
      }
    });

    const sec2c = (completed && completed["2C"]) || {};
    Object.keys(sec2c || {}).forEach(function (cat) {
      const list = sec2c[cat];
      if (envgeo2c.has(norm(cat)) && list && list.length) env.add(cat);
    });

    const streams = [];
    if (geology.size) streams.push("Geology");
    if (env.size) streams.push("Environmental Geoscience");
    return streams;
  }

  // Suggestions builder
  function computeSuggestions(remaining) {
    const order = ["1A", "1B", "2A", "2B", "2C"];
    const picks = [];
    order.forEach(function (sec) {
      const rem = remaining && remaining[sec];
      if (!rem) return;
      if (sec === "1B" && rem.remaining_by_category) {
        const need = rem.needed_more_courses || 0;
        const pool = Object.entries(rem.remaining_by_category).flatMap(function ([cat, list]) {
          return list.map(function (c) {
            return { section: sec, category: cat, course: c };
          });
        });
        picks.push({ section: sec, need: need, options: pool });
      } else if (sec === "2B" && typeof rem === "object") {
        Object.entries(rem).forEach(function ([group, data]) {
          const need = (data && data.needed_more_courses) || 0;
          const pool = Object.entries((data && data.remaining_subjects) || {}).flatMap(function ([subj, list]) {
            return list.map(function (c) {
              return { section: sec, group: group, category: subj, course: c };
            });
          });
          picks.push({ section: sec + " - " + group, need: need, options: pool });
        });
      } else if (typeof rem === "object") {
        const pool = Object.entries(rem).flatMap(function ([cat, list]) {
          if (Array.isArray(list)) {
            return list.map(function (c) {
              return { section: sec, category: cat, course: c };
            });
          }
          return [];
        });
        if (pool.length) picks.push({ section: sec, need: pool.length, options: pool });
      }
    });
    return picks;
  }

  // === UI ===================================================================
  function Chip(props) {
    const text = props.text;
    const onRemove = props.onRemove;
    return React.createElement(
      "span",
      { className: "inline-flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 text-sm shadow-sm mr-2 mb-2" },
      React.createElement("span", { className: "font-medium tracking-wide" }, text),
      onRemove
        ? React.createElement(
            "button",
            { onClick: onRemove, className: "hover:opacity-70", "aria-label": "Remove " + text },
            "×"
          )
        : null
    );
  }

  function Remaining2B(props) {
    const remaining = props.remaining || {};
    const has = remaining && Object.keys(remaining).length > 0;
    if (!has) return React.createElement("div", { className: "text-gray-400 text-sm" }, "None");
    return React.createElement(
      "div",
      { className: "space-y-4" },
      Object.entries(remaining).map(function ([groupName, data]) {
        return React.createElement(
          "div",
          { key: groupName, className: "rounded-xl border p-3" },
          React.createElement(
            "div",
            { className: "flex items-center justify-between mb-1" },
            React.createElement("div", { className: "text-sm font-semibold" }, groupName),
            "needed_more_courses" in (data || {})
              ? React.createElement(
                  "span",
                  { className: "text-xs rounded-full px-2 py-0.5 bg-gray-100" },
                  "Need ~ ", (data && data.needed_more_courses) || 0
                )
              : null
          ),
          React.createElement(
            "div",
            { className: "mt-1" },
            Object.entries(((data || {}).remaining_subjects) || {}).map(function ([subject, list]) {
              return React.createElement(
                "div",
                { key: subject, className: "mb-1" },
                React.createElement(
                  "span",
                  { className: "inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm shadow-sm mr-2 mb-2" },
                  React.createElement("span", { className: "font-medium" }, subject + ":"),
                  React.createElement("span", { className: "ml-2" }, joinList(list))
                )
              );
            })
          )
        );
      })
    );
  }

  function Completed2B(props) {
    const completed = props.completed || {};
    const has = completed && Object.keys(completed).length > 0;
    if (!has) return React.createElement("div", { className: "text-gray-400 text-sm" }, "None");
    return React.createElement(
      "div",
      { className: "space-y-2" },
      Object.entries(completed).map(function ([groupName, arr]) {
        return React.createElement(
          "div",
          { key: groupName },
          React.createElement("div", { className: "text-sm font-semibold mb-1" }, groupName),
          React.createElement(
            "div",
            { className: "mt-1" },
            (Array.isArray(arr) ? arr : []).map(function (obj, i) {
              const entries = Object.entries(obj || {});
              if (!entries.length) return null;
              const subject = entries[0][0];
              const course = entries[0][1];
              return React.createElement(Chip, { key: groupName + i, text: subject + ": " + course });
            })
          )
        );
      })
    );
  }

  // Special Remaining 2C (shows metrics + categories_matched list)
  function Remaining2C(props) {
    const data = props.remaining || {};
    const cats = data.categories_matched || {};
    const keys = Object.keys(cats);
    return React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        { className: "flex items-center gap-4 mb-3" },
        React.createElement(
          "div",
          { className: "text-xs uppercase tracking-wide text-gray-500" },
          "Completed so far"
        ),
        React.createElement(
          "span",
          { className: "inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-lg" },
          String(data.completed_so_far || 0)
        ),
        React.createElement(
          "div",
          { className: "text-xs uppercase tracking-wide text-gray-500 ml-6" },
          "Needed"
        ),
        React.createElement(
          "span",
          { className: "inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-lg" },
          String(data.needed || 0)
        )
      ),
      React.createElement("div", { className: "text-base font-semibold mb-2" }, "Categories matched"),
      keys.length
        ? React.createElement(
            "div",
            { className: "flex flex-wrap" },
            Object.entries(cats).map(function ([subject, list]) {
              return React.createElement(Chip, {
                key: subject,
                text: subject + ": " + joinList(list),
              });
            })
          )
        : React.createElement("div", { className: "text-gray-400 text-sm" }, "None")
    );
  }

  function GenericList(props) {
    const data = props.data || {};
    const has = data && Object.keys(data).length > 0;
    if (!has) return React.createElement("div", { className: "text-gray-400 text-sm" }, "None");
    return React.createElement(
      "div",
      { className: "space-y-2" },
      Object.entries(data).map(function ([cat, val]) {
        return React.createElement(
          "div",
          { key: cat },
          React.createElement("div", { className: "text-sm font-semibold" }, cat),
          React.createElement(
            "div",
            { className: "mt-1" },
            Array.isArray(val)
              ? val.map(function (v, i) {
                  return React.createElement(Chip, { key: cat + i, text: String(v) });
                })
              : typeof val === "object"
              ? Object.entries(val).map(function ([k, v]) {
                  return React.createElement(Chip, { key: cat + k, text: k + ": " + String(v) });
                })
              : React.createElement(Chip, { text: String(val) })
          )
        );
      })
    );
  }

  function SectionCard(props) {
    const title = props.title;
    const sectionKey = props.sectionKey;
    const completed = props.completed || {};
    const remaining = props.remaining || {};
    const is2B = sectionKey === "2B";
    const is2C = sectionKey === "2C";

    return React.createElement(
      "div",
      { className: "rounded-2xl shadow p-5 bg-white border border-gray-100" },
      React.createElement("h3", { className: "text-lg font-semibold mb-3" }, title),
      React.createElement(
        "div",
        { className: "grid md:grid-cols-2 gap-4" },
        React.createElement(
          "div",
          null,
          React.createElement("h4", { className: "font-medium text-green-600 mb-2" }, "Completed"),
          is2B ? React.createElement(Completed2B, { completed: completed }) : React.createElement(GenericList, { data: completed })
        ),
        React.createElement(
          "div",
          null,
          React.createElement("h4", { className: "font-medium text-rose-600 mb-2" }, "Remaining"),
          is2B
            ? React.createElement(Remaining2B, { remaining: remaining })
            : is2C
            ? React.createElement(Remaining2C, { remaining: remaining })
            : React.createElement(GenericList, { data: remaining })
        )
      )
    );
  }

  // === App ==================================================================
  function CourseMapperApp() {
    const [program, setProgram] = useLocal("cm:program", "Water Science");
    const [rawCourses, setRawCourses] = useLocal(
      "cm:courses",
      "CHEM 120, MATH 127, PHYS 111, CS 115, MATH 114, PHYS 112, STAT 202, EARTH 231, EARTH 235, EARTH 238, EARTH 221, EARTH 260, EARTH 342"
    );
    const [courses, setCourses] = useLocal("cm:courses:parsed", []);
    const [requirementsMap, setRequirementsMap] = useLocal("cm:reqs:v3", DEFAULT_REQS);

    // migrate + ensure built-ins
    useEffect(function () {
      try {
        const oldRaw = localStorage.getItem("cm:reqs:v2") || localStorage.getItem("cm:reqs");
        if (oldRaw) {
          const old = JSON.parse(oldRaw);
          setRequirementsMap(function (prev) {
            return Object.assign({}, DEFAULT_REQS, old, prev);
          });
          localStorage.removeItem("cm:reqs:v2");
          localStorage.removeItem("cm:reqs");
        } else {
          setRequirementsMap(function (prev) {
            return Object.assign({}, DEFAULT_REQS, prev);
          });
        }
      } catch {}
    }, []);

    const reqData = requirementsMap[program];

    // Parse user courses
    useEffect(
      function () {
        const list = rawCourses
          .split(",")
          .map(uc)
          .filter(Boolean);
        const seen = new Set();
        const uniq = list.filter(function (x) {
          if (seen.has(x)) return false;
          seen.add(x);
          return true;
        });
        setCourses(uniq);
      },
      [rawCourses, setCourses]
    );

    const evalResult = useMemo(
      function () {
        if (!reqData) return { completed: {}, remaining: {} };
        return evaluateUserCourses(courses, reqData);
      },
      [courses, reqData]
    );

    const completed = evalResult.completed || {};
    const remaining = evalResult.remaining || {};

    const streams = useMemo(
      function () {
        return program.toLowerCase() === "geoscience" ? determineStream(completed) : [];
      },
      [completed, program]
    );
    const suggestions = useMemo(function () { return computeSuggestions(remaining); }, [remaining]);

    async function onUpload(e) {
      const file = (e.target && e.target.files && e.target.files[0]) || null;
      if (!file) return;
      const text = await file.text();
      try {
        const json = JSON.parse(text);
        const guessed = (file.name || "Program").replace(/\.[^.]+$/, "");
        const newMap = Object.assign({}, requirementsMap);
        newMap[guessed] = json;
        setRequirementsMap(newMap);
        setProgram(guessed);
      } catch {
        alert("Invalid JSON file.");
      } finally {
        e.target.value = "";
      }
    }

    function restoreDefaults() {
      setRequirementsMap(Object.assign({}, DEFAULT_REQS));
    }

    function exportPlan() {
      const payload = {
        program: program,
        courses: courses,
        completed: completed,
        remaining: remaining,
        streams: streams,
        generatedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "course-plan-" + program.replace(/\s+/g, "_").toLowerCase() + ".json";
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
    }

    const [tests, setTests] = useState([]);
    function handleRunTests() {
      setTests(runSelfTests());
    }

    // Render
    return React.createElement(
      "div",
      { className: "min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900" },
      React.createElement(
        "div",
        { className: "max-w-6xl mx-auto px-4 py-8" },
        React.createElement(
          "header",
          { className: "flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8" },
          React.createElement(
            "div",
            null,
            React.createElement("h1", { className: "text-2xl md:text-3xl font-extrabold tracking-tight" }, "Course Mapping Planner"),
            React.createElement(
              "p",
              { className: "text-sm text-slate-600 mt-1" },
              "Paste your completed courses, pick a program, and get a clear checklist plus next-course suggestions."
            )
          ),
          React.createElement(
            "div",
            { className: "flex items-center gap-3" },
            React.createElement(
              "label",
              { className: "inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-white shadow-sm cursor-pointer" },
              React.createElement("span", { className: "text-sm font-medium" }, "Upload requirements JSON"),
              React.createElement("input", { type: "file", accept: "application/json", onChange: onUpload, className: "hidden" })
            ),
            React.createElement(
              "button",
              { onClick: restoreDefaults, className: "px-3 py-2 rounded-xl border bg-white shadow hover:opacity-90 text-sm" },
              "Restore defaults"
            ),
            React.createElement(
              "button",
              { onClick: exportPlan, className: "px-3 py-2 rounded-xl bg-slate-900 text-white text-sm shadow hover:opacity-90" },
              "Export Plan"
            )
          )
        ),

        React.createElement(
          "section",
          { className: "grid md:grid-cols-3 gap-6 mb-8" },
          React.createElement(
            "div",
            { className: "md:col-span-1 p-5 bg-white rounded-2xl shadow border border-gray-100" },
            React.createElement(
              "label",
              { className: "block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2" },
              "Program"
            ),
            React.createElement(
              "select",
              { value: program, onChange: function (e) { setProgram(e.target.value); }, className: "w-full rounded-xl border px-3 py-2 bg-white" },
              Object.keys(requirementsMap).map(function (name) {
                return React.createElement("option", { key: name, value: name }, name);
              })
            ),
            React.createElement(
              "p",
              { className: "text-[12px] text-slate-500 mt-2" },
              "Built-ins: Water Science, Geoscience, Geophysics, Geology, Hydrogeology. Upload a .json to add more."
            )
          ),

          React.createElement(
            "div",
            { className: "md:col-span-2 p-5 bg-white rounded-2xl shadow border border-gray-100" },
            React.createElement(
              "label",
              { className: "block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2" },
              "Completed Courses (comma-separated)"
            ),
            React.createElement("textarea", {
              value: rawCourses,
              onChange: function (e) { setRawCourses(e.target.value); },
              rows: 5,
              placeholder: "e.g., CHEM 120, MATH 127, PHYS 111, CS 115, ...",
              className: "w-full rounded-xl border px-3 py-2 bg-white",
            }),
            React.createElement(
              "div",
              { className: "mt-3" },
              courses.length
                ? React.createElement(
                    "div",
                    { className: "flex flex-wrap" },
                    courses.map(function (c) {
                      return React.createElement(Chip, {
                        key: c,
                        text: c,
                        onRemove: function () {
                          setRawCourses(
                            courses
                              .filter(function (x) { return x !== c; })
                              .join(", ")
                          );
                        },
                      });
                    })
                  )
                : React.createElement("span", { className: "text-slate-400 text-sm" }, "No courses parsed yet.")
            )
          )
        ),

        !reqData
          ? React.createElement(
              "div",
              { className: "p-5 rounded-2xl border bg-white shadow text-slate-600" },
              "No requirement JSON found for ",
              React.createElement("b", null, program),
              ". Upload one above."
            )
          : React.createElement(
              React.Fragment,
              null,
              React.createElement(
                "section",
                { className: "grid lg:grid-cols-2 gap-6 mb-8" },
                React.createElement(SectionCard, {
                  title: "Section 1A",
                  sectionKey: "1A",
                  completed: completed["1A"],
                  remaining: remaining["1A"],
                }),
                React.createElement(SectionCard, {
                  title: "Section 1B",
                  sectionKey: "1B",
                  completed: completed["1B"],
                  remaining: remaining["1B"],
                }),
                React.createElement(SectionCard, {
                  title: "Section 2A",
                  sectionKey: "2A",
                  completed: completed["2A"],
                  remaining: remaining["2A"],
                }),
                React.createElement(SectionCard, {
                  title: "Section 2B",
                  sectionKey: "2B",
                  completed: completed["2B"],
                  remaining: remaining["2B"],
                }),
                React.createElement(SectionCard, {
                  title: "Section 2C",
                  sectionKey: "2C",
                  completed: completed["2C"],
                  remaining: remaining["2C"],
                })
              ),

              program.toLowerCase() === "geoscience"
                ? React.createElement(
                    "section",
                    { className: "mb-8 p-5 bg-white rounded-2xl shadow border border-gray-100" },
                    React.createElement("h3", { className: "text-lg font-semibold mb-2" }, "Detected PGO Stream(s)"),
                    (streams || []).length
                      ? React.createElement(
                          "div",
                          { className: "flex flex-wrap" },
                          streams.map(function (s) { return React.createElement(Chip, { key: s, text: s }); })
                        )
                      : React.createElement(
                          "div",
                          { className: "text-slate-500 text-sm" },
                          "Could not determine stream. More relevant 2B/2C courses may be needed."
                        )
                  )
                : null,

              React.createElement(
                "section",
                { className: "mb-8 p-5 bg-white rounded-2xl shadow border border-gray-100" },
                React.createElement("h3", { className: "text-lg font-semibold mb-2" }, "Suggested Next Picks"),
                (suggestions || []).length
                  ? React.createElement(
                      "div",
                      { className: "space-y-4" },
                      suggestions.map(function (s, i) {
                        return React.createElement(
                          "div",
                          { key: i, className: "rounded-xl border p-3" },
                          React.createElement(
                            "div",
                            { className: "text-sm font-semibold mb-1 flex items-center justify-between" },
                            React.createElement("span", null, s.section),
                            typeof s.need === "number"
                              ? React.createElement("span", { className: "text-xs text-slate-500" }, "Need ~ ", s.need)
                              : null
                          ),
                          React.createElement(
                            "div",
                            { className: "flex flex-wrap" },
                            s.options.slice(0, 24).map(function (o, j) {
                              return React.createElement(Chip, {
                                key: j,
                                text: o.course + (o.category ? " (" + o.category + ")" : ""),
                              });
                            }),
                            s.options.length > 24
                              ? React.createElement(
                                  "span",
                                  { className: "text-xs text-slate-500 ml-1" },
                                  "+",
                                  s.options.length - 24,
                                  " more..."
                                )
                              : null
                          )
                        );
                      })
                    )
                  : React.createElement(
                      "div",
                      { className: "text-slate-500 text-sm" },
                      "No suggestions — all sections satisfied or missing requirement metadata."
                    )
              ),

              React.createElement(
                "section",
                { className: "mb-8 p-5 bg-white rounded-2xl shadow border border-gray-100" },
                React.createElement(
                  "div",
                  { className: "flex items-center justify-between" },
                  React.createElement("h3", { className: "text-lg font-semibold" }, "Self-tests"),
                  React.createElement("button", { onClick: handleRunTests, className: "px-3 py-1.5 rounded-lg border shadow-sm" }, "Run Tests")
                ),
                (tests || []).length
                  ? React.createElement(
                      "ul",
                      { className: "mt-3 space-y-2 text-sm" },
                      tests.map(function (t, i) {
                        return React.createElement(
                          "li",
                          {
                            key: i,
                            className:
                              "p-2 rounded border " +
                              (t.pass ? "border-green-300 bg-green-50" : "border-rose-300 bg-rose-50"),
                          },
                          React.createElement("div", { className: "font-medium" }, t.name + " " + (t.pass ? "PASS" : "FAIL")),
                          React.createElement(
                            "pre",
                            { className: "whitespace-pre-wrap text-xs text-slate-600" },
                            JSON.stringify(t.details, null, 2)
                          )
                        );
                      })
                    )
                  : null
              )
            ),

        React.createElement(
          "footer",
          { className: "text-center text-xs text-slate-500 mt-12" },
          "Frontend mirrors your Python rules, avoids double-counting, and includes stream detection for Geoscience only."
        )
      )
    );
  }

  // --- Self tests -----------------------------------------------------------
  function runSelfTests() {
    const results = [];
    {
      const courses = ["CHEM 120"];
      const res = evaluateUserCourses(courses, WATER_SCIENCE);
      const completed = res.completed;
      const pass =
        !!(completed["1A"] && completed["1A"].Chemistry && completed["1A"].Chemistry.indexOf("CHEM 120") >= 0);
      results.push({ name: "1A Chemistry match", pass: pass, details: completed["1A"] });
    }
    {
      const courses = ["CS 115", "CS 116", "MATH 106"];
      const res = evaluateUserCourses(courses, WATER_SCIENCE);
      const need = res.remaining && res.remaining["1B"] && res.remaining["1B"].needed_more_courses;
      const pass = need === 3;
      results.push({ name: "1B min total", pass: pass, details: { need: need } });
    }
    {
      const courses = ["EARTH 221", "EARTH 331", "EARTH 342"];
      const res = evaluateUserCourses(courses, GEOSCIENCE);
      const completed = res.completed;
      const remaining = res.remaining;
      const g1 = completed && completed["2B"] && completed["2B"]["Group 1"];
      const g2 = completed && completed["2B"] && completed["2B"]["Group 2"];
      const g3 = completed && completed["2B"] && completed["2B"]["Group 3"];
      const pass = !!(g1 && g1.length && g2 && g2.length && g3 && g3.length) && !(remaining && remaining["2B"]);
      results.push({ name: "2B subgroup coverage", pass: pass, details: completed["2B"] });
    }
    {
      const courses = ["EARTH 231", "EARTH 223"];
      const res = evaluateUserCourses(courses, GEOSCIENCE);
      const completed = res.completed;
      const usedIn2A = !!(completed && completed["2A"] && completed["2A"]["Mineralogy and Petrology"]);
      const count2C = completed && completed["2C"] ? [].concat.apply([], Object.values(completed["2C"])).length : 0;
      const pass = usedIn2A && count2C === 1;
      results.push({ name: "2C no double-counting", pass: pass, details: { usedIn2A: usedIn2A, count2C: count2C } });
    }
    {
      const courses = ["EARTH 221", "EARTH 331", "EARTH 333"];
      const res = evaluateUserCourses(courses, GEOSCIENCE);
      const streams = determineStream(res.completed);
      const pass = streams.indexOf("Geology") >= 0;
      results.push({ name: "Stream detection: Geology", pass: pass, details: { streams: streams } });
    }
    return results;
  }

  // --- Mount app safely -----------------------------------------------------
  function mount() {
    try {
      const el = document.getElementById("root");
      if (!el) throw new Error("#root not found");
      const root = ReactDOM.createRoot(el);
      root.render(React.createElement(CourseMapperApp));
    } catch (e) {
      showError(e);
    }
  }
  if (document.readyState === "complete" || document.readyState === "interactive") {
    mount();
  } else {
    document.addEventListener("DOMContentLoaded", mount);
  }
})();
