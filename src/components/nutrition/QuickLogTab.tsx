import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Loader2, Sparkles, Trash2 } from 'lucide-react'
import { invokeFunction } from '../../lib/invokeFunction'

interface ParsedItem {
  name: string
  grams: number
  calories: number
  protein: number
  carbs: number
  fat: number
  sugar: number
}

interface ParseMealResponse {
  items: ParsedItem[]
  total: { calories: number; protein: number; carbs: number; fat: number; sugar: number }
  assumptions: string[]
}

interface QuickLogTabProps {
  onParsed: (items: ParsedItem[], sentence: string) => void
}

export default function QuickLogTab({ onParsed }: QuickLogTabProps) {
  const [sentence, setSentence] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parsed, setParsed] = useState<ParseMealResponse | null>(null)
  const [editedItems, setEditedItems] = useState<ParsedItem[]>([])
  const [listening, setListening] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  // Sync editable items when parse result arrives
  useEffect(() => {
    if (parsed) setEditedItems(parsed.items.map((i) => ({ ...i })))
  }, [parsed])

  function toggleMic() {
    type SpeechRecCtor = new () => {
      lang: string
      interimResults: boolean
      onresult: ((e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => void) | null
      onend: (() => void) | null
      onerror: (() => void) | null
      start(): void
      stop(): void
    }
    const win = window as unknown as { SpeechRecognition?: SpeechRecCtor; webkitSpeechRecognition?: SpeechRecCtor }
    const SpeechRec = win.SpeechRecognition ?? win.webkitSpeechRecognition
    if (!SpeechRec) return

    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    const rec = new SpeechRec()
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setSentence((prev) => (prev ? `${prev} ${transcript}` : transcript))
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recognitionRef.current = rec
    rec.start()
    setListening(true)
  }

  async function handleParse() {
    const trimmed = sentence.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    setParsed(null)
    try {
      const result = await invokeFunction<ParseMealResponse>('parse-meal', { sentence: trimmed })
      setParsed(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse meal')
    } finally {
      setLoading(false)
    }
  }

  function updateItem(index: number, field: keyof ParsedItem, value: string) {
    const num = parseFloat(value)
    if (isNaN(num) || num < 0) return
    setEditedItems((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: Math.round(num * 10) / 10 }
      return next
    })
  }

  function removeItem(index: number) {
    setEditedItems((prev) => prev.filter((_, i) => i !== index))
  }

  const editedTotal = editedItems.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  function handleAdd() {
    if (editedItems.length === 0) return
    onParsed(editedItems, sentence.trim())
    setSentence('')
    setParsed(null)
    setEditedItems([])
  }

  const win2 = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }
  const hasSpeech = !!(win2.SpeechRecognition ?? win2.webkitSpeechRecognition)

  return (
    <div className="space-y-4">
      {/* Input row */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <textarea
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            placeholder="e.g. two chicken breasts, rice and broccoli"
            rows={2}
            className="w-full bg-bg-card border border-border rounded-2xl px-4 py-3 text-text-primary text-sm placeholder-text-tertiary resize-none focus:outline-none focus:border-accent-red/60"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleParse()
              }
            }}
          />
        </div>
        {hasSpeech && (
          <button
            onClick={toggleMic}
            className={`flex-shrink-0 w-11 h-11 mt-1 rounded-2xl border flex items-center justify-center transition-colors ${
              listening
                ? 'border-accent-red bg-accent-red/10 text-accent-red'
                : 'border-border text-text-tertiary'
            }`}
            aria-label={listening ? 'Stop recording' : 'Speak meal'}
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        )}
      </div>

      {/* Parse button */}
      <button
        onClick={handleParse}
        disabled={!sentence.trim() || loading}
        className="w-full py-3 rounded-2xl bg-accent-red/10 border border-accent-red/30 text-accent-red font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-40 active:opacity-70"
      >
        {loading ? (
          <><Loader2 size={16} className="animate-spin" /> Analysing...</>
        ) : (
          <><Sparkles size={16} /> Analyse with AI</>
        )}
      </button>

      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}

      {/* Parsed items — editable */}
      {parsed && editedItems.length > 0 && (
        <div className="space-y-3">
          <p className="text-text-secondary text-xs uppercase tracking-widest">Review items</p>

          {editedItems.map((item, i) => (
            <div key={i} className="bg-bg-card border border-border rounded-2xl p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-text-primary font-semibold text-sm leading-snug flex-1">{item.name}</p>
                <button
                  onClick={() => removeItem(i)}
                  className="text-text-tertiary p-1 -mr-1 active:text-red-400"
                  aria-label="Remove item"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Macro grid */}
              <div className="grid grid-cols-4 gap-1.5">
                {(['calories', 'protein', 'carbs', 'fat'] as const).map((field) => (
                  <div key={field} className="flex flex-col items-center">
                    <input
                      type="number"
                      min={0}
                      step={field === 'calories' ? 1 : 0.1}
                      value={item[field]}
                      onChange={(e) => updateItem(i, field, e.target.value)}
                      className="w-full text-center bg-bg-elevated border border-border rounded-xl py-1.5 text-text-primary text-xs font-medium focus:outline-none focus:border-accent-red/60"
                    />
                    <span className="text-text-tertiary text-[10px] mt-0.5 capitalize">{field === 'calories' ? 'kcal' : `${field}g`}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Assumptions */}
          {parsed.assumptions.length > 0 && (
            <div className="bg-bg-card border border-border/50 rounded-xl px-3 py-2">
              <p className="text-text-tertiary text-xs mb-1 font-medium">AI assumptions</p>
              {parsed.assumptions.map((a, i) => (
                <p key={i} className="text-text-tertiary text-xs leading-relaxed">• {a}</p>
              ))}
            </div>
          )}

          {/* Total + Add button */}
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-text-primary font-bold text-base">{Math.round(editedTotal.calories)} kcal</p>
              <p className="text-text-tertiary text-xs">
                P {Math.round(editedTotal.protein)}g · C {Math.round(editedTotal.carbs)}g · F {Math.round(editedTotal.fat)}g
              </p>
            </div>
            <button
              onClick={handleAdd}
              disabled={editedItems.length === 0}
              className="bg-accent-red text-white font-semibold text-sm px-5 py-2.5 rounded-2xl disabled:opacity-40 active:opacity-80"
            >
              Add to meal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
