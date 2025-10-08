// Addition to add between play button and favorite button in VoiceJournal.tsx

{entry.transcription && (
  <Button
    size="sm"
    variant="ghost"
    onClick={() => generateSummary(entry)}
    className="p-2 text-blue-600 hover:text-blue-700"
    disabled={isGeneratingSummary}
    title="Generate writable summary"
  >
    <FileText className="w-4 h-4" />
  </Button>
)}