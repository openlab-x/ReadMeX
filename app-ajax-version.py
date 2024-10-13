from flask import Flask, render_template, request, jsonify
import markdown2

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

# Web route to process markdown updates (for AJAX version)
@app.route('/markdown_update', methods=['POST'])
def markdown_update():
    data = request.get_json()
    markdown_text = data.get('markdown', '')
    # Convert markdown to HTML
    html_output = markdown2.markdown(markdown_text, extras=["tables"])
    return jsonify({'html': html_output})

if __name__ == '__main__':
    app.run(debug=True)
