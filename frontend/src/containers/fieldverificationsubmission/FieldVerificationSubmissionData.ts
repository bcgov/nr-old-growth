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

export const submitterData = [
  {
    label: "First name",
    id: "submitter_firstname",
    modelValue: "",
  },
  {
    label: "Last name",
    id: "submitter_lastname",
    modelValue: "",
  },
  {
    label: "Phone number",
    required: false,
    id: "submitter_phone",
    modelValue: "",
  },
  {
    label: "Email",
    id: "submitter_email",
    modelValue: "",
  },
];

export const tenureInputData = [
  {
    label: "Tenure",
    id: "tenure",
    modelValue: "",
    note: "Enter the forest file ID",
  },
  {
    label: "Cutting permit",
    id: "cutting_permit",
    modelValue: "",
    note: "Enter the cutting permit number",
  },
];

export const tenureSelectData = {
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
};

export const tenureGridData = {
  columns: [
    {
      id: "cut_block_id",
      label: "Cut Block ID",
      type: "input",
    },
    {
      id: "total_block_ha",
      label: "Total cut block hectares",
      type: "input",
    },
    {
      id: "ha_org_mapped_def_area",
      label: "Hectares originally mapped as priority deferral area",
      type: "input",
    },
    {
      id: "deferral_category_code",
      label: "Deferral category",
      info: "Deferral category - Check all that apply",
      type: "checkbox",
      //TODO: Make it dynamic, not hard-coded
      options: [
        { label: "Big Tree", value: "big_tree" },
        { label: "Ancient", value: "ancient" },
        { label: "Remnant", value: "remnant" },
      ],
    },
    {
      id: "ha_kept_org_mapping",
      label: "Hectares kept of original mapping",
      info: "Enter hectares kept of original priority deferral mapping",
      type: "input",
    },
    {
      id: "ha_added_org_mapping",
      label: "Hectares added to original mapping",
      type: "input",
    },
    {
      id: "ha_deleted_org_mapping",
      label: "Hectares deleted from original mapping",
      type: "input",
    },
  ],
  defaultNewData: {
    cut_block_id: "",
    total_block_ha: "",
    ha_org_mapped_def_area: "",
    deferral_category_code: [],
    ha_kept_org_mapping: "",
    ha_added_org_mapping: "",
    ha_deleted_org_mapping: "",
  },
  data: [],
};
