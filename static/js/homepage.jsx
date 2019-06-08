"use strict";

class ItemActionList extends React.Component {
    render() {
        return (
            <ul>
                <li>
                    <a href="/lost">Losts</a>
                </li>
                <li>
                    <a href="/found">Founds</a>
                </li>
                <li>
                    <a href="/report-lost">Report a Lost Item</a>
                </li>
                <li>
                    <a href="/report-found">Report a Found Item</a>
                </li>
            </ul>

        );
    };
}


class UserActionsList extends React.Component {

    //importing state property form super,
    //setting state as empty state
    constructor(props) {
        super(props);
        this.state = {};
    }

    //called on load
    componentDidMount() {
       this.signedInId(); 
    }

    //to post fetch('/route' {POST})
    signedInId () {
        fetch('/session-info.json')
        //specifying response is a json object
        .then(response => response.json())
        //seting user_id state to user_id
        .then(data => {
            this.setState({user_id:data.user_id})
        })
    }

    render() {
        if( this.state.user_id ) {
            return (
                <div id="UserActionList">
                <p>Signed is as user: {this.state.user_id} </p>
                <ul>
                    <li>
                        <a href={"/user/" + this.state.user_id}>View Your Page</a>
                    </li>
                    <li>
                        <a href="/signout">Sign Out</a>
                    </li>
                </ul>
                </div>
            )

        } else{
            return (
                <div id="UserActionList">
                <li>
                    <a href="/signin">Sign In</a>
                </li>
                <li>
                    <a href="/register">Create an account</a>
                </li>
                </div>

        )}
    }
}


ReactDOM.render(
    //custom divs 
    <div id="wrapper">
        <ItemActionList />
        <h2>User Actions</h2>
        <UserActionsList />
    </div>,
    //div to render in
    document.getElementById('root'),
);