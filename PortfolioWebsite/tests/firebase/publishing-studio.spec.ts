import { test } from "./fixtures";
import { registerPublishingStudioTests } from "./scenarios";

test.describe.configure({ mode: "serial" });
registerPublishingStudioTests();
