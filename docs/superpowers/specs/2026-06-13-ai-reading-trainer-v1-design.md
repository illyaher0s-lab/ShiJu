# AI Reading Trainer V1 Design

## One-line Scope

V1 does not try to build a content ecosystem or a complete English-learning platform. It validates one thing: whether a learner can use AI-preprocessed English passages to collect useful expressions for long-term review while reading with low friction.

## Product Positioning

AI Reading Trainer is a learning-first reading tool for adult English learners. The product is not optimized for casual reading. It assumes the user may not understand the article before learning, so the article is used as authentic input and context for expression learning.

The core learning object is not a sentence and not a raw expression string. The core learning object is `ExpressionSense`: one expression, one type, one meaning. Sentences are used as evidence and context through `Occurrence`.

The main loop is:

1. Import an English TXT or Markdown article.
2. Split it into 150-250 word segments.
3. Generate the first segment first so the user can begin quickly.
4. Show the original segment with a small number of highlighted expressions.
5. Let the user click highlights while reading to get lightweight help.
6. Let the user manually add worthwhile expressions to SRS.
7. Review due `ExpressionSense` items later with active recall.

The product can also create learning cards from learner-provided context outside an article. For example, the learner may enter a word seen in a game, programming documentation, a work chat, or another real-life context. This still uses AI generation and learner confirmation; it is not raw manual card entry.

## V1 User Experience

### Import

The user imports a TXT or Markdown file. The backend stores the original article, splits it into segments, and starts AI generation.

The first segment has high generation priority. Remaining segments are generated in the background.

Segment generation states are:

- `not_generated`
- `generating`
- `generated`
- `failed`
- `retryable`

The PWA should not block the user until the whole article is processed. Once the first segment is generated, the user can start learning. Later segments can show a "preparing" state.

### Reading Page

The reading page is the main learning surface. The user first sees the original passage to understand what the article is about. The page shows only the most valuable highlights by default:

- Default main highlights: 2-4 expressions per segment
- Maximum main highlights: 6 expressions per segment

The reading page supports inline learning, but it should not behave like a heavy dictionary overlay.

When the user taps a highlighted expression, the first layer shows:

- Expression
- Type
- Extremely short local meaning

The user can expand the second layer to see:

- Chinese explanation
- Original sentence
- Sentence translation
- Synonym or near expression
- Difficulty
- Occurrence count
- Minimal syntax hint when useful
- Add to review action

Minimal syntax hints are allowed only when they help the user understand the current sentence. They are not a grammar course. Examples:

- Main clause: `researchers argue that...`
- Difficulty: `Although` introduces concession

### Reading Page Feedback

Reading-page feedback does not advance SRS intervals. The reading page supports understanding and triage, not formal active recall.

Actions:

- `add_to_review`: create or activate SRS for the `ExpressionSense`
- `known`: mark as `known_candidate`, lower future display priority, do not advance SRS
- `too_easy`: lower recommendation weight for similar candidates
- `bad_explanation`: mark the generated explanation as needing correction or regeneration

This avoids treating "I saw the explanation" as "I remembered it."

### More Expressions

Main highlights should not pollute the passage with too many marks. Extra valuable candidates appear only in a collapsed "More expressions" area at the bottom of the segment.

This area includes two categories:

- `backup_candidate`: AI considers it useful, but it did not enter the main highlights.
- `ignored_over_limit`: useful, but suppressed by segment highlight limits or daily new-card limits.

These expressions can still be opened and manually added to review.

### Manual Selection AI Card Generation

The learner is not limited to expressions preselected by AI. While reading, the learner can select a word, phrase, clause, or short sentence span from the original passage and request AI card generation.

This is not manual card entry. The learner provides the selected text and intent signal; the backend calls the LLM to produce one or more card candidates.

The generation request should include:

- Selected text
- Full sentence containing the selection
- Nearby segment context
- Article and segment IDs
- Existing candidate expressions in the segment
- Existing active `ExpressionSense` records that may duplicate the selection

The LLM response should produce candidate `ExpressionSense` drafts, not permanent sentence cards. For each draft, the system should provide:

- Suggested expression
- Normalized form
- Type
- Local meaning in the current sentence
- Chinese explanation
- Sentence translation
- Difficulty
- Minimal syntax hint when useful
- Duplicate or near-duplicate warning when applicable
- Recommendation: add, merge with existing sense, or reject as unsuitable

The learner must confirm before a generated draft enters SRS. Confirmation creates or activates an `ExpressionSense` and stores the selected sentence as an `Occurrence`.

