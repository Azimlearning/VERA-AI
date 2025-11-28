// src/components/agents/podcast/ScriptDisplay.js
// Script display component for Podcast Agent

'use client';

export default function ScriptDisplay({ script, audioUrl, loading, onDownloadAudio }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!script) {
    return null;
  }

  // Parse script and format with speaker labels
  const parseScriptWithSpeakers = (scriptData) => {
    let scriptText = '';
    
    // Extract script text
    if (typeof scriptData === 'string') {
      scriptText = scriptData;
    } else if (scriptData.script) {
      scriptText = scriptData.script;
    } else if (scriptData.sections && Array.isArray(scriptData.sections)) {
      // Build script from sections
      scriptText = scriptData.sections.map(section => {
        let sectionText = '';
        if (section.content) {
          sectionText += section.content + '\n\n';
        }
        if (section.qa && Array.isArray(section.qa)) {
          section.qa.forEach(qa => {
            if (qa.question) sectionText += qa.question + '\n';
            if (qa.answer) sectionText += qa.answer + '\n\n';
          });
        }
        return sectionText;
      }).join('\n');
    } else {
      scriptText = JSON.stringify(scriptData, null, 2);
    }

    // Split by HOST: and GUEST: markers
    const lines = scriptText.split('\n');
    const parsedLines = [];
    let currentSpeaker = null;
    let currentText = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Check for speaker markers
      const hostMatch = trimmed.match(/^HOST\s*:?\s*(.*)/i);
      const guestMatch = trimmed.match(/^GUEST\s*:?\s*(.*)/i);
      
      if (hostMatch) {
        // Save previous segment
        if (currentSpeaker && currentText.length > 0) {
          parsedLines.push({
            speaker: currentSpeaker,
            text: currentText.join(' ').trim()
          });
        }
        // Start new HOST segment
        currentSpeaker = 'HOST';
        currentText = hostMatch[1].trim() ? [hostMatch[1].trim()] : [];
      } else if (guestMatch) {
        // Save previous segment
        if (currentSpeaker && currentText.length > 0) {
          parsedLines.push({
            speaker: currentSpeaker,
            text: currentText.join(' ').trim()
          });
        }
        // Start new GUEST segment
        currentSpeaker = 'GUEST';
        currentText = guestMatch[1].trim() ? [guestMatch[1].trim()] : [];
      } else if (trimmed.length > 0) {
        // Continue current speaker's text
        if (currentSpeaker) {
          currentText.push(trimmed);
        } else {
          // Default to HOST if no speaker marker found yet
          currentSpeaker = 'HOST';
          currentText = [trimmed];
        }
      }
    }
    
    // Add final segment
    if (currentSpeaker && currentText.length > 0) {
      parsedLines.push({
        speaker: currentSpeaker,
        text: currentText.join(' ').trim()
      });
    }

    // If no speaker markers found, return as plain text
    if (parsedLines.length === 0 && scriptText.trim().length > 0) {
      return null; // Will fall back to plain text display
    }

    return parsedLines;
  };

  const scriptLines = parseScriptWithSpeakers(script);

  return (
    <div className="script-body">
      {scriptLines && scriptLines.length > 0 ? (
        scriptLines.map((line, idx) => (
          <p key={idx} className="script-line">
            <span className={`speaker-label ${line.speaker.toLowerCase()}`}>
              {line.speaker}:
            </span>
            {line.text}
          </p>
        ))
      ) : (
        <div className="prose prose-lg max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed bg-transparent p-0 border-0">
            {typeof script === 'string' ? script : JSON.stringify(script, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

