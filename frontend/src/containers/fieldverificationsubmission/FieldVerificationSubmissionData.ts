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