Manual selection generation must preserve generation metadata:

- `model_provider`
- `model_name`
- `prompt_version`
- `generation_version`
- `generated_at`

If offline, the selection request can be stored as a pending client operation with a `client_operation_id`, but LLM generation itself runs only when network and backend are available.

### Context Entry AI Card Generation

The learner can create a card candidate without starting from an imported article. This supports expressions encountered in places such as games, programming, work messages, videos, or conversations.

The learner supplies:

- Expression or word
- Context label, such as `game`, `programming`, `work`, `video`, or a free-form label
- Optional short note about where it appeared
- Optional sentence or snippet if the learner has one
- Optional learner intent, such as "I do not know what this means" or "I want to remember this usage"

The learner does not write the card content manually. The backend calls the LLM to generate one or more `ExpressionSense` drafts. The LLM should infer meaning from the provided context when possible and ask for more context only when the input is too ambiguous.

The generated draft should include:

- Suggested expression
- Normalized form
- Type
- Meaning in Chinese
- Local meaning for the supplied context
- Example sentence appropriate to the context
- Example sentence translation
- Difficulty
- Minimal usage hint when useful
- Duplicate or near-duplicate warning when applicable
- Recommendation: add, merge with existing sense, or reject as too ambiguous

The learner must confirm before a generated draft enters SRS. Confirmation creates or activates an `ExpressionSense` and stores a non-article `Occurrence` as context evidence.

Context-entry generation must preserve generation metadata:

- `model_provider`
- `model_name`
- `prompt_version`
- `generation_version`
- `generated_at`

If offline, the context-entry request can be stored as a pending client operation with a `client_operation_id`, but LLM generation itself runs only when network and backend are available.

### Review Page

The review page is the formal active recall surface. Only review-page feedback changes SRS intervals.

Card display depends on mastery:

- New review item: expression plus a clear occurrence sentence.
- Learning item: expression plus sentence prompt or cloze sentence.
- Mastered item: expression with minimal context first; context can be expanded after recall.

Review cards must be rich enough to support learning, not just reveal a Chinese translation. A V1 card can include a compact recall prompt first and then an answer surface with:

- Meaning in Chinese
- Local meaning in the original sentence
- Original occurrence sentence
- Sentence translation
- Minimal syntax or usage hint
- Expression type and difficulty
- Source article title and segment position
- Other saved occurrences for the same `ExpressionSense` when available
- Mistake count and review count when useful

The card should still preserve active recall. These details appear after the learner chooses to reveal the answer, or inside an expandable details section after recall.

Feedback:

- `known`: advance to the next interval
- `fuzzy`: schedule a shorter interval
- `unknown`: return to 1 day or learning queue and increase `mistake_count`

Initial V1 interval ladder:

```text
first review -> 1 day -> 3 days -> 7 days -> 14 days -> 30 days
```

SRS schedules only `ExpressionSense`, never individual sentences.

### Card Library

V1 needs both an article library and a card library.

The article library helps the learner return to imported texts and generated segments. The card library helps the learner manage long-term learning objects.

The card library should list `ExpressionSense` records, not raw sentence cards. It should support:

- Searching by expression or Chinese meaning
- Filtering by mastery status
- Filtering by due status
- Opening a card detail page
- Viewing all `Occurrence` evidence for a sense
- Jumping from an occurrence back to the source article segment
- Seeing whether a sense came from AI preselection, More expressions, or manual selection AI generation

The card library must make sense separation visible enough that the same expression string with different meanings can appear as different cards.

### Import and Library Entry Points

TXT and Markdown import are V1 requirements. The fixture-driven MVP can use a static library screen, but production V1 needs a visible import entry point where the learner can add a TXT or Markdown article.

The import entry point should show the import state after upload:

- Stored article
- Segment count
- First-segment generation state
- Background generation state for later segments
- Retry action for failed or retryable segments

The import flow should lead back to the reading page as soon as the first segment is generated.

## AI Generation

The AI generation pipeline analyzes each segment and produces candidate expressions, filtering status, explanations, and context.

V1 candidate statuses are limited to five:

- `selected`
- `backup_candidate`
- `ignored_too_easy`
- `ignored_duplicate`
- `ignored_over_limit`

Each candidate should include:

- `expression`
- `normalized_form`
- `type`
- `meaning_zh`
- `local_meaning`
- `sentence`
- `sentence_translation`
- `difficulty`
- `value_score`
- `candidate_status`
- `status_reason`
- optional minimal syntax hint

Generation metadata must be stored:

- `model_provider`
- `model_name`
- `prompt_version`
- `generation_version`
- `generated_at`

