// app-ajax.js

// Elements
const markdownEditor = document.getElementById('markdown-editor');
const livePreview = document.getElementById('live-preview');
const elements = document.querySelectorAll('.drag-elements .element');

// Function to send markdown to the server using AJAX and get the preview
function updateMarkdownPreview() {
    const markdown = markdownEditor.value;

    // Send an AJAX POST request to the server
    fetch('/markdown_update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markdown: markdown }), // Send markdown as JSON
    })
    .then(response => response.json()) // Parse the JSON response
    .then(data => {
        // Update the live preview with the returned HTML
        livePreview.innerHTML = data.html;
    })
    .catch(error => {
        console.error('Error updating markdown preview:', error);
    });
}

// Listen to input in the markdown editor and send updates to the server
markdownEditor.addEventListener('input', updateMarkdownPreview);

// Handle drag-and-drop for inserting markdown elements
elements.forEach(element => {
    element.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text', e.target.dataset.markdown);
    });
});

livePreview.addEventListener('drop', (e) => {
    const markdown = e.dataTransfer.getData('text');
    // Insert markdown into the editor
    markdownEditor.value += `\n${markdown}`;
    updateMarkdownPreview();
});

// Function to convert HTML back to Markdown (simplified)
function convertHTMLToMarkdown(html) {
    // Handle tables, headers, and other basic markdown features
    // For simplicity, we'll implement basic rules. You can expand this as needed.

    // Convert <h1>, <h2>... to markdown headers
    html = html.replace(/<h1>(.*?)<\/h1>/g, '# $1');
    html = html.replace(/<h2>(.*?)<\/h2>/g, '## $1');
    html = html.replace(/<h3>(.*?)<\/h3>/g, '### $1');

    // Convert <table>, <tr>, <td> to markdown table format
    html = html.replace(/<table.*?>|<\/table>/g, ''); // Remove table tags
    html = html.replace(/<thead>|<\/thead>/g, ''); // Remove thead tags
    html = html.replace(/<tbody>|<\/tbody>/g, ''); // Remove tbody tags
    html = html.replace(/<tr>/g, '| ');            // Start of row
    html = html.replace(/<\/tr>/g, ' |');          // End of row
    html = html.replace(/<th>|<td>/g, ' ');        // Cell start
    html = html.replace(/<\/th>|<\/td>/g, ' |');   // Cell end

    // Convert ordered lists
    html = html.replace(/<li>(.*?)<\/li>/g, '1. $1');

    // Convert <code> block to markdown-style code block with triple backticks
    html = html.replace(/<p><code>([\s\S]*?)<\/code><\/p>/g, '<pre><code>$1</code></pre>');

    // Handle custom alert blocks for [!TIP], [!NOTE], etc.
    html = html.replace(/<div class="alert (tip|note|important|warning|caution)"><strong>(.*?)<\/strong>(.*?)<\/div>/g,
        function(match, type, alertTitle, content) {
            let markdownType = type.toUpperCase();
            return `> [!${markdownType}]\n> ${content.trim().replace(/<br>/g, '\n> ')}`;
        }
    );

    // Handle normal blockquotes without altering special alerts
    html = html.replace(/<blockquote><p>(.*?)<\/p><\/blockquote>/g, '> $1');

    return html;
}
