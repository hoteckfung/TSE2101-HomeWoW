
// window.onload = function() {
    document.getElementById('general-save-changes-button').addEventListener('click', saveChangesGeneral);
// }

function saveChangesGeneral() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');

    console.log("from client.js");
    console.log(userId);
    const data = { id: userId, name, email, phone };
    console.log(data);
    console.log("saveChangesGeneral");

    fetch('/update-profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        window.alert('You will be logged out to save the new changes.');
        window.location.href = '/logout';
    })
    .catch((error) => {
        console.error('Error:', error);
    });
    
}


document.getElementById('change-password-save-changes-button').addEventListener('click', () => {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const repeatNewPassword = document.getElementById('repeat-new-password').value;
  
    if (newPassword !== repeatNewPassword) {
      alert('New passwords do not match.');
      return;
    }
  
    // Get the userID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('userId');
  
    fetch('/change-password', {
      method: 'POST',
      body: JSON.stringify({ id, currentPassword, newPassword }),
      headers: { 'Content-Type': 'application/json' },
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      window.alert('Password changed successfully. You will be logged out.');
      window.location.href = '/logout';
    })
    .catch(error => console.error('Error:', error));
  });