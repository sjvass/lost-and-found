/*react file for lost items page*/
"use strict";

//renders lost items html
class LostItems extends React.Component {

    //overridden constructor
    constructor() {
        super();
        this.state = {};
    }

    //execute on load
    componentDidMount() {
        this.getLosts();
    }

    //gets information about lost items from server
    getLosts() {
        fetch('/losts.json')
        .then(response => response.json())
        .then(data => {
            this.setState({losts:data});
        });
    }

    render() {
        //if losts loaded
        if(this.state.losts) {

            //convert losts to html
            const lostLst = this.state.losts.map((lost) =>
                <a href={"/lost/" + lost.lost_id}>
                    <li key={lost.lost_id}>
                        {lost.title}
                    </li>
                </a>
            );

            //html
            return(
                <div id="LostItems">
                    <h2>Lost Items</h2>
                    {lostLst}
                </div>
            )

        } else {
            return(
                <p>Loading...</p>
            )
        }
    }

}

ReactDOM.render(
    <div id="losts-wrapper">
        <LostItems />
    </div>,
    document.getElementById('root')
);