This is required because prompt and model changes will produce different candidate quality. Without versioning, later debugging will be unclear.

## Data Model

### Article

Stores source text and import status.

Important fields:

- `id`
- `user_id`
- `title`
- `source_type`
- `raw_text`
- `created_at`
- `updated_at`
- `deleted_at`

### Segment

Stores article chunks and generation state.

Important fields:

- `id`
- `user_id`
- `article_id`
- `sequence`
- `text`
- `word_count`
- `generation_status`
- `progress_status`
- `created_at`
- `updated_at`
- `deleted_at`

### CandidateExpression

Stores selected and filtered AI candidates. It preserves both what AI chose and what AI ignored.

Important fields:

- `id`
- `user_id`
- `article_id`
- `segment_id`
- `expression`
- `normalized_form`
- `type`
- `meaning_zh`
- `local_meaning`
- `sentence`
- `sentence_translation`
- `difficulty`
- `value_score`
- `candidate_status`
- `status_reason`
- `model_provider`
- `model_name`
- `prompt_version`
- `generation_version`
- `generated_at`
- `created_at`
- `updated_at`

### ExpressionSense

The long-term memory object.

Uniqueness is based on expression plus type plus meaning, not raw expression string alone.

Example:

- `take off / phrasal_verb / plane leaves the ground`
- `take off / phrasal_verb / remove clothing`
- `take off / phrasal_verb / suddenly become successful`

Important fields:

- `id`
- `user_id`
- `expression`
- `normalized_form`
- `type`
- `meaning_zh`
- `difficulty`
- `mastery_status`
- `srs_due_at`
- `review_count`
- `mistake_count`
- `created_at`
- `updated_at`
- `deleted_at`

### Occurrence

The context evidence for an `ExpressionSense`. It is not the scheduled memory object.

An occurrence can come from an imported article or from learner-provided external context. Article-based occurrences have `article_id` and `segment_id`. Context-entry occurrences can leave those fields empty and instead store the context source fields.

Important fields:

- `id`
- `user_id`
- `expression_sense_id`
- `source_type`: `article` or `context_entry`
- `article_id`
- `segment_id`
- `context_label`
- `context_note`
- `sentence`
- `sentence_translation`
- `local_meaning`
- `syntax_hint`
- `created_at`
- `updated_at`
- `deleted_at`

### ReviewLog

Records formal SRS review events.

Important fields:

- `id`
- `user_id`
- `expression_sense_id`
- `feedback`
- `previous_due_at`
- `next_due_at`
- `reviewed_at`
- `created_at`

### ClientOperation

Stores offline operations from the PWA and makes sync idempotent.

Important fields:

- `client_operation_id`
- `user_id`
- `operation_type`
- `target_type`
- `target_id`
- `payload`
- `client_created_at`
- `sync_status`
- `server_applied_at`

The backend must use `client_operation_id` for idempotency so repeated uploads do not apply an action twice.

Manual selection and context-entry AI generation should use client operations for idempotency. A repeated upload of the same generation request must not create duplicate senses or duplicate generation jobs.

Recommended operation types include:

- `reading.add_to_review`
- `reading.feedback`
- `reading.generate_card_from_selection`
- `cards.generate_card_from_context`
- `review.feedback`

### AiGenerationJob

V1 can start with an in-process queue, but the domain should treat generation as a job so article preselection, manual selection generation, and context-entry generation share a consistent model.

Important fields:

- `id`
- `user_id`
- `article_id`
- `segment_id`
- `source_type`: `segment_preselection`, `manual_selection`, or `context_entry`
- `selected_text`
- `context_label`
- `context_note`
- `sentence`
- `context`
- `status`
- `client_operation_id`
- `model_provider`
- `model_name`
- `prompt_version`
- `generation_version`
- `generated_at`
- `created_at`
- `updated_at`
- `deleted_at`

## Daily Load Control

Default recommended new review items per day: 6.

This is a soft limit. The system warns or deprioritizes after the limit, but the user can manually add more expressions.

Reading-page candidates can still be shown as lightweight help even if they do not enter SRS.

## Offline and Sync

The backend PostgreSQL database is the authority. The phone is a cache and operation queue.

Backend stores:

- Articles
- Segments
- AI generation results
- Candidate expressions
- Expression senses
- Occurrences
- SRS state
- Review logs
- Sync operations

PWA stores in IndexedDB:

- Recently opened articles and segments
- Generated explanations for cached segments
- Recent and due review queue
- Pending offline operations

