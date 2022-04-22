import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";

import MainHeader from "../containers/MainHeader.vue";

describe("MainHeader", () => {
  it("renders properly", () => {
    const wrapper = mount(MainHeader);
    expect(wrapper.text()).toContain("FSA - Old Growth");
  });
});
