import os

import requests

from datetime import datetime

from jinja2 import StrictUndefined

from flask import (Flask, render_template, redirect, request, flash,
                    session, jsonify)

# from flask_debugtoolbar import DebugToolbarExtension

from model import User, Location, Lost, Found, Image, Message, connect_to_db, db


app = Flask(__name__)

# Required to use Flask sessions and the debug toolbar
app.secret_key = "ABC"

# Normally, if you use an undefined variable in Jinja2, it fails
# silently. This is horrible. Fix this so that, instead, it raises an
# error.
app.jinja_env.undefined = StrictUndefined

APP_ROOT = os.path.dirname(os.path.abspath(__file__))



@app.route('/')
def index():
    """homepage"""

    return render_template('homepage.html')

@app.route('/session-info.json')
def send_session_info():
    """Sends out a json of who is signed in"""

    session_info = {}

    if is_signed_in():
        session_info = {'user_id': session['user_id']}
    else:
        session_info = {'user_id': None}

    return jsonify(session_info)

@app.route('/signin', methods=['GET'])
def signin_form():
    """user sign in form"""
    #if they are already signed in
    if is_signed_in():
        user = User.query.filter_by(user_id=session['user_id']).first()
        flash("You are already signed in as {email}".format(email=user.email))
        return redirect('/')
    else:
        return render_template('sign-in.html')

@app.route('/signin', methods=['POST', 'GET'])
def user_signin():
    """Handles user sign in"""

    email = request.json['email']
    password = request.json['password']

    #gets user with specified email
    user = User.query.filter_by(email=email).first()

    #checks email exists and password and username are correct
    if (user is not None and user.password == password):

        session['user_id'] = user.user_id
        flash("Signed in")
        return redirect('/')
    else:
        flash("Sign in unsucessful")
        return redirect('signin')


@app.route('/register', methods=['GET'])
def create_account_form():
    """form to create account for new user"""
    if is_signed_in():
        user = User.query.filter_by(user_id=session['user_id']).first()
        flash("You are already signed in as {email}".format(email=user.email))
        return redirect('/')
    else:
        return render_template('register.html')

@app.route('/register', methods=['POST'])
def create_account():
    """creates a new user account with their input"""

    #get form input
    fname = request.form.get('fname')
    lname = request.form.get('lname')
    email = request.form.get('email')
    password1 = request.form.get('password1')
    password2 = request.form.get('password2')

    #check passwords match
    if password1 != password2:
        flash("Passwords don't match. Please try again.")
        return redirect('/register')
    #check if email already in database
    elif check_for_user(email):
        flash('A user with that eamil already exists. Plase try another email or sign in"')
        return redirect('/register')
    else:
        #create new user with input
        new_user = User(fname=fname,
                        lname=lname,
                        email=email,
                        password=password1)

        #add new_user to users and commit change
        db.session.add(new_user)
        db.session.commit()

        user = User.query.filter_by(email=email).first()

        #log user in
        session['user_id'] = user.user_id

        #flash sucess message
        flash('Registration complete. You are now signed in as {email}'.format(email=email))
        session.modified = True
        return redirect('/user/' + str(session['user_id']))


@app.route('/signout')
def sign_out():
    """signs user out"""
    if is_signed_in(): 
        session.pop('user_id')

        flash("Signed out")
    else:
        flash("No user signed in")

    return redirect('/')

@app.route('/user/<user_id>')
def user_info(user_id):
    """loads user's account information"""

    return render_template('user-page.html')

@app.route('/user/<user_id>/info.json')
def send_user_info(user_id):
    """sends info about user as json"""
    user = User.query.filter_by(user_id=user_id).one()

    losts = Lost.query.filter_by(user_id=user_id).order_by(Lost.time).all()

    founds = Found.query.filter_by(user_id=user_id).order_by(Found.time).all()

    curr_user_id = None

    if(is_signed_in()):
        curr_user_id = session['user_id']

    user_info = {'user': user.to_dict(),
                 'curr_user_id': curr_user_id,
                 'losts': [lost.to_dict() for lost in losts],
                 'founds': [found.to_dict() for found in founds],
                 'messages': get_messages(user_id)}

    return jsonify(user_info)

def get_messages(user_id):
    """if current user, gets their messages, else returns None"""

    messages = None

    if is_current_user(user_id):
        messages_query = Message.query.filter_by(to_id=user_id).options(
            db.joinedload('from_user')).order_by(Message.send_time).all()
        messages = [{'msg':message.to_dict(),
                     'from_user':message.from_user.to_dict()} for message in messages_query]

    return messages        

  

