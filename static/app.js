// Initialize socket connection
const socket = io();

// Elements
const markdownEditor = document.getElementById('markdown-editor');
const livePreview = document.getElementById('live-preview');
const elements = document.querySelectorAll('.drag-elements .element');

// Listen to input in the markdown editor and send updates to server
markdownEditor.addEventListener('input', () => {
    const markdown = markdownEditor.value;
    // Emit markdown to the server
    socket.emit('markdown_update', { markdown });
});

// Listen for live preview updates from the server
socket.on('markdown_preview', (data) => {
    // Directly update the live preview without wrapping tables in <pre> tags
    livePreview.innerHTML = data.html;

});

// Listen for changes made in the live preview and update the editor
livePreview.addEventListener('input', () => {
    const updatedHTML = livePreview.innerHTML;
    
    // Convert updated HTML back to Markdown (manual handling for now)
    const markdownFromPreview = convertHTMLToMarkdown(updatedHTML);
    markdownEditor.value = markdownFromPreview;

    // Send the new markdown back to the server for live updates
    socket.emit('markdown_update', { markdown: markdownFromPreview });
});

// Handle drag-and-drop for inserting markdown elements
elements.forEach(element => {
    element.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text', e.target.dataset.markdown);
    });
});
/* drag and dop inside the live preview, disabled for now, there arte small issue, and no need!
livePreview.addEventListener('dragover', (e) => {
    e.preventDefault();
});
*/
livePreview.addEventListener('drop', (e) => {
    const markdown = e.dataTransfer.getData('text');
    // Insert markdown into the editor
    markdownEditor.value += `\n${markdown}`;
    socket.emit('markdown_update', { markdown: markdownEditor.value });
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
    //html = html.replace(/<code.*?>([\s\S]*?)<\/code>/g, '```\n$1\n```');

    html = html.replace(/<p><code>([\s\S]*?)<\/code><\/p>/g, '<pre><code>$1</code></pre>');


    // Handle custom alert blocks for [!TIP], [!NOTE], etc.
    html = html.replace(/<div class="alert (tip|note|important|warning|caution)"><strong>(.*?)<\/strong>(.*?)<\/div>/g, 
        function(match, type, alertTitle, content) {
            // Match the alert type and convert back to Markdown format with proper indentation
            let markdownType = type.toUpperCase();
            return `> [!${markdownType}]\n> ${content.trim().replace(/<br>/g, '\n> ')}`;
        }
    );

    // Handle normal blockquotes without altering special alerts
    html = html.replace(/<blockquote><p>(.*?)<\/p><\/blockquote>/g, '> $1');
    
    return html;
}
