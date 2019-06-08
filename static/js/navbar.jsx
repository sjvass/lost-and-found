"use strict";

class Navbar extends React.Component {
    constructor() {
        super();
        this.state = {};
    }

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
        console.log(this.state.user_id);
        // if(this.state.user_id !== undefined) {
            return(
                <div id="navbar">
                    <ul>
                        <li class="home">
                            <a href="/">
                                Lost and Found
                            </a>
                        </li>
                        <li class="dropdown">
                            <a href="javascript:void(0)" class="dropbtn">Lost</a>
                            <div class="dropdown-content">
                              <a href="/lost">View Lost Items</a>
                              <a href="/report-lost">Report a Lost Item</a>
                            </div>
                        </li>
                        <li class="dropdown">
                            <a href="javascript:void(1)" class="dropbtn">Found</a>
                            <div class="dropdown-content">
                              <a href="/found">View Found Items</a>
                              <a href="/report-found">Report a Found Item</a>
                            </div>
                        </li>
                        <li class="dropdown">
                            <a href="javascript:void(2)" class="dropbtn">Account</a>
                            <div class="dropdown-content">
                              <a href="/found">View Found Items</a>
                              <a href="/report-found">Report a Found Item</a>
                            </div>
                        </li>
                    </ul>
                </div>
            )
        // }
        // else {
        //     return(<p>Loading...</p>);
        // }
    }
}

ReactDOM.render(
    <Navbar/>,
    document.getElementById('navbar1')
)