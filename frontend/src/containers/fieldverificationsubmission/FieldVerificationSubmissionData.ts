export const contactData = [
  {
    label: "Licensee, agreement holder, or BCTS office",
    id: "licensee_name",
    modelValue: "",
    required: true,
  },
  {
    label: "Submitter fist name",
    id: "submitter_firstname",
    modelValue: "",
  },
  {
    label: "Submitter last name",
    id: "submitter_lastname",
    modelValue: "",
    required: true,
  },
  {
    label: "Submitter phone number",
    id: "submitter_phone",
    modelValue: "",
    required: true,
  },
  {
    label: "Submitter email",
    id: "submitter_email",
    modelValue: "",
    required: true,
  },
];

export const fieldObsSelectData = {
  label: "Natural resource district",
  id: "natural_resource_distrct",
  modelValue: "",
  note: "Select the district",
  // options need to be in the format of [{value:"", text:""}]
  //TODO: Make it dynamic, not hard-coded
  options: [
    { value: "a", text: "First option" },
    { value: "b", text: "Selected Option" },
  ],
  required: true,
};

export const fieldObsInputData = [
  {
    label: "Forest file ID or timber sale licence",
    id: "forest_file_id",
    modelValue: "",
  },
  {
    label: "Cutting permit",
    id: "cutting_permit",
    modelValue: "",
  },
];

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
    label: "Cut Block ID",
    type: "input",
    required: true,
  },
  {
    id: "total_block_ha",
    label: "Total cut block hectares",
    type: "input",
    required: true,
  },
  {
    id: "ha_org_mapped_def_area",
    label: "Hectares originally mapped as priority deferral area",
    type: "input",
    required: true,
    info: "put info here",
  },
  {
    id: "deferral_category_code",
    label: "Check all that apply",
    type: "checkbox",
    //TODO: Make it dynamic, not hard-coded
    options: [
      { text: "Big Tree", value: "big_tree" },
      { text: "Ancient", value: "ancient" },
      { text: "Remnant", value: "remnant" },
    ],
    required: true,
  },
  {
    id: "ha_added_org_mapping",
    label: "Hectares added to deferral area mapping",
    type: "input",
    info: "put info here",
  },
  {
    id: "ha_deleted_org_mapping",
    label: "Hectares deleted from deferral area mapping",
    type: "input",
    info: "put info here",
  },
  {
    id: "ha_kept_org_mapping",
    label: "Hectares unchanged from deferral area mapping",
    info: "put info here",
    type: "input",
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
