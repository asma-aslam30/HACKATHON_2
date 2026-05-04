/**
 * Better Auth API Route (Next.js Pages Router)
 * All auth requests are handled here: /api/auth/*
 */

import { auth } from "../../../lib/auth";
import { toNodeHandler } from "better-auth/node";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default toNodeHandler(auth.handler);