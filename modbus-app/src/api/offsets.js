import { Router } from "express";
import { offset } from "../memory/register-map.js";

const router = Router();

router.post("/:id", (req, res) => {
  const id = Number(req.params.id);
  const value = Number(req.body.value);

  offset[id] = value;

  res.json({ ok: true, id, value });
});

export default router;
