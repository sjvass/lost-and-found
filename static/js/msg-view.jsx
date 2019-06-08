"use strict";

class Message extends React.Component {

    constructor() {
        super();
        //initalize state with url path
        this.state = {urlPath: window.location.pathname};
        //bind event handlers
        this.handleReply = this.handleReply.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    //on load
    componentDidMount() {
        this.getMsgInfo();
    }

    //when reply form submitted
    handleReply(evt) {
        evt.preventDefault();

        console.dir(evt.target);

        fetch('/new-message/info.json', {
            method: 'POST',
            body: JSON.stringify({to:this.state.from_user.user_id,
                            subject:this.state.msg.subject}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        .then(() => {
            window.location.href = "/new-message"
        });

    }

    //when delete form submitted
    handleDelete(evt) {
        evt.preventDefault();

        fetch('/delete-message', {
            method: 'POST',
            body: JSON.stringify({msg_id:this.state.msg.msg_id}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        .then(() => {
            window.location.href = "/user/" + this.state.msg.to_id;
        });

    }

    getMsgInfo() {
        fetch(this.state.urlPath + "/info.json")
        .then(response => response.json())
        .then(data =>
            this.setState({msg:data.msg,
                            to_user:data.to_user,
                            from_user:data.from_user})
        )
    }

    render() {
        
        if(this.state.msg) {
            console.log(this.state.msg)
            return(
                <div calssName="wrapper" id="message-wrapper">
                    <h2>{this.state.msg.subject}</h2>
                    <p><b>From: </b> 
                        <a href={"/users/" + this.state.from_user.user_id}>
                            {this.state.from_user.fname} {this.state.from_user.lname}
                        </a>
                    </p>

                    <p><b>To: </b> 
                        <a href={"/users/" + this.state.to_user.user_id}>
                            {this.state.to_user.fname} {this.state.to_user.lname}
                        </a>
                    </p>

                    <p>
                        {this.state.msg.body}
                    </p>


                    <form onSubmit={this.handleReply} method="POST">
                        <input type="submit" value="Reply"/>
                    </form>

                    <form onSubmit={this.handleDelete} method="POST">
                        <input type="submit" value="Delete"/>
                    </form>
                </div>
            )
        }
        else {
            return(
                <p>Loading...</p>
            )
        }
    }
}


ReactDOM.render(
    <Message />,
    document.getElementById('root')
)