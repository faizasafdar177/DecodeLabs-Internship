"""
System Audit: The Memory Exam
==============================
This automates the exact 3-phase test:

  Phase 1 - State Initialization : tell the model your name
  Phase 2 - Context Distraction  : force a big, unrelated generation
                                    (a poem) to bulk up the history
  Phase 3 - State Extraction     : ask for the name back

If Phase 3 succeeds, you've proven the history list is really being
carried across turns — not just phase 1 answered in isolation.

Run with: python test_memory_exam.py
Requires: pip install groq --break-system-packages
Get a FREE API key (no card needed): https://console.groq.com/keys
Set it: export GROQ_API_KEY="gsk_..."
"""

import os
from groq import Groq

MODEL = "llama-3.3-70b-versatile"
client = Groq()

history = []


def turn(user_text: str) -> str:
    history.append({"role": "user", "content": user_text})
    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=1024,
        messages=history,
    )
    reply = response.choices[0].message.content
    history.append({"role": "assistant", "content": reply})
    return reply


print("Phase 1: State Initialization")
print("You: My name is Vipin")
r1 = turn("My name is Vipin")
print(f"Bot: {r1}\n")

print("Phase 2: Context Distraction (forcing a large generation)")
print("You: Write a poem about tech")
r2 = turn("Write a poem about tech")
print(f"Bot: {r2[:200]}...\n[truncated for readability]\n")

print("Phase 3: State Extraction")
print("You: What is my name?")
r3 = turn("What is my name?")
print(f"Bot: {r3}\n")

if "vipin" in r3.lower():
    print("RESULT: PASS — the model correctly recalled the name from history.")
else:
    print("RESULT: CHECK — expected 'Vipin' in the response. Inspect the output above.")
