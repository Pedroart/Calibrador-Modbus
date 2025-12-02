import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ msg: "Lista de entrypoints" });
});

export default router;
