import { test } from "./fixtures";
import { registerPublicationServerTests } from "./scenarios";

test.describe.configure({ mode: "serial" });
registerPublicationServerTests();
