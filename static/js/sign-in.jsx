"use strict";

class SignInForm extends React.Component {
    constructor() {
        super();
        this.state = {};
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
    }

    handleEmailChange(evt) {
        this.setState({email: evt.target.value});
    }

    handlePasswordChange(evt) {
        this.setState({password: evt.target.value});
    }

    handleSubmit(evt) {
        //prevents from posting with Flask request
        evt.preventDefault();
        // console.log(data)
        fetch('/signin', {
            method: 'POST',
            body: JSON.stringify({email: this.state.email,
                password: this.state.password}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        .then(() => {
            window.location.href = "/"
        });
    }


    render() {
        return (
            <form onSubmit={this.handleSubmit} method='POST'>
                <label>Email: </label>
                <input type="email" name="email" onChange={this.handleEmailChange} required/>
                <br/>

                <label>Password: </label>
                <input type="password" name="password" onChange={this.handlePasswordChange} required/>
                <br/>

                <button type="submit">Sign In</button>
            </form>
        )
    }
}

ReactDOM.render(
    //custom divs
    <div id="wrapper">
        <h2>Sign In</h2>
        <SignInForm />
        <p>Don't have an account? <a href="/register">Create a new account!</a></p>
    </div>,
    document.getElementById('root'),
);