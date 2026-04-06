import { asyncHandler } from '../lib/async-handler.js';
import { getDashboardSnapshot } from '../services/dashboard.service.js';

export const getAdminDashboard = asyncHandler(async (_req, res) => {
  const snapshot = await getDashboardSnapshot();

  res.json({
    success: true,
    data: snapshot,
  });
});
