import { test } from "./fixtures";
import { registerDraftRecoveryTests } from "./scenarios";

test.describe.configure({ mode: "serial" });
registerDraftRecoveryTests();
