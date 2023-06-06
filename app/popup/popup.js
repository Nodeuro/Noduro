function createPopup (id, message,on_end) {
    if (document.getElementById(id) != null) {
        return;
    }
    // Create the popup element
    const popup_div = document.createElement('div');
    popup_div.classList.add('popup_div');
    popup_div.id = id;
    const popup = document.createElement('div');
    popup.classList.add('popup');

    
    // Create the message element
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    popup.appendChild(messageElement);
    
    // Create the dismiss button
    const dismissButton = document.createElement('button');
    dismissButton.textContent = 'Dismiss';
    popup.appendChild(dismissButton);
    popup_div.appendChild(popup);
    document.body.appendChild(popup_div);

    dismissButton.addEventListener('click', () => {
        popup_div.classList.add('fade-out');
        setTimeout(() => {
        document.body.removeChild(popup_div);
        }, 1000);
        on_end();
    });
    // Add the popup to the page
    
    // Set a timeout to automatically dismiss the popup after 30 seconds
    setTimeout(() => {
        popup_div.classList.add('fade-out');
        setTimeout(() => {
        document.body.removeChild(popup_div);
        }, 1000);
        on_end();
    }, 30000);
}
