/**
 * SharePanel.jsx
 * Save config to backend → get shareable URL.
 * Copies URL to clipboard on click.
 */
import { useState } from 'react';
import useConfigStore from '../../store/useConfigStore.js';
import { saveConfig } from '../../services/configService.js';
import { SectionTitle } from './DimensionControls.jsx';

const SharePanel = () => {
  const { getSnapshot, shareUrl, setShareUrl, isSaving, setIsSaving } = useConfigStore();
  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const snapshot = getSnapshot();
      const result   = await saveConfig(snapshot);
      setShareUrl(result.shareUrl);
    } catch (err) {
      console.error('[Share] Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="p-3 pb-2">
      <SectionTitle icon="⟳" title="Save & Share" />

      <div className="mt-1.5 space-y-1.5">
        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-2 text-xs font-medium rounded-lg transition-all
            border border-white/10 text-white/60
            hover:border-accent/40 hover:text-accent hover:bg-accent/5
            disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          {isSaving ? (
            <>
              <span className="inline-block w-2.5 h-2.5 border border-white/30
                border-t-accent rounded-full animate-spin" />
              <span>Saving…</span>
            </>
          ) : (
            '⟳ Share Link'
          )}
        </button>

        {/* Share URL */}
        {shareUrl && (
          <div
            onClick={handleCopy}
            className="flex items-center gap-2 p-2 rounded-lg bg-surface2
              border border-accent/20 cursor-pointer
              hover:border-accent/40 transition-all group"
          >
            <span className="text-[9px] font-mono text-white/40 flex-1 truncate">
              {shareUrl}
            </span>
            <span className="text-[9px] text-accent flex-shrink-0 font-medium">
              {copied ? '✓' : 'Copy'}
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

export default SharePanel;
