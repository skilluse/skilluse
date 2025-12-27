import { chromium } from "playwright"
import { writeFile, mkdir } from "fs/promises"
import { dirname, join } from "path"

interface Logo {
  name: string
  lightUrl: string
  darkUrl: string
  ext: string
}

const logos: Logo[] = [
  {
    name: "opencode",
    lightUrl: "https://mintcdn.com/agent-skills/dA2A66qiI3zp14E-/images/logos/opencode/opencode-wordmark-light.svg?fit=max&auto=format&n=dA2A66qiI3zp14E-&q=85&s=eeb58f1665556a825d8cac06ff3c4394",
    darkUrl: "https://mintcdn.com/agent-skills/dA2A66qiI3zp14E-/images/logos/opencode/opencode-wordmark-dark.svg?fit=max&auto=format&n=dA2A66qiI3zp14E-&q=85&s=d28a9bb63da536b5b1e1258bafa71a65",
    ext: "svg",
  },
  {
    name: "cursor",
    lightUrl: "https://mintcdn.com/agent-skills/dA2A66qiI3zp14E-/images/logos/cursor/LOCKUP_HORIZONTAL_2D_LIGHT.svg?fit=max&auto=format&n=dA2A66qiI3zp14E-&q=85&s=96db169c92f79bee00fade1ace1f3591",
    darkUrl: "https://mintcdn.com/agent-skills/dA2A66qiI3zp14E-/images/logos/cursor/LOCKUP_HORIZONTAL_2D_DARK.svg?fit=max&auto=format&n=dA2A66qiI3zp14E-&q=85&s=c9a7f00ed60afcbeca547ec9a44fc078",
    ext: "svg",
  },
  {
    name: "amp",
    lightUrl: "https://mintcdn.com/agent-skills/dA2A66qiI3zp14E-/images/logos/amp/amp-logo-light.svg?fit=max&auto=format&n=dA2A66qiI3zp14E-&q=85&s=d8b047b17d68235bc95055f82963b0d4",
    darkUrl: "https://mintcdn.com/agent-skills/dA2A66qiI3zp14E-/images/logos/amp/amp-logo-dark.svg?fit=max&auto=format&n=dA2A66qiI3zp14E-&q=85&s=bc41bd818745f6c3b3bf3ca23babf1c2",
    ext: "svg",
  },
  {
    name: "letta",
    lightUrl: "https://mintcdn.com/agent-skills/dA2A66qiI3zp14E-/images/logos/letta/Letta-logo-RGB_OffBlackonTransparent.svg?fit=max&auto=format&n=dA2A66qiI3zp14E-&q=85&s=a4ba4657c3d8ee7826bdaed12a2d0824",
    darkUrl: "https://mintcdn.com/agent-skills/dA2A66qiI3zp14E-/images/logos/letta/Letta-logo-RGB_GreyonTransparent.svg?fit=max&auto=format&n=dA2A66qiI3zp14E-&q=85&s=e0b3b7f83cfbd90d737bf66263760d31",
    ext: "svg",
  },
  {
    name: "goose",
    lightUrl: "https://mintcdn.com/agent-skills/aUl6sH_OARuhTQIw/images/logos/goose/goose-logo-black.png?fit=max&auto=format&n=aUl6sH_OARuhTQIw&q=85&s=8a50627518acef6d51ad70e4fc086b91",
    darkUrl: "https://mintcdn.com/agent-skills/aUl6sH_OARuhTQIw/images/logos/goose/goose-logo-white.png?fit=max&auto=format&n=aUl6sH_OARuhTQIw&q=85&s=42c415a9059fdd122ffffc233f5aa62c",
    ext: "png",
  },
  {
    name: "github",
    lightUrl: "https://mintcdn.com/agent-skills/dA2A66qiI3zp14E-/images/logos/github/GitHub_Lockup_Dark.svg?fit=max&auto=format&n=dA2A66qiI3zp14E-&q=85&s=5b4a21ef1de6f18a52ab685df3f2c09c",
    darkUrl: "https://mintcdn.com/agent-skills/dA2A66qiI3zp14E-/images/logos/github/GitHub_Lockup_Light.svg?fit=max&auto=format&n=dA2A66qiI3zp14E-&q=85&s=2fa805d2acf2c2bff3906b8f8506f946",
    ext: "svg",
  },
  {
    name: "vscode",
    lightUrl: "https://mintcdn.com/agent-skills/CEX0U_BzKcO91CZG/images/logos/vscode/vscode.svg?fit=max&auto=format&n=CEX0U_BzKcO91CZG&q=85&s=8d7272e6bf497e6d5a310d5df8d96a31",
    darkUrl: "https://mintcdn.com/agent-skills/CEX0U_BzKcO91CZG/images/logos/vscode/vscode-alt.svg?fit=max&auto=format&n=CEX0U_BzKcO91CZG&q=85&s=cd67d9621dcc7996a2af23c04b8667aa",
    ext: "svg",
  },
  {
    name: "claude-code",
    lightUrl: "https://mintcdn.com/agent-skills/dA2A66qiI3zp14E-/images/logos/claude-code/Claude-Code-logo-Slate.svg?fit=max&auto=format&n=dA2A66qiI3zp14E-&q=85&s=f9c1776db2268260a9a95aa6e779b5a8",
    darkUrl: "https://mintcdn.com/agent-skills/dA2A66qiI3zp14E-/images/logos/claude-code/Claude-Code-logo-Ivory.svg?fit=max&auto=format&n=dA2A66qiI3zp14E-&q=85&s=07e2709558d4be658e08d2c6f1909c54",
    ext: "svg",
  },
  {
    name: "claude",
    lightUrl: "https://mintcdn.com/agent-skills/dA2A66qiI3zp14E-/images/logos/claude-ai/Claude-logo-Slate.svg?fit=max&auto=format&n=dA2A66qiI3zp14E-&q=85&s=6a90948209cf5947d7253ab2d956e8fa",
    darkUrl: "https://mintcdn.com/agent-skills/dA2A66qiI3zp14E-/images/logos/claude-ai/Claude-logo-Ivory.svg?fit=max&auto=format&n=dA2A66qiI3zp14E-&q=85&s=54da4b0bf53c5005a05c43b626ce59f6",
    ext: "svg",
  },
  {
    name: "openai-codex",
    lightUrl: "https://mintcdn.com/agent-skills/QrL_Ot_XZTx_nfN1/images/logos/oai-codex/OAI_Codex-Lockup_400px.svg?fit=max&auto=format&n=QrL_Ot_XZTx_nfN1&q=85&s=f505b9eb7c087dedda1e960837d2785e",
    darkUrl: "https://mintcdn.com/agent-skills/QrL_Ot_XZTx_nfN1/images/logos/oai-codex/OAI_Codex-Lockup_400px_Darkmode.svg?fit=max&auto=format&n=QrL_Ot_XZTx_nfN1&q=85&s=289a3a60c7067692269a9d22a9c6a762",
    ext: "svg",
  },
]

