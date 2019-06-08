/*react file for found items page*/
"use strict";

//renders found items html
class FoundItems extends React.Component {

    //overridden constructor
    constructor() {
        super();
        this.state = {};
    }

    //execute on load
    componentDidMount() {
        this.getFounds();
    }

    //gets information about found items from server
    getFounds() {
        fetch('/founds.json')
        .then(response => response.json())
        .then(data => {
            this.setState({founds:data});
        });
    }

    render() {
        //if founds loaded
        if(this.state.founds) {

            //convert founds to html
            const foundLst = this.state.founds.map((found) =>
                <li key={found.found_id}>
                    <a href={"/found/" + found.found_id}>
                        {found.title}
                    </a>
                </li>
            );

            //html
            return(
                <div id="foundItems">
                    <h2>Found Items</h2>
                    <ul>
                        {foundLst}
                    </ul>
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
    <div id="founds-wrapper">
        <FoundItems />
    </div>,
    document.getElementById('root')
);