@app.route('/new-message', methods=['GET', 'POST'])
def new_msg_form():
    """renders form for createing a new message"""

    return render_template('msg-new.html')


@app.route('/new-message/info.json', methods=['GET','POST'])
def new_msg_info():
    """sends out json info with autofill message info"""
    if request.method == 'POST':
        to_user_id = request.json.get('to')
        subject = request.json.get('subject')
        
        to_user = None

        if to_user_id:
            to_user = User.query.filter_by(user_id=int(to_user_id)).one()

        curr_user = User.query.filter_by(user_id=session['user_id']).one()

        if subject:
            subject = "Re: " + subject

        msg_dict = {'to_user': to_user.to_dict(),
                    'from_user': curr_user.to_dict(),
                    'subject': subject}
        session['new_msg'] = msg_dict
        session.modified = True

    return jsonify(session['new_msg'])
    




@app.route('/message', methods=['POST'])
def send_msg():
    """adds new message to messages"""

    to_user_id = request.json.get('to')
    subject = request.json.get('subject')
    body = request.json.get('body')

    if to_user_id and subject and body:
        new_msg = Message(from_id=session['user_id'],
                            to_id=int(to_user_id),
                            subject=subject,
                            body=body,
                            read=False,
                            send_time=datetime.now())
        db.session.add(new_msg)
        db.session.commit()

        flash("Message sent")
    else:
        flash("something went wrong with your message. Try again.")
    return redirect('/user/' + str(session['user_id']))



@app.route('/message/<msg_id>')
def view_msg(msg_id):
    """loads view of message"""

    msg = Message.query.filter_by(msg_id=msg_id).one()

    #check that user is recipient
    if is_current_user(msg.to_id):
        msg.read = True
        db.session.commit()
        return render_template('msg-view.html', msg=msg)
    return redirect('user/' + str(session['user_id']))

@app.route('/message/<msg_id>/info.json')
def message_info(msg_id):
    """returns a json object of information in message for client side"""
    msg = Message.query.filter_by(msg_id=msg_id).options(db.joinedload('from_user'), db.joinedload('to_user')).one()

    msg_info_dict = {'msg': msg.to_dict(),
                     'to_user': msg.to_user.to_dict(),
                     'from_user': msg.from_user.to_dict()}

    return jsonify(msg_info_dict)



@app.route('/delete-message', methods=['POST'])
def delete_msg():
    """deletes message with specified msg_id"""

    msg_id = request.json.get('msg_id')

    Message.query.filter_by(msg_id=int(msg_id)).delete()
    db.session.commit()

    flash("Message deleted")

    return redirect('/user/' + str(session['user_id']))



###############################
#LOST functions

@app.route('/lost')
def lost():
    """displays list of losts"""

    return render_template('lost.html')

@app.route('/losts.json')
def send_losts():
    """returns a json list of all lost item titles"""

    losts = Lost.query.order_by(Lost.time).all()

    lost_list = [{'title':lost.title,
                    'lost_id':lost.lost_id} for lost in losts]

    return jsonify(lost_list)


@app.route('/lost/<lost_id>')
def lost_item(lost_id):
    """Displays information about specified lost item"""
    return render_template('lost-item.html')


@app.route('/lost/<lost_id>/item.json')
def send_lost_item(lost_id):
    """sends info about lost item as json"""

    lost = Lost.query.filter_by(lost_id=lost_id).first()

    user = User.query.filter_by(user_id=lost.user_id).one()

    location = Location.query.filter_by(location_id=lost.location_id).one()

    image = Image.query.filter_by(lost_id=lost_id).first()

    img_name = None

    if image:
        get_result = get_img(image)

        #adds the image folder to the name of the file so jinja can find it
        img_name = 'img/' + image.img_name


    lost_item = {'lost': lost.to_dict(),
                 'user': user.to_dict(),
                 'location': location.to_dict(),
                 'img_name': img_name}


    return jsonify(lost_item)




@app.route('/report-lost', methods=['GET'])
def lost_form():
    """checks if user is signed in and renders report lost template"""
    if is_signed_in():
        return render_template('lost-form.html')
    else:
        flash("You must be signed in to report a lost item.")
        return redirect('/signin')

