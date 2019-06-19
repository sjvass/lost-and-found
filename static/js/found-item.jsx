"use strict";

//renders html for FountItem tag
class FoundItem extends React.Component {
     constructor() {
        super();
        //initalize state with url path
        this.state = {urlPath: window.location.pathname};
        this.handleMessage = this.handleMessage.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    //on load
    componentDidMount() {
        this.getFoundInfo();
        this.getCurrUser();
    }


    //get found info
    getFoundInfo() {
        fetch(this.state.urlPath+"/item.json")
        .then(response => response.json())
        .then(data => {
            this.setState({imgName:data.img_name,
                            location:data.location,
                            user:data.user,
                            found:data.found})
        })
    }

    //get signed in user info
    getCurrUser() {
        fetch("/session-info.json")
        .then(response => response.json())
        .then(data => {
            this.setState({curr_user:data.user_id})
        })
    }

    handleMessage(evt) {
        evt.preventDefault();

        fetch('/new-message/info.json', {
            method: 'POST',
            body: JSON.stringify({to:this.state.user.user_id,
                            subject:this.state.found.title}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        .then(() => {
            window.location.href = "/new-message"
        });
    }

    handleDelete(evt) {
        evt.preventDefault();

        fetch('/delete-found', {
            method: 'POST',
            body: JSON.stringify({found_id:this.state.found.found_id}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        .then(() => {
            window.location.href = "/user/" + this.state.curr_user;
        });

    }

    render() {

        //if get request successful
        if(this.state.found) {
            //set declare optional fields with N/A
            let description = "N/A";

            //if optional field is specified, display value
            if(this.state.found.description) {
                description = this.state.found.description;
            }

            //format location data as a string
            const location = this.state.location;

            //if there's an image
            let imgElement;
            if(this.state.imgName) {
                imgElement = <img src={'/static/' + this.state.imgName}/>;
            }


            let bottomForm;
            //if items was reported by current user
            if(this.state.curr_user === this.state.user.user_id) {
                bottomForm = <form onSubmit={this.handleDelete} method="POST">
                                <input type="submit" value="Delete this entry"/>
                            </form>
            }
            else {
                bottomForm = <form onSubmit={this.handleMessage} method="POST">
                                <input type="submit" value={"Send " + this.state.user.fname + " a message"}/>
                            </form>
            }

            //formatting address
            let title;
            if(location.title) {
                title = <p> {location.title} </p>
            }

            let address1;
            if(location.address1) {
                address1 = <p> {location.address1} </p>
            }

            let address2;
            if(location.address2) {
                address2 = <p> {location.address2} </p>
            }

            return(
                <div id="foundItem-wrapper">
                    <h2>{this.state.found.title}</h2>
                    {imgElement}
                    <h3>Description:</h3>
                    <p>{description}</p>
                    <h3>Found by:</h3>
                    <a href={"/user/" + this.state.user.user_id}>
                        {this.state.user.fname} {this.state.user.lname}
                    </a>
                    <h3>Found at:</h3>
                    <div id="address">
                        {title}
                        {address1}
                        {address2}
                        {location.city + ','} {location.state} {location.zipcode}
                    </div>
                    {bottomForm}
                    <a href="/found">
                        Return to Found Items
                    </a>
                </div>
            )

        //if request not completed
        } else {
            return(
                <p>Loading...</p>
            )
        }
    }
}


ReactDOM.render(
    <FoundItem />,
    document.getElementById('root')
);