When the phone comes back online, it uploads operations with `client_operation_id`. The backend applies operations in `client_created_at` order. This is enough for V1 because the product is single-user first.

If the phone is lost or cache is cleared, synchronized data remains safe on the backend. Only unsynced offline operations may be lost.

## Technical Stack

V1 stack is fixed:

Frontend:

- React
- TypeScript
- Vite
- PWA
- IndexedDB for offline cache and pending operation queue

Backend:

- Node.js
- TypeScript
- Fastify
- AI provider layer wrapping model APIs
- Lightweight job queue first; BullMQ can be introduced later if needed

Database:

- PostgreSQL as authoritative cloud database

Deployment:

- Cloud server hosts frontend, backend, and database
- Server-side Agent handles environment variables, process management, HTTPS, deployment, logs, and database backup

The project should not use Next.js for V1. The product does not need SEO or server-rendered content pages. It needs a mobile-first learning interface, local cache, sync, and background generation.

## V1 Includes

- TXT and Markdown import
- Mixed segmentation by heading, paragraph, and 150-250 word target
- First-segment priority generation
- Background generation for later segments
- AI candidate extraction, scoring, explanation, and five-status filtering
- Reading page with original text and limited main highlights
- Lightweight highlight popover with optional full expansion
- More expressions section for `backup_candidate` and `ignored_over_limit`
- Manual selection AI card generation from learner-selected text
- Context-entry AI card generation from a learner-entered expression and real-world context
- ExpressionSense / Occurrence separation
- Card library for `ExpressionSense` records and occurrences
- Soft daily new-card recommendation limit of 6
- PostgreSQL-backed authority data
- IndexedDB offline cache and pending operation queue
- Basic review page scheduled by `ExpressionSense`
- Fixed SRS ladder: 1, 3, 7, 14, 30 days
- Reading feedback separate from review feedback

## V1 Excludes

- PDF import
- Webpage import
- Multi-user account system beyond a default `user_id`
- Community content
- Course system
- Knowledge graph
- Complex synonym merging
- Complex adaptive SRS algorithm
- Permanent sentence cards
- Long grammar lessons
- Multiple generated example sentences per expression
- Raw manual card creation without AI generation
- Exam-style exercises
- Native mobile app

## Acceptance Criteria

- A TXT or Markdown article can be imported and split into segments.
- The first segment can be generated before the full article is processed.
- The reading page shows the original segment and 2-4 main highlights by default.
- No segment shows more than 6 main highlights.
- Highlight tap opens a lightweight first layer, not a full dictionary card by default.
- The user can expand to full explanation.
- Reading-page `known` does not advance SRS.
- Reading-page `add_to_review` creates or activates SRS for the related `ExpressionSense`.
- Selecting text in the reading page can request AI-generated card candidates.
- Manual selection AI generation creates candidates only after backend LLM processing and learner confirmation.
- Entering an expression plus a real-world context can request AI-generated card candidates without requiring an article.
- Context-entry AI generation creates candidates only after backend LLM processing and learner confirmation.
- Context-entry occurrences are stored as non-article evidence and do not pretend to have article or segment sources.
- Review-page feedback changes SRS intervals.
- Review cards provide enough post-reveal learning detail to be useful beyond a bare translation.
- A card library lists `ExpressionSense` records and can open their occurrence evidence.
- `ExpressionSense` can aggregate multiple `Occurrence` records.
- Same expression string with different meanings can become different `ExpressionSense` records.
- `backup_candidate` and `ignored_over_limit` appear only in "More expressions" by default.
- AI generation records model and prompt version metadata.
- Offline cached generated segments can be opened without network.
- Offline operations sync later with `client_operation_id` idempotency.
- Phone cache loss does not destroy synchronized learning data.

## Key Risks

### AI Selection Quality

The biggest AI risk is not explanation writing. It is choosing which expressions are worth learning. V1 stores candidate statuses and generation metadata so prompts, thresholds, and models can be improved with evidence.

### Reading Page Overload

Too many highlights or too much popover content will break reading flow. V1 keeps main highlights small, uses a lightweight first layer, and moves extra expressions to a collapsed section.

### Polluted SRS

Reading-page interactions must not be treated as successful recall. Only review-page feedback advances intervals.

### Weak Sense Separation

V1 can use weak deduplication, but it must separate at least by normalized form, type, and meaning. Raw string deduplication is not enough.

### Offline Sync Duplication

Offline actions can be uploaded more than once. `client_operation_id` must make operations idempotent.

### Background Generation Failure

Generation can fail or time out. Segments need clear status and retry behavior.
