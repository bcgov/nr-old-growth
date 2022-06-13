export const contactData = [
  {
    id: "licensee_name",
    modelValue: "",
    label: "Licensee, agreement holder, or BCTS office",
    required: true,
  },
  {
    id: "submitter_firstname",
    modelValue: "",
    label: "Submitter first name",
    note: "Optional",
  },
  {
    id: "submitter_lastname",
    modelValue: "",
    label: "Submitter last name",
    required: true,
  },
  {
    id: "submitter_phone",
    modelValue: "",
    label: "Submitter phone number",
    required: true,
  },
  {
    id: "submitter_email",
    modelValue: "",
    label: "Submitter email",
    required: true,
  },
];

export const fieldObsSelectData = {
  id: "natural_resource_distrct",
  modelValue: "",
  options: [
    //i.e.: { code: "a", text: "First option", emailAddress: "m@m.com", value: {myObj} },
  ],
  label: "Natural resource district",
  required: true,
};

export const fieldObsInputData = [
  {
    id: "forest_file_id",
    modelValue: "",
    label: "Forest file ID or timber sale licence",
    tooltip: "Enter the forest file ID (tenure) or timber sale licence (BCTS).",
    note: "Optional for BCTS",
  },
  {
    id: "cutting_permit",
    modelValue: "",
    label: "Cutting permit",
    note: "Optional for BCTS",
  },
];

export const fieldObsBlockDefaultNew = {
  cut_block_id: "",
  total_block_ha: "",
  ha_org_mapped_def_area: "",
  deferral_category_code: [],
  ha_kept_org_mapping: "",
  ha_added_org_mapping: "",
  ha_deleted_org_mapping: "",
};

export const fieldObsBlockData = [
  {
    cut_block_id: "",
    total_block_ha: "",
    ha_org_mapped_def_area: "",
    deferral_category_code: [],
    ha_kept_org_mapping: "",
    ha_added_org_mapping: "",
    ha_deleted_org_mapping: "",
  },
];

export const fieldObsBlockColumns = [
  {
    id: "cut_block_id",
    type: "input",
    label: "Cut block ID",
    required: true,
  },
  {
    id: "total_block_ha",
    type: "input",
    label: "Total cut block hectares",
    required: true,
  },
  {
    id: "ha_org_mapped_def_area",
    type: "input",
    label: "Hectares originally mapped as priority deferral area",
    required: true,
    tooltip:
      "'Mapped' refers to polygons identified as priority deferral areas in the operational (vector) mapping version of Map 1 Priority Deferral Areas. Map 1 can be downloaded at https://catalogue.data.gov.bc.ca/dataset/5e257660-02ae-4f22-b861-4b2f53aefb4e/resource/47333f4e-1c84-4bb5-b3fe-6031fa78de20",
  },
  {
    id: "deferral_category_code",
    type: "checkbox",
    //TODO: Make it dynamic, not hard-coded
    options: [
      { text: "Big Tree", value: "big_tree" },
      { text: "Ancient", value: "ancient" },
      { text: "Remnant", value: "remnant" },
    ],
    label: "Check all that apply",
    required: true,
  },
  {
    id: "ha_added_org_mapping",
    type: "input",
    label:
      "Hectares <text style='font-weight: bold'>added</text> to deferral area mapping",
    tooltip: "Adding areas to deferrals.",
    note: "Optional",
  },
  {
    id: "ha_deleted_org_mapping",
    type: "input",
    label:
      "Hectares <text style='font-weight: bold'>deleted</text> from deferral area mapping",
    tooltip: "Areas that were mapped as deferrals but do not meet criteria.",
    note: "Optional",
  },
  {
    id: "ha_kept_org_mapping",
    type: "input",
    label:
      "Hectares <text style='font-weight: bold'>unchanged</text> from deferral area mapping",
    tooltip: "Maintaining deferral or non-deferral status as mapped.",
    note: "Optional",
  },
];
