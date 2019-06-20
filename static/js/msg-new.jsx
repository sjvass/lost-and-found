"use strict";


class NewMessage extends React.Component {
    constructor() {
        super();
        this.state = {};
        //bind event handlers
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSubjectChange = this.handleSubjectChange.bind(this);
        this.handleBodyChange = this.handleBodyChange.bind(this);
    }

    //on load
    componentDidMount() {
        this.getMsgInfo();
    }

    //when subject modified
    handleSubjectChange(evt) {
        this.setState({subject: evt.target.value});
    }

    //when body modified
    handleBodyChange(evt) {
        this.setState({body: evt.target.value});
    }

    //on submit event
    handleSubmit(evt) {
        evt.preventDefault();
        fetch('/message', {
            method: 'POST',
            body: JSON.stringify({to:this.state.to_user.user_id,
                                    from_user:this.state.from_user.user_id,
                                    subject:this.state.subject,
                                    body:this.state.body}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }

        })
        .then(() => {
            window.location.href = "/user/" + this.state.from_user.user_id;
        })
    }

    //fetch information about message
    getMsgInfo() {
        fetch("/new-message/info.json")
        .then(response => response.json())
        .then(data => {
            this.setState({to_user:data.to_user,
                            from_user:data.from_user,
                            subject:data.subject})
        })
    }

    render() {
        if(this.state.from_user) {
            return(
                <div class="wrapper" id="new-msg">
                    <h2>New Message</h2>
                    <form onSubmit={this.handleSubmit} method="POST">
                        <label><b>To:</b></label>
                        <a href={"user/" + this.state.to_user.user_id}>
                            {this.state.to_user.fname} {this.state.to_user.lname}
                        </a>
                        <input type="hidden" name="to" value={this.state.to_user.user_id} />
                        <br/>

                        <label><b>From:</b></label>
                        <a href={"user/" + this.state.from_user.user_id}>
                            {this.state.from_user.fname} {this.state.from_user.lname}
                        </a>
                        <br/>

                        <label><b>Subject:</b></label>
                        <input type="text" name="subject" 
                            value={this.state.subject} onChange={this.handleSubjectChange} required/>
                        <br/>

                        <textarea rows="10" cols="40" id="body" name="body" placeholder="Type your message here"
                            onChange={this.handleBodyChange} required/>
                        <br/>

                        <input type="submit" value="Send"/>

                    </form>
                </div>
            )
        } else {
            return(<p>Loading...</p>);
        }
    }
}

ReactDOM.render(
    <NewMessage />,
    document.getElementById('root')
)