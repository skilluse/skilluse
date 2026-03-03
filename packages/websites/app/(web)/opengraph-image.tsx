import { ImageResponse } from "next/og"
import { config } from "~/config"

export const alt = config.site.name
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          backgroundColor: "#111111",
        }}
      >
        {/* Left column — product info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 48px 64px 72px",
            flex: "1 1 0",
          }}
        >
          {/* Top: brand dot + label */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#3e9fff",
              }}
            />
            <span
              style={{
                color: "#3e9fff",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                fontFamily: "monospace",
              }}
            >
              SKILLUSE
            </span>
          </div>

          {/* Bottom: title + tagline + URL */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div
              style={{
                color: "#ffffff",
                fontSize: "58px",
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: "-0.025em",
                fontFamily: "sans-serif",
              }}
            >
              {"Manage AI Agent\nSkills with Ease"}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.38)",
                fontSize: "20px",
                fontWeight: 400,
                lineHeight: 1.5,
                fontFamily: "sans-serif",
              }}
            >
              {"Install, share, and publish skills for\nClaude Code, Cursor, Codex, and more."}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.18)",
                fontSize: "14px",
                fontFamily: "monospace",
                letterSpacing: "0.06em",
                marginTop: "4px",
              }}
            >
              skilluse.dev
            </div>
          </div>
        </div>

        {/* Vertical divider */}
        <div
          style={{
            width: "1px",
            background: "rgba(255,255,255,0.06)",
            margin: "48px 0",
          }}
        />

        {/* Right column — terminal mockup */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "460px",
            padding: "52px 56px 52px 44px",
            justifyContent: "center",
          }}
        >
          {/* Window chrome */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            {/* Traffic lights */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "13px 16px",
                gap: "7px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
            </div>

            {/* Terminal lines */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "22px 22px 26px",
                fontFamily: "monospace",
                fontSize: "12.5px",
                lineHeight: "2",
                gap: "0px",
              }}
            >
              <div style={{ display: "flex", color: "rgba(255,255,255,0.55)" }}>
                <span style={{ color: "rgba(255,255,255,0.2)", marginRight: "8px" }}>$</span>
                <span style={{ color: "#3e9fff" }}>skilluse</span>
                <span style={{ color: "rgba(255,255,255,0.55)", marginLeft: "6px" }}>skill install commit</span>
              </div>
              <div style={{ display: "flex", color: "rgba(255,255,255,0.28)" }}>
                <span style={{ marginRight: "6px" }}>✓</span>
                <span>Installing from skilluse/skilluse</span>
              </div>
              <div style={{ display: "flex", color: "rgba(255,255,255,0.28)" }}>
                <span style={{ marginRight: "6px" }}>✓</span>
                <span>{"Installed to ~/.claude/skills/"}</span>
              </div>
              <div style={{ display: "flex", color: "rgba(255,255,255,0.55)", marginTop: "10px" }}>
                <span style={{ color: "rgba(255,255,255,0.2)", marginRight: "8px" }}>$</span>
                <span style={{ color: "#3e9fff" }}>skilluse</span>
                <span style={{ color: "rgba(255,255,255,0.55)", marginLeft: "6px" }}>skill list</span>
              </div>
              <div style={{ display: "flex", color: "rgba(255,255,255,0.55)" }}>
                <span style={{ color: "rgba(255,255,255,0.8)", marginRight: "8px", minWidth: "70px" }}>commit</span>
                <span style={{ color: "rgba(255,255,255,0.25)" }}>v1.0  skilluse/skilluse</span>
              </div>
              <div style={{ display: "flex", color: "rgba(255,255,255,0.55)" }}>
                <span style={{ color: "rgba(255,255,255,0.8)", marginRight: "8px", minWidth: "70px" }}>review-pr</span>
                <span style={{ color: "rgba(255,255,255,0.25)" }}>v2.1  my-team/skills</span>
              </div>
              <div style={{ display: "flex", color: "rgba(255,255,255,0.55)" }}>
                <span style={{ color: "rgba(255,255,255,0.8)", marginRight: "8px", minWidth: "70px" }}>deploy</span>
                <span style={{ color: "rgba(255,255,255,0.25)" }}>v1.3  my-team/skills</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
