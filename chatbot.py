"""
Project 1: Custom AI Chatbot with Memory
=========================================

WHAT THIS FILE PROVES (tied to the training-kit concepts):

1. STATELESS vs STATEFUL
   The Claude API itself has NO memory. Every single call to
   client.messages.create() is a fresh, isolated transaction — the model
   has never "met" you before that exact request. If you don't send the
   old messages back, the model genuinely does not know they happened.
   "Memory" in a chatbot is 100% an illusion WE build on the client side
   by re-sending the whole conversation every single turn.

2. THE CHAT SESSION SCHEMA (role + content)
   Every message we store is a dict: {"role": "user"/"assistant", "content": "..."}
   role tells the model WHO said it. content is WHAT was said.
   This list of dicts is exactly what gets shipped to the API each turn.

3. THE VALIDATION GATE
   Sending an empty string crashes the request (API returns a 400 error).
   So before anything touches the network, we check the input isn't
   empty/whitespace-only.

4. THE APPEND SEQUENCE (happens every single turn, in this exact order)
   Step 1: append the user's message to history
   Step 2: send the ENTIRE history to the API
   Step 3: append the model's reply to history
   Now the history is ready for turn t+1.

5. THE SLIDING WINDOW (token exhaustion fix)
   Because we resend the whole history every turn, a long conversation
   eventually gets too big for the model's context window. We cap the
   history at MAX_HISTORY_MESSAGES and drop the OLDEST messages first
   (FIFO = First In, First Out) — like a queue.

Run with: python chatbot.py
Requires: pip install groq --break-system-packages
Get a FREE API key (no card needed): https://console.groq.com/keys
Set it: export GROQ_API_KEY="gsk_..."
"""

import os
import sys
from groq import Groq

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------
MODEL = "llama-3.3-70b-versatile"     # free Groq-hosted model we call every turn
MAX_HISTORY_MESSAGES = 20            # sliding window size (10 user + 10 assistant turns)
EXPLAIN_MODE = True                  # set False once you're comfortable — turns off the teaching prints

client = Groq()  # reads GROQ_API_KEY from the environment automatically


def explain(label: str, msg: str) -> None:
    """Only prints when EXPLAIN_MODE is True. This is how you 'see' the
    architecture working instead of just trusting it blindly."""
    if EXPLAIN_MODE:
        print(f"\033[90m[{label}] {msg}\033[0m")


def validate_input(user_text: str) -> bool:
    """
    THE VALIDATION GATE.
    Returns False if the input is empty or only whitespace.
    Without this, an empty string reaches the API and it throws a
    400 Bad Request — which would crash our terminal loop.
    """
    if not user_text or not user_text.strip():
        explain("GUARD", "Blocked an empty/whitespace-only input before it reached the API.")
        return False
    return True


def apply_sliding_window(history: list) -> list:
    """
    THE SLIDING WINDOW ALGORITHM (FIFO pruning).
    If history grows past MAX_HISTORY_MESSAGES, we chop off the OLDEST
    entries (the front of the list) and keep only the most recent ones.
    This is what stops the conversation payload from growing forever and
    blowing past the model's token budget.
    """
    if len(history) > MAX_HISTORY_MESSAGES:
        dropped = len(history) - MAX_HISTORY_MESSAGES
        explain(
            "SLIDING WINDOW",
            f"History hit {len(history)} messages (limit {MAX_HISTORY_MESSAGES}). "
            f"Dropping the oldest {dropped} message(s) — FIFO.",
        )
        history = history[-MAX_HISTORY_MESSAGES:]
    return history


def send_to_model(history: list) -> str:
    """
    Sends the ENTIRE history list as the payload. This is the part that
    makes the bot look 'stateful' even though the underlying model is
    stateless — we're just handing it the full transcript every time.
    """
    explain("TRANSMIT", f"Sending {len(history)} messages (the whole history) to the model.")
    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=1024,
        messages=history,
    )
    return response.choices[0].message.content


def main():
    print("=" * 60)
    print("  Custom AI Chatbot with Memory  (type 'exit' to quit)")
    print("=" * 60)

    # THE HISTORICAL ARRAY — this single list IS the bot's "memory".
    # It lives only in this Python process's RAM. Close the terminal and
    # it's gone forever (this is the 'Ephemeral RAM' problem from the
    # slides — solved later by a database, not needed for Project 1).
    conversation_history = []

    while True:
        user_input = input("\nYou: ")

        if user_input.strip().lower() in ("exit", "quit"):
            print("Bot: Bye! (and with that, this session's memory is wiped.)")
            break

        # STEP 0: validation gate
        if not validate_input(user_input):
            print("Bot: (I got an empty message — say something!)")
            continue

        # STEP 1: ingest & append the user's turn
        conversation_history.append({"role": "user", "content": user_input})
        explain("APPEND", "User message added to history as {'role': 'user', 'content': ...}")

        # sliding window check happens on EVERY append, not just at the end
        conversation_history = apply_sliding_window(conversation_history)

        # STEP 2: transmit the whole history, get the model's reply
        try:
            reply_text = send_to_model(conversation_history)
        except Exception as e:
            print(f"Bot: (API error — {e})")
            # don't leave a dangling user message with no reply
            conversation_history.pop()
            continue

        # STEP 3: record the model's reply into history too
        conversation_history.append({"role": "assistant", "content": reply_text})
        explain("APPEND", "Assistant reply added to history. Turn complete — ready for t+1.")

        print(f"Bot: {reply_text}")


if __name__ == "__main__":
    main()
