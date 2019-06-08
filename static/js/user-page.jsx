"use strict";

class UserPage extends React.Component {
     constructor() {
        super();
        this.state = {urlPath: window.location.pathname};
    }

    //called on load
    componentDidMount() {
        this.getUserInfo();
    }

    //call to get user info and saves it to state
    getUserInfo() {
        // console.log(this.state.userId);
        console.log(this.state.urlPath);
        fetch(this.state.urlPath+'/info.json')
        .then(response => response.json())
        .then(data => {
            this.setState({user:data.user,
                currUserId:data.curr_user_id,
                losts:data.losts,
                founds:data.founds,
                messages:data.messages})

            // console.log(data)
        })
    }

    render() {
        // console.log(this.state.messages)
        if(this.state.user) {
            return(
                <div id="user-page-wrapper">
                    <UserInfo user={this.state.user}/>
                    <UserLosts losts={this.state.losts}/>
                    <UserFounds founds={this.state.founds}/>
                    <UserMessages user={this.state.user} messages={this.state.messages}/>
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


class UserInfo extends React.Component {

    render() {
        return(
            <div id="user-info">
                <h2>
                    {this.props.user.fname} {this.props.user.lname}
                </h2>
                <ul>
                    <li>
                        <b>Email:</b> {this.props.user.email}
                    </li>
                </ul>

            </div>
        )

    }
}

class UserLosts extends React.Component {

    render() {
        const losts = this.props.losts;

        let formattedLosts = <li>This user has not reported any lost items</li>;

        if(losts.length > 0) {
            formattedLosts = losts.map((lost) =>
                <li key={lost.lost_id.toString()}>
                    <a href={"/lost/" + lost.lost_id.toString()}>
                        {lost.title}
                    </a>
                </li>
            );
        }

        return(
            <div id="user-losts">
                <h3>Lost Items</h3>
                <ul>
                    {formattedLosts}
                </ul>
            </div>
        )

    }
}

class UserFounds extends React.Component {
    render() {
        const founds = this.props.founds;

        let formattedFounds = <li>This user has not reported any found items</li>;

        if(founds.length > 0) {
            formattedFounds = founds.map((found) =>
                <li key={found.found_id.toString()}>
                    <a href={"/found/" + found.found_id.toString()}>
                        {found.title}
                    </a>
                </li>
            );
        }

        return(
            <div id="user-founds">
                <h3>Found Items</h3>
                <ul>
                    {formattedFounds}
                </ul>
            </div>
        )

    }
}

class UserMessages extends React.Component {

    constructor() {
        super();
        this.setState = {};
        //bind event handlers
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(evt) {
        evt.preventDefault();

        //post to server
        fetch('/new-message/info.json', {
            method: 'POST',
            body: JSON.stringify({to:this.props.user.user_id}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }

        })
        //redirect to new message form
        .then(() => {
            window.location.href = "/new-message"
        });
    }

    render() {
        const messages = this.props.messages;
        //If not signed in user's page
        if(messages == null) {
            return (
                <form onSubmit={this.handleSubmit} mehtod="POST">
                    <input type="submit"
                        value={"send " + this.props.user.fname + " a message"} />
                </form>
            )
        }

        //Is the signed in user's page and they have messages
        if(messages.length > 0) {
            const formattedMessages = messages.map((msg) => 
                <tr key={msg.msg.msg_id.toString()}>
                    <td key="from">
                        <a href={"/user/" + msg.msg.from_id.toString()}>
                            {msg.from_user.fname} {msg.from_user.lname}
                        </a>
                    </td>
                    <td key="subject">
                        <a href={"/message/" + msg.msg.msg_id.toString()}>
                            {msg.msg.subject}
                        </a>
                    </td>
                </tr>
            );
            return (
                <div id="user-messages">
                <h3>Messages</h3>
                <table>
                    <tr>
                        <th>From</th>
                        <th>Subject</th>
                    </tr>
                    <tbody>
                        {formattedMessages}
                    </tbody>
                </table>
                </div>
                
            )
        }

        //If user is signed in with no messages
        return(
            <div id="user-messages">
                <h3>Messages</h3>
                <p>You have no messages.</p>
            </div>
        )
    }
}

ReactDOM.render(
    <UserPage />,
    document.getElementById('root'),
);