async function downloadLogo(page: any, url: string, outputPath: string) {
  try {
    const response = await page.goto(url, { waitUntil: "networkidle" })
    if (response && response.ok()) {
      const buffer = await response.body()
      await mkdir(dirname(outputPath), { recursive: true })
      await writeFile(outputPath, buffer)
      console.log(`✓ Downloaded: ${outputPath}`)
      return true
    } else {
      console.log(`✗ Failed: ${url} - ${response?.status()}`)
      return false
    }
  } catch (error) {
    console.log(`✗ Error: ${url} - ${error}`)
    return false
  }
}

async function main() {
  const outputDir = join(process.cwd(), "public/logos")

  console.log("Launching browser...")
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  })
  const page = await context.newPage()

  // First visit a page that uses these images to get proper session/cookies
  console.log("Visiting agent-skills.dev to establish session...")
  await page.goto("https://agent-skills.dev/", { waitUntil: "networkidle" })
  await page.waitForTimeout(2000)

  console.log(`\nDownloading ${logos.length} logos to ${outputDir}...\n`)

  for (const logo of logos) {
    // Download light version
    await downloadLogo(
      page,
      logo.lightUrl,
      join(outputDir, `${logo.name}-light.${logo.ext}`)
    )

    // Download dark version
    await downloadLogo(
      page,
      logo.darkUrl,
      join(outputDir, `${logo.name}-dark.${logo.ext}`)
    )
  }

  await browser.close()
  console.log("\nDone!")
}

main().catch(console.error)
