"use strict";

//Defines Registration form tag
class RegistrationForm extends React.Component {
    constructor() {
        super();
        //initalize state to empty
        this.state = {};

        //bind event handlers
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    // when any form input changed, saves its value to state
    handleInputChange(inName) {
        // console.dir(evt.target);
        // const elementName = evt.target;
        // this.setState({elementName: evt.target});
        // console.log('state on change = ' + this.state);
        return evt => {
            // console.log('wat', inName)
            // console.log(evt);
            this.setState({
                [inName]: evt.target.value
            });
        }
    }

    handleSubmit(evt) {
        evt.preventDefult();

        // console.log('state on submit = ' + this.state);

        //post to server
        fetch('/register', {
            method: 'POST',
            body: JSON.stringify(this.state),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit} method="POST">
                <label>First name: </label>
                <input type="text" name="fname" onChange={this.handleInputChange('fname')} required/>
                <label> Last name: </label>
                <input type="text" name="lname" onChange={this.handleInputChange('lname')}/>
                <br/>

                <label>Email: </label>
                <input type="email" name="email" onChange={this.handleInputChange('email')} required/>
                <br/>

                <label>Password: </label>
                <input type="password" name="password1" onChange={this.handleInputChange('password1')} required/>
                <br/>

                <label>Confirm password: </label>
                <input type="password" name="password2" onChange={this.handleInputChange('password2')} required/>
                <br/>

                <button type="submit">Create account</button>
            </form>
        )
    }
}



ReactDOM.render(
    <div id="registration-wrapper">
        <h2>Create Account</h2>
        <p>To report a lost or found item</p>
        <br/>
        <RegistrationForm />
        <p>Already have an account? <a href="/signin">Sign in!</a></p>
    </div>,
    document.getElementById('root')
);