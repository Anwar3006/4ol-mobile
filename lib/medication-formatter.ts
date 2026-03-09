export const formatOpenFDAData = (raw: any) => {
  if (!raw) return null;

  // Split indications by commas or periods to get separate "purposes"
  const rawPurpose = raw.indications_and_usage?.[0] || "";
  const purposeList = rawPurpose
    .split(/[.,;•]|\band\b/)
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 5 && s.length < 50)
    .slice(0, 6); // Limit to top 6 relevant chips

  // Extract dosage form and map to our types
  const rawDosageForm = raw.openfda?.dosage_form?.[0]?.toLowerCase() || "";
  let drugType = "pills"; // default

  if (rawDosageForm.includes("tablet")) drugType = "tablet";
  else if (rawDosageForm.includes("capsule")) drugType = "capsule";
  else if (rawDosageForm.includes("injection") || rawDosageForm.includes("injectable")) drugType = "injection";
  else if (rawDosageForm.includes("solution") || rawDosageForm.includes("liquid") || rawDosageForm.includes("suspension")) drugType = "liquid";
  else if (rawDosageForm.includes("cream") || rawDosageForm.includes("ointment") || rawDosageForm.includes("gel")) drugType = "cream";
  else if (rawDosageForm.includes("spray") || rawDosageForm.includes("inhaler")) drugType = "inhaler";
  else if (rawDosageForm.includes("drop")) drugType = "drops";

  return {
    generic_name: raw.openfda?.generic_name?.[0] || "",
    rxcui: raw.openfda?.rxcui?.[0] || "",
    purpose: purposeList,
    instructions: raw.dosage_and_administration?.[0] || "",
    side_effects: raw.adverse_reactions?.[0] || "",
    drug_type: drugType, // Include extracted type
    raw_data: raw, // Kept for the JSONB column
  };
};
