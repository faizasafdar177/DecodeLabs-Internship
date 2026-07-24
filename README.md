# Project 1 — Custom AI Chatbot with Memory

A terminal chatbot that "remembers" the conversation, built with the
Anthropic Python SDK. Every concept from the training kit is wired up
and, more importantly, **printed out live** so you can watch it happen
instead of just trusting the code.

## Setup (run these in order)

```bash
pip install -r requirements.txt --break-system-packages
export ANTHROPIC_API_KEY="your-key-here"
python chatbot.py
```

## What to actually watch for while it runs

`EXPLAIN_MODE = True` in `chatbot.py` makes the script print grey
`[LABEL]` lines every time an architectural thing happens. Here's what
each one means and why it exists:

### 1. The model has zero memory of its own
Every call to `client.messages.create()` is a brand-new, isolated
request. Nothing is "remembered" server-side. If the illusion of
memory feels real to you when you chat, it's only because **we** are
resending the whole conversation transcript every single turn. Proof:
comment out the line that appends to `conversation_history` and ask
"what's my name?" after telling it your name — it'll have no idea.

### 2. `[APPEND]` — the schema
Every message we store is just:
```python
{"role": "user", "content": "hello"}
{"role": "assistant", "content": "hi there!"}
```
`role` says who spoke. `content` is what they said. The whole
`conversation_history` list is just an array of these dicts, and that
exact array is what gets shipped to the API on the next turn.

### 3. `[GUARD]` — the validation gate
Try running the bot and just hitting Enter with no text. You'll see
`[GUARD]` fire and the message never reaches the API. Without this
check, an empty string sent to the API throws a 400 error and your
terminal loop would crash. This is a one-line `if` statement doing a
lot of protective work.

### 4. `[TRANSMIT]` — the append sequence
Every turn does exactly three things, in order:
1. append your message to history
2. send the *entire* history to the model
3. append the model's reply to history

Watch the message count printed in `[TRANSMIT]` grow by 2 every turn
(one user + one assistant message) — that's the array getting bigger
in real time.

### 5. `[SLIDING WINDOW]` — token exhaustion
Have a long conversation (15-20+ turns) and eventually you'll see
`[SLIDING WINDOW]` fire, dropping the oldest messages. This exists
because we resend the *whole* history every turn — left unchecked,
that payload grows until it blows past the model's context limit
(the "token budget crisis" from the slides). `MAX_HISTORY_MESSAGES`
in the config controls how big the window is before it starts
trimming from the front (FIFO — oldest out first).

### 6. Run the automated memory exam
```bash
python test_memory_exam.py
```
This scripts the exact 3-phase test:
- tell it your name (state initialization)
- ask for an unrelated poem to bulk up the history (context distraction)
- ask for your name back (state extraction)

If it correctly recalls the name *after* the poem, you've proven the
history array is really doing its job  not just answering phase 1 in
isolation.

## One thing this project deliberately does NOT do

All memory lives in a plain Python list in RAM. Close the terminal and
it's gone — that's fine for Project 1 (the goal is understanding the
in-memory mechanics), but it's exactly the limitation the training kit
flags as "the ephemeral RAM problem." The fix for that (SQLite/Postgres/
Firestore-backed persistence, one row per session) is explicitly a
later-project concern, not something you need here.

## Suggested way to learn this, turn by turn

1. Run `chatbot.py` once with `EXPLAIN_MODE = True` and just chat
   normally for 5-6 turns. Read every grey line.
2. Set `EXPLAIN_MODE = False` and notice the bot behaves identically —
   the prints were never part of the logic, just a window into it.
3. Deliberately try to break it: send an empty message, then a very
   long back-and-forth to trigger the sliding window.
4. Run `test_memory_exam.py` to see the recall test pass.
5. Only once all of that makes sense, move to Project 2.
