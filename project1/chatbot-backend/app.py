import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq

app = Flask(__name__)
CORS(app)

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

MODEL = "llama-3.3-70b-versatile"

# In-memory conversation store keyed by conversation_id (fine for local/dev use)
conversations = {}


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True)
    message = data.get("message", "").strip()
    conversation_id = data.get("conversation_id", "default")

    if not message:
        return jsonify({"error": "Message cannot be empty"}), 400

    history = conversations.setdefault(conversation_id, [])
    history.append({"role": "user", "content": message})

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=history,
            temperature=0.7,
            max_tokens=1024,
        )
        reply = response.choices[0].message.content
        history.append({"role": "assistant", "content": reply})
        return jsonify({"reply": reply, "conversation_id": conversation_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/new-chat", methods=["POST"])
def new_chat():
    data = request.get_json(force=True)
    conversation_id = data.get("conversation_id")
    if conversation_id:
        conversations[conversation_id] = []
    return jsonify({"status": "ok"})


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "running"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
