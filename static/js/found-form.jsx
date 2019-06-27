"use strict";

class ReportFound extends React.Component {
    
    constructor() {
        super();
        //initalize empty state object
        this.state = {};
        //bind event handlers
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.addFile = this.addFile.bind(this);
    }

    // when any form input changed, saves its value to state
    handleInputChange(inName) {
        return evt => {
            this.setState({
                [inName]: evt.target.value
            });
        }
    }

    //posts image to server
    addFile(evt) {
        evt.preventDefault();

        let files = evt.target.files;

        const reader = new FileReader();
        reader.onloadend = (e) => {
            const targetWithResult = e.target;
            if (!targetWithResult.result) {
                console.error('result failed to result');
             }
            this.setState({ file: files[0] });
        };
        reader.readAsDataURL(files[0]);
    }




    //submit data about item to server
    handleSubmit(evt) {
        evt.preventDefault();

        const formData = new FormData(this.refs.form);

        formData.set('title', this.state.title);
        formData.set('description', this.state.description);
        formData.set('location', this.state.location);

        formData.append('file', this.state.file);

        fetch('/report-found', {
            method: 'POST',
            body: formData
        })
        .then(() => {
            window.location.href = "/found";
        });
    }

    render() {
        return(
            <div className="wrapper" id="reportFound-wrapper" ref="form">
                <h2>Report A Found Item</h2>
                <form onSubmit={this.handleSubmit} method="POST" encType="multipart/form-data">
                    <label><strong>Title</strong></label>
                    <p>Enter a few word description of the item</p>
                    <input type="text" name="title" required onChange={this.handleInputChange('title')} />
                    <br/>

                    <br/>
                    <label><strong>Description</strong></label>
                    <p>A more detailed description of the item. List any identifying 
                        marks or deials such as size, brand, color, pattern, damage, 
                        etc.</p>
                    <textarea rows="5" cols="30" id="description" name="description" onChange={this.handleInputChange('description')} />
                    <br/>

                    <br/>
                    <label><strong>Picture</strong></label>
                    <p>Add a picture of the item</p>
                    <input type="file" name="picture" accept="image/" onChange={this.addFile} />
                    <br/>

                    <br/>
                    <label><strong>Location</strong></label>
                    <p>Enter the place or address where you found the item</p>
                    <input type="text" name="location" required onChange={this.handleInputChange('location')} />
                    <br/>

                    <input type="submit" value="Submit Found Item" />
                </form>
            </div>
        )
    }
}


ReactDOM.render(
    <ReportFound />,
    document.getElementById('root')
)