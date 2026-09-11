Audrey Closet — v13.20-dev12 Main Update

Text Studio compact layout + typography rendering fix.

Changes:
- Add Text / Update button moved to the right of the two-line text editor.
- The Text section's original roadmap/placeholder intro is hidden.
- Font, S/M/L/XL, Bold, Italic and Underline are now authoritatively applied after every live Board redraw.
- The same styling is applied after Portfolio/full-preview snapshot rendering.
- Existing dev11 text data remains compatible.

Test:
1. Board -> Decorate -> Text.
2. Confirm the editor appears immediately below the Text tab, with Add Text at its right.
3. Create Modern Sans + L + Bold and confirm it visibly differs from the script default.
4. Try Italic, Underline, Typewriter, Editorial Serif and S/M/L/XL.
5. Save and inspect Portfolio thumbnail/full preview.
6. Reopen and confirm styling persists.

Rollback: replace sw.js with v13.20-dev11.
