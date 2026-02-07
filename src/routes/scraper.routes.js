import { Router } from "express";
import { runScrapingPipeline } from "../services/scraper.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.use(verifyJwt);
router.use(requireAdmin);

/**
 * Trigger the scraping pipeline manually
 * POST /api/v1/scraper/run
 */
router.route("/run").post(asyncHandler(async (req, res) => {
    const results = await runScrapingPipeline();
    return res.status(200).json(
        new ApiResponse(200, results, "Scraping pipeline executed successfully")
    );
}));

export default router;
