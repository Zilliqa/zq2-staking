import type { NextApiRequest, NextApiResponse } from "next"

function getStringFromEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is not defined`)
  }

  return value
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const previewSecret = getStringFromEnv("ZQ2_PREVIEW_SECRET_HASH")

  const { secretHash } = req.query

  if (secretHash !== previewSecret) {
    res.status(401).json({})
    return
  }

  res.status(200).json({})
}
