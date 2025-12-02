import { Router } from "express";
import entrypoints from "./entrypoints.js";
import offsets from "./offsets.js";

const router = Router();

router.use("/entrypoints", entrypoints);
router.use("/offsets", offsets);

export default router;
