import { nextTick } from "vue";
import { describe, it, expect } from "vitest";
import { mount, shallowMount } from "@vue/test-utils";

import MapViewer from "../components/MapViewer.vue";

describe("MapViewer", () => {
  it("renders properly", async () => {
    const wrapper = mount(MapViewer);
    await nextTick();
    expect(wrapper.html()).toMatchSnapshot();
    // expect(wrapper.find("#mapContainer").exists()).toBe(true);
  });
});
