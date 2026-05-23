import { D2 } from "../theme";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Rule } from "../components/Rule";
import { useViewportSize } from "../hooks/useViewportSize";
import { bySize, pageX } from "../lib/responsive";

// About: an artist statement presented like gallery wall text (SPEC §8).
// Centered single column: dictionary entry → hairline rule → single statement
// paragraph. No per-section labels (the single statement is final).
export default function About() {
  const size = useViewportSize();
  const compact = size === "mobile";

  return (
    <>
      <Header view="about" />
      <main style={{ padding: `${bySize(size, 40, 64, 96)}px ${pageX(size)}px ${compact ? 48 : 80}px` }}>
        <div style={{ maxWidth: bySize(size, "100%", 580, 640), margin: "0 auto" }}>
          {/* Dictionary-entry treatment for the word itself */}
          <section style={{ textAlign: "center", marginBottom: compact ? 44 : 72 }}>
            <div
              style={{
                font: `400 11px/1 ${D2.mono}`,
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                color: D2.accent,
                marginBottom: compact ? 22 : 32,
              }}
            >
              On the word
            </div>
            <h1
              style={{
                font: `italic 400 ${bySize(size, "72px", "108px", "132px")}/1 ${D2.serif}`,
                margin: 0,
                letterSpacing: "0.01em",
                color: D2.ink,
              }}
            >
              tipig
            </h1>
            <div
              style={{
                marginTop: compact ? 18 : 26,
                display: "inline-flex",
                gap: 10,
                alignItems: "center",
                font: `400 ${compact ? "11px" : "12px"}/1 ${D2.mono}`,
                letterSpacing: "0.18em",
                color: D2.inkSoft,
              }}
            >
              <span>\ ˈti·pig \</span>
              <span style={{ width: 4, height: 4, borderRadius: 4, background: D2.rule }} />
              <span style={{ textTransform: "uppercase", letterSpacing: "0.3em" }}>
                Hiligaynon
              </span>
              <span style={{ width: 4, height: 4, borderRadius: 4, background: D2.rule }} />
              <span
                style={{
                  fontStyle: "italic",
                  fontFamily: D2.serifBody,
                  fontSize: compact ? 13 : 14,
                }}
              >
                v.
              </span>
            </div>
            <p
              style={{
                margin: `${compact ? 28 : 40}px auto 0`,
                maxWidth: 520,
                font: `italic 400 ${compact ? "18px" : "22px"}/1.5 ${D2.serifBody}`,
                color: D2.ink,
                textWrap: "pretty",
              }}
            >
              Preserving, keeping (in a safe state); to guard well, reserve, preserve, keep, and
              save.
            </p>
          </section>

          <Rule />

          {/* Statement */}
          <section style={{ marginTop: compact ? 44 : 72 }}>
            <p
              style={{
                margin: 0,
                font: `400 ${compact ? "17px" : "19px"}/1.65 ${D2.serifBody}`,
                color: D2.ink,
                textWrap: "pretty",
              }}
            >
              Whenever I close my eyes, I see only black, and memories slip away from me easily. I
              use my camera to hold onto them. The photos here catch imperfect, emotional moments,
              happy and messy alike, so I can remember them. Each one is a reminder, something that
              makes me feel again. It is how I <em style={{ fontStyle: "italic" }}>tipigan</em> what
              matters to me, a gallery of my imperfect and (more often than not) romanticized
              memories.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
