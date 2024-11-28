const email = document.getElementById('email');
const password = document.getElementById('password');
const loginBtn = document.getElementById('submitBtn');
const newUserSignUp = document.getElementById('signup');


loginBtn.addEventListener('click', async () => {
    const emailVal = email.value;
    const pVal = password.value;

    if (emailVal === '' || pVal === '') {
        window.alert('Pleae enter both email & password')
    } else {
        const sendData = await fetch('/login', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                email: emailVal,
                password: pVal
            })
        })

        if (sendData.ok) {
            const { url } = await sendData.json()
            window.location.href = url
        } else if (sendData.status = 401) {
            window.alert('Username or password is incorrect')
        }
    }
})

newUserSignUp.addEventListener('click', () => {
    window.location.href = '/signup.html'
})

