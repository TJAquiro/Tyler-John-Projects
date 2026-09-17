import { test } from "./fixtures";
import { registerAccountLifecycleTests } from "./scenarios";

test.describe.configure({ mode: "serial" });
registerAccountLifecycleTests();
