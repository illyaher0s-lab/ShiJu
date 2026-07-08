import type { CandidateExpression } from "@art/domain";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";
import { generateContextCard } from "../../api/articles";

interface ContextCardGeneratorProps {
  onAccept: (draft: CandidateExpression) => void;
}

export function ContextCardGenerator({ onAccept }: ContextCardGeneratorProps) {
  const [expression, setExpression] = useState("");
  const [contextLabel, setContextLabel] = useState("");
  const [contextNote, setContextNote] = useState("");
  const [sentence, setSentence] = useState("");
  const [draft, setDraft] = useState<CandidateExpression | null>(null);
  const [generating, setGenerating] = useState(false);

  async function generate() {
    if (!expression.trim() || !contextLabel.trim()) return;
    
    setGenerating(true);
    try {
      const generatedDraft = await generateContextCard({
        expression,
        contextLabel,
        contextNote,
        sentence,
      });
      setDraft(generatedDraft);
    } catch (err) {
      console.error('Failed to generate context card:', err);
      alert(err instanceof Error ? err.message : 'Failed to generate card');
    } finally {
      setGenerating(false);
    }
  }

  function acceptDraft() {
    if (!draft) return;
    onAccept(draft);
    setExpression("");
    setContextLabel("");
    setContextNote("");
    setSentence("");
    setDraft(null);
  }

  function dismissDraft() {
    setDraft(null);
  }

  return (
    <div style={{
      background: 'var(--vercel-white)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-card)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: 'var(--space-4)',
        borderBottom: '1px solid var(--vercel-gray-200)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}>
          <Sparkles size={20} color="var(--vercel-develop-blue)" />
          <h3 style={{
            fontSize: '18px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--vercel-black)',
            margin: 0,
          }}>
            Add Card from Context
          </h3>
        </div>
        <p style={{
          marginTop: 'var(--space-1)',
          fontSize: '14px',
          fontWeight: 400,
          color: 'var(--vercel-gray-600)',
          lineHeight: '1.5',
        }}>
          Create a vocabulary card from a word or phrase you encountered
        </p>
      </div>

      {/* Form */}
      <div style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {/* Expression input */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--vercel-gray-900)',
              marginBottom: '8px',
            }}>
              Expression or phrase <span style={{ color: 'var(--vercel-ship-red)' }}>*</span>
            </label>
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="e.g., take a rain check, buff, nerf"
              disabled={generating}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                fontWeight: 400,
                color: 'var(--vercel-gray-900)',
                background: 'var(--vercel-white)',
                border: '1px solid var(--vercel-gray-300)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--vercel-black)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--vercel-gray-300)'}
            />
          </div>

          {/* Context label */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--vercel-gray-900)',
              marginBottom: '8px',
            }}>
              Context <span style={{ color: 'var(--vercel-ship-red)' }}>*</span>
            </label>
            <input
              type="text"
              value={contextLabel}
              onChange={(e) => setContextLabel(e.target.value)}
              placeholder="e.g., gaming, conversation, work email"
              disabled={generating}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                fontWeight: 400,
                color: 'var(--vercel-gray-900)',
                background: 'var(--vercel-white)',
                border: '1px solid var(--vercel-gray-300)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--vercel-black)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--vercel-gray-300)'}
            />
          </div>

          {/* Original sentence */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--vercel-gray-900)',
              marginBottom: '8px',
            }}>
              Original sentence{' '}
              <span style={{ fontWeight: 400, color: 'var(--vercel-gray-500)' }}>
                (optional, helps AI understand better)
              </span>
            </label>
            <textarea
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              placeholder="e.g., Can I take a rain check on dinner tonight?"
              disabled={generating}
              rows={2}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                fontWeight: 400,
                color: 'var(--vercel-gray-900)',
                background: 'var(--vercel-white)',
                border: '1px solid var(--vercel-gray-300)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--vercel-black)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--vercel-gray-300)'}
            />
          </div>

          {/* Additional notes */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--vercel-gray-900)',
              marginBottom: '8px',
            }}>
              Additional notes{' '}
              <span style={{ fontWeight: 400, color: 'var(--vercel-gray-500)' }}>
                (optional)
              </span>
            </label>
            <textarea
              value={contextNote}
              onChange={(e) => setContextNote(e.target.value)}
              placeholder="e.g., Friend said this when canceling plans"
              disabled={generating}
              rows={2}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                fontWeight: 400,
                color: 'var(--vercel-gray-900)',
                background: 'var(--vercel-white)',
                border: '1px solid var(--vercel-gray-300)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--vercel-black)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--vercel-gray-300)'}
            />
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={!expression.trim() || !contextLabel.trim() || generating}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-1)',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--vercel-white)',
              background: generating ? 'var(--vercel-gray-400)' : 'var(--vercel-black)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: generating ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              opacity: (!expression.trim() || !contextLabel.trim()) ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!generating && expression.trim() && contextLabel.trim()) {
                e.currentTarget.style.background = 'var(--vercel-gray-900)';
              }
            }}
            onMouseLeave={(e) => {
              if (!generating) {
                e.currentTarget.style.background = 'var(--vercel-black)';
              }
            }}
          >
            <Sparkles size={16} />
            {generating ? 'Generating...' : 'Generate Card'}
          </button>
        </div>
      </div>

      {/* Generated draft preview */}
      {draft && (
        <div style={{
          margin: 'var(--space-4)',
          marginTop: 0,
          padding: 'var(--space-4)',
          background: 'var(--vercel-gray-50)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--vercel-gray-200)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 'var(--space-3)',
          }}>
            <div style={{
              display: 'inline-block',
              padding: '4px 8px',
              fontSize: '12px',
              fontWeight: 500,
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--vercel-develop-blue)',
              background: 'rgba(10, 114, 239, 0.1)',
              borderRadius: 'var(--radius-sm)',
            }}>
              {draft.type?.replace('_', ' ')}
            </div>
            <button
              onClick={dismissDraft}
              style={{
                padding: '4px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--vercel-gray-500)',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--vercel-gray-900)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--vercel-gray-500)'}
            >
              <X size={16} />
            </button>
          </div>

          <h4 style={{
            fontSize: '20px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--vercel-black)',
            marginBottom: 'var(--space-2)',
          }}>
            {draft.expression}
          </h4>

          <div style={{
            fontSize: '14px',
            color: 'var(--vercel-gray-700)',
            lineHeight: '1.6',
            marginBottom: 'var(--space-2)',
          }}>
            {draft.localMeaning}
          </div>

          <div style={{
            fontSize: '14px',
            color: 'var(--vercel-gray-600)',
            marginBottom: 'var(--space-3)',
          }}>
            {draft.meaningZh}
          </div>

          {draft.sentence && (
            <div style={{
              padding: 'var(--space-2)',
              background: 'var(--vercel-white)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--vercel-gray-200)',
              marginBottom: 'var(--space-2)',
            }}>
              <div style={{
                fontSize: '14px',
                color: 'var(--vercel-gray-900)',
                marginBottom: '4px',
                fontStyle: 'italic',
              }}>
                {draft.sentence}
              </div>
              {draft.sentenceTranslation && (
                <div style={{
                  fontSize: '13px',
                  color: 'var(--vercel-gray-600)',
                }}>
                  {draft.sentenceTranslation}
                </div>
              )}
            </div>
          )}

          <button
            onClick={acceptDraft}
            style={{
              width: '100%',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--vercel-white)',
              background: 'var(--vercel-black)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--vercel-gray-900)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--vercel-black)'}
          >
            Add to Review
          </button>
        </div>
      )}
    </div>
  );
}
