const signupEmail = document.getElementById('signupEmail')
const signupPassword = document.getElementById('signupPassword')
const signupBtn = document.getElementById('signupBtn')

const container = document.getElementById('container')
const errorContainer = document.createElement('div')
const errorMessage = document.createElement('p')
errorContainer.append(errorMessage)
container.appendChild(errorContainer)

errorMessage.style.color = 'red';
errorContainer.style.background = '#FFCCCB'

signupBtn.addEventListener('click', async() => {
    const email = signupEmail.value;
    const password = signupPassword.value;
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    const passwordRegex = /^[a-zA-Z]{7,}$/

    if(password.toLowerCase() === 'password') {
        alert("Your password cannot be 'Password'. Please use a stronger combination of characters")
    } 
    
    if(!email.match(emailRegex)) {
        console.log('Email validation failed')
        alert('Please enter a valid email')
    }

    // if(!password.match(passwordRegex)) {
    //     console.log('Password validation failed')
    //     alert('Enter a password longer than 6 characters')
    // }

    try {
        const response = await fetch('/signup', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ email: email, password: password })
        })

        if(response.ok) {
            console.log('All good')
        }else {
            const errorData = await response.json();
            window.alert(`Signup failed: ${errorData.error}`);
        }
    } catch (error) {
        console.error('Error during signup:', error);
        alert('An error occurred during signup. Please try again later.');
    }
})

function errorHandler(message) {    
    errorMessage.innerText = message
}