import { Router } from "express";
import { db, provinces, districts, communes, villages } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// Get all provinces
router.get("/geo/provinces", async (req, res) => {
  try {
    const data = await db.select().from(provinces).orderBy(provinces.nameKh);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch provinces" });
  }
});

// Get districts by provinceCode
router.get("/geo/districts", async (req, res) => {
  const { provinceCode } = req.query;
  try {
    const data = await db.select()
      .from(districts)
      .where(provinceCode ? eq(districts.provinceCode, provinceCode as string) : undefined)
      .orderBy(districts.nameKh);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch districts" });
  }
});

// Get communes by districtCode
router.get("/geo/communes", async (req, res) => {
  const { districtCode } = req.query;
  try {
    const data = await db.select()
      .from(communes)
      .where(districtCode ? eq(communes.districtCode, districtCode as string) : undefined)
      .orderBy(communes.nameKh);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch communes" });
  }
});

// Get villages by communeCode
router.get("/geo/villages", async (req, res) => {
  const { communeCode } = req.query;
  try {
    const data = await db.select()
      .from(villages)
      .where(communeCode ? eq(villages.communeCode, communeCode as string) : undefined)
      .orderBy(villages.nameKh);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch villages" });
  }
});

export default router;
