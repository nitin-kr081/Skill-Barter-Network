/** Normalize skill strings for comparison and storage. */
export const normalizeSkill = (skill) => String(skill ?? "").trim().toLowerCase();

/** Normalize an array of skills (trim + lowercase, drop empties). */
export const normalizeSkillsArray = (skills) =>
  Array.isArray(skills)
    ? skills.map((s) => normalizeSkill(s)).filter(Boolean)
    : [];

/**
 * @param {object} listing
 * @param {string[]} mySkillsOfferedNormalized — lowercase skill strings
 * @returns {{ matchScore: number, isMatch: boolean }}
 */
export const getListingMatchMeta = (listing, mySkillsOfferedNormalized) => {
  const offered = mySkillsOfferedNormalized;
  const matchScore =
    listing?.skillsWanted?.filter((skill) =>
      offered.includes(normalizeSkill(skill))
    ).length ?? 0;
  return { matchScore, isMatch: matchScore > 0 };
};
