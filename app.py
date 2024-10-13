from flask import Flask, render_template
from flask_socketio import SocketIO
import markdown2

app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')


# WebSocket for markdown update
@socketio.on('markdown_update')
def handle_markdown_update(data):
    markdown_text = data['markdown']
    # Enable extras like 'tables' to handle table markdown
    html_output = markdown2.markdown(markdown_text, extras=["tables"])
    socketio.emit('markdown_preview', {'html': html_output})

if __name__ == '__main__':
    socketio.run(app, debug=True)