@app.route('/report-lost', methods=['POST'])
def report_lost():
    """adds new item to losts"""

    title = request.form.get('title')
    description = request.form.get('description')
    location = request.form.get('location')
    reward = float(request.form.get('reward'))

    print(reward)

    if not reward or reward == 'undefined':
        reward = None

    geocoding_info = get_geocoding(location)


    location_id = get_location_id(geocoding_info['lat'], geocoding_info['lng'])

    if not location_id:
        new_location = Location(address1=geocoding_info['street'],
                                city=geocoding_info['city'],
                                zipcode=geocoding_info['zipcode'],
                                state=geocoding_info['state'],
                                lat=geocoding_info['lat'],
                                lng=geocoding_info['lng'])

        db.session.add(new_location)

        # location_id = get_location_id(lat, lng)
        db.session.flush()
        location_id = new_location.location_id


    #add item to found database
    new_lost = Lost(title=title,
                        description=description,
                        location_id=location_id,
                        user_id=session['user_id'],
                        time=datetime.now(),
                        reward=reward)
    db.session.add(new_lost)


    db.session.flush()

    new_lost_id = new_lost.lost_id

    #if an image was uploaded, store it in the database
    if 'file' in request.files:
        file = request.files['file']

        img_name = 'l' + str(new_lost_id) + file.filename

        new_image = Image(img_name=img_name,
                          img_data=file.read(),
                          lost_id=new_lost_id)

        db.session.add(new_image)



    db.session.commit()


    return redirect('/lost')

@app.route('/delete-lost', methods=['POST'])
def delete_lost():
    """deletes lost item from losts"""
    lost_id = request.json.get('lost_id')

    Image.query.filter_by(lost_id=int(lost_id)).delete()

    Lost.query.filter_by(lost_id=int(lost_id)).delete()
    db.session.commit()

    return redirect('/')




###############################
#FOUND functions

@app.route('/found')
def found():
    """displays a list of founds"""

    founds = Found.query.order_by(Found.time).all()

    return render_template('found.html', founds=founds)

@app.route('/founds.json')
def send_founds():
    """returns a json list of all found item titles"""

    founds = Found.query.order_by(Found.time).all()

    found_list = [{'title':found.title,
                    'found_id':found.found_id} for found in founds]

    return jsonify(found_list)


@app.route('/found/<found_id>')
def found_item(found_id):
    """Displays information about specified found item"""

    return render_template('found-item.html')



@app.route('/found/<found_id>/item.json')
def send_found_item(found_id):
    """sends info about found item as json"""

    found = Found.query.filter_by(found_id=found_id).first()

    user = User.query.filter_by(user_id=found.user_id).one()

    location = Location.query.filter_by(location_id=found.location_id).one()

    image = Image.query.filter_by(found_id=found_id).first()

    img_name = None

    if image:
        get_result = get_img(image)

        #adds the image folder to the name of the file so jinja can find it
        img_name = 'img/' + image.img_name


    found_item = {'found': found.to_dict(),
                 'user': user.to_dict(),
                 'location': location.to_dict(),
                 'img_name': img_name}


    return jsonify(found_item)



@app.route('/report-found', methods=['GET'])
def found_form():
    if is_signed_in():
        return render_template('found-form.html')
    else:
        flash("You must be signed in to report a found item.")
        return redirect('/signin')

@app.route('/report-found', methods=['POST'])
def report_found():
    """adds new item to founds"""

    if(request.form):

        print(request.form)
        print(request.files)

        title = request.form.get('title')
        description = request.form.get('description')
        location = request.form.get('location')

        geocoding_info = get_geocoding(location)


        location_id = get_location_id(geocoding_info['lat'], geocoding_info['lng'])

        if not location_id:
            new_location = Location(address1=geocoding_info['street'],
                                    city=geocoding_info['city'],
                                    zipcode=geocoding_info['zipcode'],
                                    state=geocoding_info['state'],
                                    lat=geocoding_info['lat'],
                                    lng=geocoding_info['lng'])

            db.session.add(new_location)

            # location_id = get_location_id(lat, lng)
            db.session.flush()
            location_id = new_location.location_id


        #add item to found database
        new_found = Found(title=title,
                            description=description,
                            location_id=location_id,
                            user_id=session['user_id'],
                            time=datetime.now())
        db.session.add(new_found)


        db.session.flush()

        new_found_id = new_found.found_id

        #if an image was uploaded, store it in the database
        if 'file' in request.files:
            file = request.files['file']

            img_name = 'f' + str(new_found_id) + file.filename

            new_image = Image(img_name=img_name,
                              img_data=file.read(),
                              found_id=new_found_id)

            db.session.add(new_image)



        db.session.commit()


    return redirect('/found')

@app.route('/delete-found', methods=['POST'])
def delete_found():
    """deletes a found item from the database"""
    found_id = request.json.get('found_id')

    Image.query.filter_by(found_id=int(found_id)).delete()

    Found.query.filter_by(found_id=int(found_id)).delete()
    db.session.commit()

    pass


###############################
#API functions

