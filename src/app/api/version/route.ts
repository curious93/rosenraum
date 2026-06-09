import { NextResponse } from 'next/server'

/**
 * GET /api/version
 * Returns the git commit SHA baked in at build time.
 * Use this to verify which exact code is running on production.
 *
 * @returns JSON with sha field containing the git commit SHA
 */
export async function GET() {
  return NextResponse.json({ sha: process.env.COMMIT_SHA ?? 'unknown' })
}
