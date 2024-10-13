// Show 'Headings' list by default
const defaultList = document.getElementById('table-of-contents-list');
if (defaultList) {
    defaultList.classList.remove('d-none');
}

// Toggle visibility of the lists when a category is clicked
document.querySelectorAll('.sidebar h5').forEach((heading) => {
    heading.addEventListener('click', function () {
        const target = document.getElementById(this.dataset.target);

        // Remove 'active' class from all sidebar items and add it to the selected one
        document.querySelectorAll('.sidebar h5').forEach(h => h.classList.remove('active'));
        this.classList.add('active');

        // Hide all lists
        document.querySelectorAll('.content > .category-list').forEach(div => div.classList.add('d-none'));
        
        // Show the targeted list
        if (target) {
            target.classList.remove('d-none');
        }
    });
});

function copyToClipboard() {
    const markdownEditor = document.getElementById('markdown-editor');
    markdownEditor.select();
    document.execCommand('copy');
    showToast();
}

function showToast() {
    const toast = document.getElementById('copy-toast');
    const copyIcon = document.getElementById('copy-icon');
    const iconRect = copyIcon.getBoundingClientRect();

    // Position the toast near the copy icon
    toast.style.top = `${iconRect.top}px`;
    toast.style.left = `${iconRect.right + 10}px`;

    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}


// drag-and-drop functionality for emoji elements
const emojiElements = document.querySelectorAll('#emojis-list .element');
emojiElements.forEach(element => {
    element.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text', e.target.dataset.markdown);
    });
});