@app.route('/api/lost')
def lost_info():
    """JSON info about losts"""

    #messages = Message.query.filter_by(to_id=user_id).options(db.joinedload('from_user')).order_by(Message.send_time).all()

    losts = Lost.query.options(db.joinedload('location'), 
                        db.joinedload('user')).order_by(Lost.time).limit(50)

    for lost in losts:
        if not lost.location.lat or not lost.location.lng:
            update_location(lost.location)

    #list comprehension
    losts_json = [
        {
            "id": lost.lost_id,
            "title": lost.title,
            "description": lost.description,
            "user_fname": lost.user.fname,
            "user_lname": lost.user.lname,
            "reward": lost.reward,
            "time": lost.time,
            "lat": lost.location.lat,
            "lng": lost.location.lng
            
        }
        for lost in losts
    ]

    return jsonify(losts_json)

@app.route('/api/found')
def found_info():
    """JSON info about founds"""

    founds = Found.query.options(db.joinedload('location'), 
                        db.joinedload('user')).order_by(Found.time).limit(50)

    for found in founds:
        if not found.location.lat or not found.location.lng:
            update_location(found.location)

    #list comprehension
    founds_json = [
        {
            "id": found.found_id,
            "title": found.title,
            "description": found.description,
            "user_fname": found.user.fname,
            "user_lname": found.user.lname,
            'user_id': found.user.user_id,
            "time": found.time,
            "lat": found.location.lat,
            "lng": found.location.lng,
            
        }
        for found in founds
    ]

    return jsonify(founds_json)

def update_location(location):
    """Completes location entries using Google Geocoding"""

    lookup_str = location.title

    if not lookup_str:
        if location.address1:
            lookup_str += location.address1 + ', '
        
        if location.address2:
            lookup_str += location.address2 + ', '
        
        lookup_str += (location.city + ', ' + location.state + ' ' 
                        + location.zipcode)

    geocode = get_geocoding(lookup_str)

    location.lat = geocode['lat']
    location.lng = geocode['lng']

    db.session.commit()



###########################################
#helper functions

#USER
def check_for_user(email):
    """Checks if email is already in users"""
    user = User.query.filter_by(email=email).first()

    if user:
        return True
    else:
        return False


def is_signed_in():
    """checks if a user is currently signed in"""
    return 'user_id' in session

def is_current_user(user_id):
    """Checks that there is a user signed in and that that user is the same as user_id"""

    return is_signed_in() and int(user_id) == session['user_id']


#LOCATION
def get_geocoding(location):
    """Gets location information from Google geocoding API"""

    #get geocoded location from API

    url = 'https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={API_key}'.format(
        address=location, API_key=os.environ.get('GOOGLE_API_KEY'))

    # print(os.environ.get('GOOGLE_API_KEY'))

    response = requests.get(url)

    data = response.json()

    results = data['results'][0]

    # for key in results:
    #     print(key)
    #     print(results[key])

    address = results['formatted_address']
    lat = results['geometry']['location']['lat']
    lng = results['geometry']['location']['lng']

    #TODO: fix if no address, just title
    street_address, city, state_zip, country = address.split(', ')
    state, zipcode = state_zip.split(' ')

    return {'street':street_address, 'city':city, 'state':state,
            'zipcode':zipcode, 'lat':lat, 'lng':lng}

def get_location_id(lat, lng):
    """checks if a place with matching lat and lng already in locations"""
    location = Location.query.filter((Location.lat==lat) & (Location.lng==lng)).first()

    #if location exists, return its id
    if location:
        return location.location_id
    return False


#IMAGE
def get_img(image):
    """gets an image from db and saves it to server"""

    #get path to save img
    img_path = os.path.join(APP_ROOT, 'static/img')

    #make directory if it doesnt exist
    if not os.path.isdir(img_path):
        os.mkdir(img_path)


    #save img
    destination = "/".join([img_path, image.img_name])

    #check if file already loaded into static/img
    if os.path.isfile(destination):
        print("file already loaded")
        return 0

    #create image file
    img_file = open(destination, 'wb')
    #write blob data to image file
    img_file.write(image.img_data)

    #close file
    img_file.close()

    #return success
    return 1


#serve js files
@app.route("/static/<path:resource>")
def get_resource(resource):
    return send_from_directory("static", resource)



if __name__ == "__main__":
    # We have to set debug=True here, since it has to be5000 True at the
    # point that we invoke the DebugToolbarExtension
    app.debug = False
    # make sure templates, etc. are not cached in debug mode
    app.jinja_env.auto_reload = app.debug

    connect_to_db(app)

    # Use the DebugToolbar
    # DebugToolbarExtension(app)

    app.run(port=5000, host='0.0.0.0')