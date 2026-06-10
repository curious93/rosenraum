/**
 * Erklär-Inhalte für die vier GFK-Dimensionen — motivierend, charmant, mit Beispielen.
 * Wird im Dimension-Info-Modal des GFK-Panels angezeigt.
 */

/** Schlüssel der vier GFK-Dimensionen */
export type GfkDimKey = 'beobachtung' | 'gefuehl' | 'beduerfnis' | 'bitte'

/** Erklär-Inhalt einer Dimension fürs Info-Modal */
export interface GfkDimensionInfo {
  /** Anzeigename */
  title: string
  /** Emoji fürs Modal-Header */
  emoji: string
  /** Was ist das? (2–3 Sätze, warm) */
  intro: string
  /** Was ist daran schwierig? */
  challenge: string
  /** Ein Beispielpaar schlecht → gut */
  example: { vorher: string; nachher: string }
  /** Was daran schön ist */
  beauty: string
  /** Wie sich die Lernkurve anfühlt */
  curve: string
  /** Kurz-Tipp für die „noch nicht enthalten"-Zeile (1 Satz) */
  nudgeTip: string
  /** Beispiel-Satzanfang zum Ausprobieren */
  nudgeExample: string
}

/**
 * Inhalte je Dimension.
 *
 * @example
 * GFK_DIMENSION_INFO.beobachtung.title // 'Beobachtung'
 */
export const GFK_DIMENSION_INFO: Record<GfkDimKey, GfkDimensionInfo> = {
  beobachtung: {
    title: 'Beobachtung',
    emoji: '🔍',
    intro:
      'Eine Beobachtung beschreibt, was eine Kamera aufgezeichnet hätte — ohne Urteil, ohne Etikett. „Du bist 20 Minuten nach der verabredeten Zeit gekommen" kann jeder nachprüfen. „Du bist unzuverlässig" ist dagegen schon ein Urteil.',
    challenge:
      'Unser Gehirn urteilt blitzschnell. Wörter wie „immer", „nie" oder „typisch" rutschen heraus, bevor wir es merken — und genau sie lösen beim Gegenüber Verteidigung aus statt Verständnis.',
    example: {
      vorher: 'Nie hörst du mir zu!',
      nachher: 'Als ich vorhin von meinem Tag erzählt habe, hast du aufs Handy geschaut.',
    },
    beauty:
      'Eine saubere Beobachtung kann niemand bestreiten. Sie öffnet das Gespräch, statt es zu schließen — ihr redet über dasselbe Ereignis, nicht über zwei verschiedene Wahrheiten.',
    curve:
      'Anfangs fühlt es sich ungewohnt nüchtern an, wie ein Polizeibericht. Nach ein paar Wochen merkst du: Gespräche kippen viel seltener, weil sich niemand mehr angegriffen fühlt. Das ist der Moment, in dem es Spaß macht.',
    nudgeTip: 'Eine Beobachtung beschreibt, was konkret passiert ist — ohne Bewertung.',
    nudgeExample: '„Heute Morgen ist … passiert."',
  },
  gefuehl: {
    title: 'Gefühl',
    emoji: '🧡',
    intro:
      'Ein Gefühl ist das, was in dir lebendig ist: Freude, Ärger, Traurigkeit, Erleichterung. Echte Gefühlswörter brauchen kein Gegenüber — „ich bin enttäuscht" gehört dir ganz allein.',
    challenge:
      'Verkappte Vorwürfe tarnen sich gern als Gefühl: „Ich fühle mich ignoriert" klingt nach Gefühl, zeigt aber heimlich mit dem Finger. Der Schnelltest: Steckt ein Täter im Satz? Dann ist es kein Gefühl.',
    example: {
      vorher: 'Ich fühle mich total ausgenutzt von dir.',
      nachher: 'Ich bin erschöpft und ehrlich gesagt ein bisschen traurig.',
    },
    beauty:
      'Wer ein echtes Gefühl zeigt, macht sich einen Moment verletzlich — und genau das lädt den anderen ein, weich zu antworten statt zurückzuschießen.',
    curve:
      'Dein Gefühlswortschatz wächst wie ein Muskel. Aus „gut" und „schlecht" werden mit der Zeit zwanzig Schattierungen — und plötzlich verstehst du dich selbst besser.',
    nudgeTip: 'Ein Gefühl zeigt, was die Situation mit dir macht.',
    nudgeExample: '„Ich bin … (enttäuscht, froh, erschöpft)."',
  },
  beduerfnis: {
    title: 'Bedürfnis',
    emoji: '🌱',
    intro:
      'Hinter jedem Gefühl steht ein Bedürfnis: Verlässlichkeit, Nähe, Ruhe, Respekt, Mitgestaltung. Bedürfnisse sind universell — jeder Mensch kennt sie, deshalb kann sie auch jeder nachfühlen.',
    challenge:
      'Wir sind es gewohnt, über andere zu sprechen statt über das, was uns wichtig ist. „Weil du nie da bist" meint eigentlich: „weil mir gemeinsame Zeit wichtig ist" — aber der erste Satz kommt schneller über die Lippen.',
    example: {
      vorher: 'Du kümmerst dich um gar nichts!',
      nachher: 'Mir ist wichtig, dass wir uns die Verantwortung teilen.',
    },
    beauty:
      'Sobald das Bedürfnis auf dem Tisch liegt, gibt es plötzlich viele Wege — nicht nur den einen, um den gestritten wurde. Aus einem Machtkampf wird ein gemeinsames Rätsel.',
    curve:
      'Am Anfang klingt „weil mir … wichtig ist" ungewohnt feierlich. Bald wird es zur stärksten Brücke in jedem schwierigen Gespräch — und du fragst dich, wie du je ohne ausgekommen bist.',
    nudgeTip: 'Ein Bedürfnis sagt, was dir wichtig ist.',
    nudgeExample: '„…weil mir … wichtig ist."',
  },
  bitte: {
    title: 'Bitte',
    emoji: '💜',
    intro:
      'Eine Bitte sagt konkret, was du dir wünschst — machbar, positiv formuliert, im Hier und Jetzt. „Wärst du bereit, mir kurz zu schreiben, wenn du später kommst?" Das Gegenüber weiß sofort, was es tun kann.',
    challenge:
      'Der Unterschied zur Forderung zeigt sich erst beim Nein: Wenn ein Nein in Ordnung ist, war es eine Bitte. Wenn Schweigen, Schmollen oder Strafe folgt, war es eine Forderung im Bitte-Kostüm.',
    example: {
      vorher: 'Sei endlich mal pünktlich!',
      nachher: 'Magst du mir Bescheid geben, wenn es später wird?',
    },
    beauty:
      'Eine echte Bitte gibt dem anderen Freiheit — und gerade deshalb sagen Menschen öfter ja. Freiwilligkeit fühlt sich auf beiden Seiten besser an als Nachgeben.',
    curve:
      'Mit etwas Übung merkst du schon beim Tippen, ob in deinem Satz ein verstecktes „musst du" wohnt. Dann formulierst du um — und staunst, wie anders die Antworten ausfallen.',
    nudgeTip: 'Eine Bitte sagt konkret, was du dir wünschst.',
    nudgeExample: '„Wärst du bereit, …?"',
  },
}
