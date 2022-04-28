export const licenseeData = [
  {
    label: "Licensee or agreement holder",
    id: "licensee_name",
    modelValue: "",
    note: "Enter the licensee or agreement holder",
  },
  {
    label: "Address",
    id: "licensee_address",
    modelValue: "",
  },
  {
    label: "City/Town",
    id: "licensee_city",
    modelValue: "",
  },
  {
    label: "Province",
    id: "licensee_province",
    modelValue: "",
  },
  {
    label: "Postal code",
    id: "licensee_postal_code",
    modelValue: "",
  },
  {
    label: "Phone number",
    id: "licensee_phone",
    modelValue: "",
    note: "Licensee or agreement holder's phone number",
  },
  {
    label: "Email",
    id: "licensee_email",
    modelValue: "",
    note: "Licensee or agreement holder's email",
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
      label: "Check all that apply",
      type: "radio",
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
    deferral_category_code: ["big_tree"],
    ha_kept_org_mapping: "",
    ha_added_org_mapping: "",
    ha_deleted_org_mapping: "",
  },
  data: [],
};
