# Color recommendations — preview 51

Source order: approved Pro set parts, name tokens/custom tags, sampled image pixels. Recommendations do not change selections. Existing colors are preserved. New colors enter the organization palette only after an explicit checkbox selection in an atomic state transaction. No schema migration or existing-item rewrite occurs.

Shared picker is connected to Pro STEP 3, manual individual/bulk registration, tag dialog and the existing item editor. Catalog-specific bulk path is excluded. Non-color attributes and existing copy controls remain available in their original details.

Executed: npm test; test:pro-recovery; test:review; test:compact; test:colors; build. Color event tests cover actual picker handlers, production Pro bindings, approved-set isolation, STEP navigation, actual deferred save and IndexedDB reopen. Shared editor tests cover cancel, same-ID save and other-item protection. Normal registration regression tests cover existing transitions; full real-browser color interaction in those forms remains a manual QA item.

Image analysis: browser-local canvas downsample to at most 96px, serialized decode, bounded URL cache, Blob weak cache. Transparent pixels ignored; edge-connected white backdrop suppressed only when most of the edge is opaque. Ambiguous palettes stay unchecked. Real iPhone photos/background separation and memory limits require device QA. No AI or remote image API.

Pro final registration remains disabled.
