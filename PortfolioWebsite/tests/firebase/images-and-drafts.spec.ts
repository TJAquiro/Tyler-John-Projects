import { test } from "./fixtures";
import { registerImageAndDraftApiTests } from "./scenarios";

test.describe.configure({ mode: "serial" });
registerImageAndDraftApiTests();
